---
layout: post
title: 将hiagent转为openai api格式以便给openclaw使用
date: 2026-04-20 10:30:00 +0800
categories: project-logs tech-exploration
tags: openclaw agent
---

最近想把南开的 hiagent 放到 openclaw 里用，从而节约一些 token。但这个 hiagent 是一个会话形式的智能体，而 openclaw 目前并不支持会话形式的智能体，只支持几种主流的调用格式比如 openai api 格式，所以需要先把把 hiagent 转换成 openai api 的格式。

注意：本文提到的 hiagent 都特指南开提供的这个 hiagent，而并非火山引擎或者其他的 hiagent。

项目地址：[https://github.com/lxmghct/nankai-hiagent-proxy](https://github.com/lxmghct/nankai-hiagent-proxy)

# 1. 核心问题及解决方案
## 1.1. 会话形式转为无状态的调用格式
hiagent 的会话形式意味着它会在内部维护一个状态，包括之前的对话。在对话前需要获取`AppConversationId`，并在后续的对话中持续使用这个 ID 来维持会话状态。要想将这种形式转为无状态的调用格式，需要建立一个映射关系，一个比较简单粗暴的做法就是维护一个前几轮历史对话到`AppConversationId`的映射表，每次新的对话请求时，先根据当前的历史对话去查这个映射表，如果找到了对应的`AppConversationId`，就直接使用它；如果没有找到，就创建一个新的会话并获取新的`AppConversationId`，然后把这个新的 ID 和当前的历史对话一起存到映射表里。

不过考虑到映射表性能的问题，所以还是给前几轮对话建立一个哈希值，直接保存这个哈希值到`AppConversationId`的映射，这样就可以快速地通过哈希值来查找对应的会话 ID。

还有个问题是前几轮对话到底多少轮比较合适。如果轮数太多，前几轮对话默认没法确定唯一的`AppConversationId`，那么前几轮就会反复的去创建会话，虽然可行但没那么优雅。如果只有一轮那么重复概率很高，更何况 openclaw 的首轮对话往往是工具调用，重复概率就更大了。不过好在 openclaw 会把时间信息和用户问题一起发送过来：
```
[{'type': 'text', 'text': 'Sender (untrusted metadata):\n```json\n{\n  "label": "openclaw-tui (gateway-client)",\n  "id": "gateway-client",\n  "name": "openclaw-tui",\n  "username": "openclaw-tui"\n}\n```\n\n[Wed 2026-04-22 01:54 GMT+8] 你好'}]
```
这样基本一轮对话都不需要，只要一个prompt就可以唯一确定一个会话了。不过考虑到并发问题，而且这里的时间戳是到秒的，所以还是拿到该问题的回答后，再把这个问题和回答一起存到映射表里，这样就更保险了。

## 1.2. 工具调用问题
hiagent 并不提供标准的工具调用接口，输入和输出都只有纯文本格式。一般来说这种情况只要在输入输出里约定好一个格式就可以了，比如输入里约定好工具调用的格式，输出里约定好工具调用结果的格式，这样就可以通过解析输入输出的文本来实现工具调用了。但是在实际使用过程中，经常会出现下面的情况，比如我约的了用`[[[HIAGENT_TOOL_CALL]]]`和`[[[END_HIAGENT_TOOL_CALL]]]`：
```
<tool_call>[HIAGENT_TOOL_CALL]]]
{
"name": "read",
"arguments": {
"path": "/home/..."
}
}
[[[END_HIAGENT_TOOL_CALL]]]
```
可以看到上面的标签被不知道从哪出来的`<tool_call>`标签给打乱了，导致工具调用的格式被破坏了，无法正确解析工具调用的内容了。

此时有两个解决方法:

1. 继续兼容这种混合标签的解析方式，增加对这种情况的处理逻辑（优先级较低，因为不规范且不稳定）
2. 取消新约定的`[[[HIAGENT_XXX]]]`标签，统一使用hiagent内部约定的`<tool_call>`标签。目前经过测试可能的格式为：

```
<tool_call>{"name": "read", "arguments": {"path": "/home/..."}}

<tool_call>read{"path": "/home/..."}

<tool_call>[{"name": "read", "arguments": {"path": "/home/..."}}, {"name": "write", "arguments": {"path": "/home/...", "content": "hello world"}}]
```
这里还会有一个潜在问题就是json格式不规范，目前遇到最多的就是arguments字段格式是有异常的，变成了：
```
"arguments": "{"path": "/home/..."}"
```
给一个本来没问题的 json 对象加了一层引号，导致解析失败了。目前仅发现了这个问题，在代码里已做了兼容处理。


# 2. 实现思路与关键代码示例
使用 FastAPI 来实现一个适配器服务，用 `@app.post("/v1/chat/completions")` 来接收 openclaw 的请求，在这个接口里先把 openclaw 的请求转换成 hiagent 的输入格式，然后调用 hiagent 来获取回答，最后再把 hiagent 的回答转换成 openclaw 需要的输出格式返回给 openclaw 就可以了。

## 2.1. 工具格式约定
在 prompt 里约定工具调用的格式:
```python
TOOL_INSTRUCTION = """
## Tool calling rules

When you need to call a tool, you MUST use the following format.

<tool_call>
{
  "name": "tool_name",
  "arguments": { JSON }
}

Rules:
- Output ONLY the <tool_call> block
- Do NOT explain anything
- Do NOT use markdown
- Do NOT add extra text
- Do NOT wrap in code blocks
- arguments MUST be valid JSON object
- If multiple tools are needed, output multiple <tool_call> blocks sequentially
- If no tool is needed, answer normally

Example:

User: read file
Assistant:
<tool_call>
{
  "name": "read",
  "arguments": {
    "path": "/home/test.txt"
  }
}

For multiple tool calls, you may also output:

<tool_call>
[
  {
    "name": "tool1",
    "arguments": {...}
  },
  {
    "name": "tool2",
    "arguments": {...}
  }
]

"""
```

## 2.2. 构造 hiagent 输入格式
将 openclaw 的请求转换成 hiagent 的输入格式:

```python


def build_prompt_from_messages(messages, tools=None, create_new=False):
    parts = []

    # ---------- messages ----------
    for m in messages:
        role = m.get("role")
        content = m.get("content")

        if create_new and role == "system" and not HIAGENT_HAS_OPENCLAW_PROMPT and content:
            # if HIAGENT_HAS_OPENCLAW_PROMPT and content.startswith("You are a personal assistant running inside OpenClaw."):
            #     continue
            parts.append(f"[system]\n{content}")
            parts.append(f"\n{TOOL_INSTRUCTION.strip()}")

            # ---------- tools schema ----------
            if tools:
                tool_desc = ["Available tools:\n"]

                for t in tools:
                    func = t.get("function", {})
                    name = func.get("name")
                    desc = func.get("description", "")
                    params = func.get("parameters", {})

                    tool_desc.append(f"Tool: {name}")
                    if desc:
                        tool_desc.append(f"Description: {desc}")

                    if params:
                        tool_desc.append("Parameters JSON schema:")
                        tool_desc.append(json.dumps(params, indent=2, ensure_ascii=False))

                    tool_desc.append("")

                parts.append("\n".join(tool_desc))

        elif role == "user" and content:
            parts.append(f"[user]\n{content}")

        elif role == "assistant":
            tool_calls = m.get("tool_calls")

            if tool_calls:
                # {"role": "assistant", "content": null, "tool_calls": [{"id": "call08690af73f584d3386d63b10509f55d9", "type": "function", "function": {"name": "read", "arguments": "{\"path\":\"/home/devuser/.openclaw/workspace/SOUL.md\"}"}}, {"id": "call937287b1a26e4c83aed8a9fdd261ec3c", "type": "function", "function": {"name": "read", "arguments": "{\"path\":\"/home/devuser/.openclaw/workspace/USER.md\"}"}}]}
                parts.append("[assistant]\n" + json.dumps(tool_calls, ensure_ascii=False))
            elif content:
                # {"role": "assistant", "content": [{"type": "text", "text": "Hey. I'm back online. \n\nI see we're still getting to know each other — your profile's pretty blank. What's on your mind? "}]}
                parts.append(f"[assistant]\n{content}")

        elif role == "tool":
            #  {"role": "tool", "content": "Successfully wrote 269 bytes to /home/xxx", "tool_call_id": "call76e5d5301407447f833d9b71b973ecc7"}
            call_id = m.get("tool_call_id", "")
            parts.append(f"[tool:{call_id}]\n{content}")

    # parts.append("[assistant]")

    return "\n\n".join(parts)
```

## 2.3. 解析 hiagent 输出格式
然后是处理 hiagent 的回答并转换成 openclaw 需要的输出格式，先进行工具提取：

```python
def parse_hiagent_tool_calls(text: str):
    tool_calls = []

    # ---------- <tool_call> ----------
    idx = 0
    while True:
        start = text.find("<tool_call>", idx)
        if start == -1:
            break

        cursor = start + len("<tool_call>")

        # 跳过空白
        while cursor < len(text) and text[cursor].isspace():
            cursor += 1

        if cursor >= len(text):
            break

        # ---------- 情况 A: 直接 JSON 对象 ----------
        if text[cursor] in "{[":
            json_str, end = _extract_balanced_json(text, cursor)
            if json_str:
                try:
                    data = json.loads(json_str)

                    # 如果是数组
                    if isinstance(data, list):
                        for item in data:
                            func = item.get("function", item)
                            tool_calls.append(
                                HiAgentToolCall(
                                    id=item.get("id") or f"call_{uuid.uuid4().hex}",
                                    name=func.get("name"),
                                    arguments=normalize_arguments(
                                        func.get("arguments", {})
                                    ),
                                )
                            )
                    else:
                        tool_calls.append(
                            HiAgentToolCall(
                                id=data.get("id") or f"call_{uuid.uuid4().hex}",
                                name=data.get("name"),
                                arguments=normalize_arguments(
                                    data.get("arguments", {})
                                ),
                            )
                        )

                    idx = end
                    continue
                except Exception:
                    pass

        # ---------- 情况 B: name{...} ----------
        name_match = re.match(r"([a-zA-Z_][a-zA-Z0-9_]*)", text[cursor:])
        if name_match:
            name = name_match.group(1)
            cursor += len(name)

            while cursor < len(text) and text[cursor].isspace():
                cursor += 1

            if cursor < len(text) and text[cursor] == "{":
                json_str, end = _extract_balanced_json(text, cursor)
                if json_str:
                    try:
                        args = json.loads(json_str)
                        tool_calls.append(
                            HiAgentToolCall(
                                id=f"call_{uuid.uuid4().hex}",
                                name=name,
                                arguments=args,
                            )
                        )
                        idx = end
                        continue
                    except Exception:
                        pass

        idx = cursor + 1

    if tool_calls:
        return tool_calls, None

    return None, text
```

最后是把提取到的工具调用转换成 openclaw 需要的格式，注意 openclaw 默认是 streaming 的，所以需要把工具调用的结果也以流式的格式返回。虽然 hiagent 的接口也支持 steaming 参数，但是经过实践发现这个流式是假的，虽然是流式的返回格式，但是它并不会在工具调用结果出来后就立刻返回，而是等到整个回答结束才一次性返回，而且流式的格式也是 hiagent 自己定义的，并不完全符合 openclaw 的流式格式，所以不如就调用它的 blocking 接口再自己转成流式的格式了。

```python
from fastapi.responses import StreamingResponse


def sse_pack(data):
    return f"data: {json.dumps(data, ensure_ascii=False)}\n\n"


def build_stream_text_chunks(text, model="custom-model", chunk_size=10):
    for i in range(0, len(text), chunk_size):
        chunk = text[i:i+chunk_size]
        yield sse_pack({
            "id": f"chatcmpl-{uuid.uuid4()}",
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": model,
            "choices": [{
                "index": 0,
                "delta": {"content": chunk},
                "finish_reason": None
            }]
        })


def build_stream_tool_calls(tool_calls, model="custom-model"):

    yield sse_pack({
        "id": f"chatcmpl-{uuid.uuid4()}",
        "object": "chat.completion.chunk",
        "created": int(time.time()),
        "model": model,
        "choices": [
            {
                "index": 0,
                "delta": {
                    "tool_calls": [
                        tc.to_openai_tool_call() for tc in tool_calls
                    ]
                },
                "finish_reason": "tool_calls"
            }
        ]
    })


def stream_done():
    return "data: [DONE]\n\n"


def build_openai_stream_response(content, tool_calls=None):
    async def generator():

        # role chunk (recommended)
        yield sse_pack({
            "choices": [{
                "delta": {"role": "assistant"},
                "index": 0
            }]
        })

        # 1. content 文本
        if content:
            for chunk in build_stream_text_chunks(content):
                yield chunk

        # 2. tool calls
        if tool_calls:
            for chunk in build_stream_tool_calls(tool_calls):
                yield chunk

        # finish
        yield sse_pack({
            "choices": [{
                "delta": {},
                "finish_reason": "stop",
                "index": 0
            }]
        })

        yield stream_done()

    return StreamingResponse(
        generator(),
        media_type="text/event-stream"
    )
```

## 2.4. 关于历史对话到`AppConversationId`的映射关系
目前使用了 sqlite 来维护这个映射关系，主要的两列为：一列是历史对话的哈希值，一列是对应的`AppConversationId`。每次新的对话请求过来时，先把当前的历史对话计算出哈希值，然后去这个表里查有没有对应的`AppConversationId`，如果有就直接用它，如果没有就创建一个新的会话获取新的`AppConversationId`，然后把这个新的 ID 和当前的历史对话的哈希值一起存到表里。

```python
def compute_conversation_key(messages, max_assistant_turns=1):
    if not messages:
        return None
    
    if count_assistant_turns(messages) < max_assistant_turns:
        # 如果 assistant 轮数还不够，就不计算 key，强制新建会话
        return None

    text_list = []
    assistant_turns = 0

    for m in messages:
        role = m.get("role")
        if role == "system":
            continue
        content = m.get("content")
        text = ""
        if content:
            if isinstance(content, str):
                text = content
            elif isinstance(content, list):
                text = json.dumps(content, ensure_ascii=False)
            else:
                text = str(content)
        text_list.append(f"[{role}]\n{text}")

        if role == "assistant":
            assistant_turns += 1
            if assistant_turns >= max_assistant_turns:
                break

    key_material = "\n\n".join(text_list)
    h = hashlib.sha256(key_material.encode("utf-8")).hexdigest()
    return h
```


## 2.5. 完整流程代码
```python
@app.post("/v1/chat/completions")
async def chat(body: dict):

    stream = body.get("stream", False)
    messages = body.get("messages") or []
    tools = body.get("tools")

    # 计算会话 key（忽略 system）
    conv_key = compute_conversation_key(messages)
    conversation_id = None
    if conv_key:
        obj = get_conversation_by_key(conv_key)
        if obj:
            conversation_id = obj["app_conversation_id"]
            idx = find_last_assistant_index(messages)
            prompt = build_prompt_from_messages(messages[idx+1:], tools=tools, create_new=False)
    if not conversation_id:
        conversation_id = create_conversation()
        prompt = build_prompt_from_messages(messages, tools=tools, create_new=True)

    regenerate_conversation = False
    content = None
    tool_calls = None
    token_usage = None

    try:
        content, tool_calls, token_usage = chat_query(conversation_id, prompt)
    except Exception as e:
        print("Error during chat query:", str(e))
        # 400
        if "Conversation expired or invalid" in str(e):
            if conv_key:
                delete_conversation(conv_key)
            conversation_id = create_conversation()
            prompt = build_prompt_from_messages(messages, tools=tools, create_new=True)
            regenerate_conversation = True

            # 重新用完整消息构建 prompt，会导致一大段文本塞到同一次会话里，极有可能消耗大量上下文，但目前没有更好的选择了
            try:
                content, tool_calls, token_usage = chat_query(conversation_id, prompt)
            except Exception as e:
                print("Error during chat query for new conversation:", str(e))
                return build_openai_response("hiagent 请求失败: " + str(e), stream=stream)
        else:
            return build_openai_response("hiagent 请求失败: " + str(e), stream=stream)

    openclaw_message = build_openclaw_assistant_format(content, tool_calls)
    messages.append(openclaw_message)
    assistant_turns = count_assistant_turns(messages)

    if not conv_key:
        new_conv_key = compute_conversation_key(messages)
        if new_conv_key:
            save_conversation(new_conv_key, conversation_id, int(time.time()), turn_count=assistant_turns)
    elif not regenerate_conversation:
        update_turn_count(conv_key, assistant_turns)
    else:
        save_conversation(conv_key, conversation_id, int(time.time()), turn_count=assistant_turns)

    resp = build_openai_response(content, tool_calls=tool_calls, stream=stream, token_usage=token_usage)

    return resp
```

# 3. 实现思路尝试1
一开始我并没有尝试将历史对话和`AppConversationId`建立映射关系，主要是考虑到两点：

1. 直接将所有的历史对话都发到一次对话里，直接把 hiagent 当成无状态的模型来用更简单一些
2. OpenClaw 和 hiagent 各自都会有压缩上下文的机制，映射关系可能会随着上下文的变化而失效了，维护映射关系可能会比较麻烦

这样的实现确实更简单一些：
```python
@app.post("/v1/chat/completions")
async def chat(body: dict):

    user_id = "default_user"
    stream = body.get("stream", False)
    messages = body.get("messages") or []
    tools = body.get("tools")

    # 构造完整历史 prompt
    prompt = build_prompt_from_messages(messages, tools=tools)

    try:
        # 每次创建新的 hiagent 会话（不复用）
        conversation_id = create_conversation(user_id)
        answer = chat_query(user_id, conversation_id, prompt)

    except Exception as e:
        print("Error during chat query:", str(e))
        if stream:
            return build_openai_stream_response("hiagent 请求失败: " + str(e))
        else:
            return build_openai_response_text("hiagent 请求失败: " + str(e))
    
    # 解析 tool call
    tool_calls, prefix_text = parse_hiagent_tool_calls(answer)

    # ---------- STREAM ----------
    if stream:
        # return build_openai_stream_response(answer, tool_calls=tool_calls, prefix_text=prefix_text)
        return build_openai_stream_response(answer, tool_calls=tool_calls, prefix_text=None)

    # ---------- NON STREAM ----------

    if tool_calls:
        resp = build_openai_response_tool_calls(tool_calls, content=prefix_text)

    else:
        resp = build_openai_response_text(answer)

    return resp
```

不过这种方式有个问题，上下文消耗的速度会比预想的要快，可能是因为把所有的历史对话都塞到了一次对话的输入里了，导致 hiagent 的内部的上下文压缩机制并没有发挥作用。不过这只是个推测，从结果来看，实际使用时经常几轮对话就开始超时了。

后面经过验证发现虽然 openclaw 确实会有上下文的优化，但它发送给 api 的内容也确实是完整的历史，所以实际上不会存在上下文因压缩而频繁变换导致无法维护映射关系的问题了。

# 4. 其他问题
## 4.1. 超时问题
最初调试的时候发现有时 hiagent 会出现超时的情况，此时会返回 504 gateway timeout 的错误。所以我就给代码加了个超时的判断，只要是 504 错误，就反复再发送几次请求，直到超过最大次数。

不过使用过程中发现超时十分频繁，且基本固定为一分钟左右，且只要第一次超时，后面反复再发送的几次也基本超时了，感觉不像是 hiagent 真正的处理超时了。所以我查看了 api 文档，找到 `get_conversation_messages` 这个接口，查看一下频繁超时的对话的消息记录，发现了多次重复的问题和回答，也就是说，虽然我接收到了超时，但大模型内部仍在处理我的请求，并处理完之后保存到了上下文里。所以超时实际上来自于网关而非大模型。

原有思路肯定会影响上下文质量且频繁超时，所以采用拿到 504 错误后不再反复发送请求了，而是接着调用 `get_conversation_messages` 这个接口去轮询消息记录，直到拿到新的回答了再继续后续的流程，这样就避免了频繁超时的问题了。

`get_conversation_messages` 示例返回值：
```
{
  "Messages": [
		{
			"ConversationID": "01KPNYPAS92ZZC51J3309FR47S",
			"QueryID": "d7j624elvnde66pa0a9g",
			"Query": "[user]\n[{'type': 'text', 'text': 'Sender (untrusted metadata):\\n```json\\n{\\n  \"label\": \"openclaw-tui (gateway-client)\",\\n  \"id\": \"gateway-client\",\\n  \"name\": \"openclaw-tui\",\\n  \"username\": \"openclaw-tui\"\\n}\\n```\\n\\n[Tue 2026-04-21 01:23 GMT+8] 你好'}]\n\n[assistant]",
			"AnswerInfo": {
				"Answer": "你好！很高兴见到你。😊\n\n我是你的 OpenClaw 助手。看起来这是一个全新的会话，我刚刚上线。\n\n让我先了解一下你的情况：<tool_call>read\n{\"path\": \"/home/devuser/.openclaw/workspace/IDENTITY.md\"}",
				"MessageID": "01KPNYPAX7NK5QMKN6MCG56CB0",
				"CreatedTime": 1776705809,
				"TaskID": "01KPNYPAX7NK5QMKN6MCG56CB0",
				"Like": 0,
				"TotalTokens": 10470,
				"Latency": 5.459,
				"TracingJsonStr": "",
				"RetrieverResource": false
			},
			"OtherAnswers": [],
			"Inputs": {},
			"SendByTrigger": false,
			"SendByAsyncWorkflow": false,
			"UserMessage": {
				"Messages": [
					{
						"type": "text",
						"text": "[user]\n[{'type': 'text', 'text': 'Sender (untrusted metadata):\\n```json\\n{\\n  \"label\": \"openclaw-tui (gateway-client)\",\\n  \"id\": \"gateway-client\",\\n  \"name\": \"openclaw-tui\",\\n  \"username\": \"openclaw-tui\"\\n}\\n```\\n\\n[Tue 2026-04-21 01:23 GMT+8] 你好'}]\n\n[assistant]"
					}
				]
			}
		}
	],
	"BaseResp": null
}
```
