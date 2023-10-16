---
layout: post
title:  jekyll使用highlight.js对代码块进行高亮
date:   2023-10-15 21:20:00 +0800
categories: 个人博客 技术
tags: jekyll 前端
---

我想给自己的博客添加代码块自动高亮的功能，使用功能强大的highlight.js是一个不错的选择。整体来说，我想完成以下几个功能：
1. 代码块自动高亮，能够根据代码块中的语言类别进行高亮。
2. 代码块中的行号显示。
3. 添加一些额外功能，如复制代码、切换自动换行等。


highlight.js官网: [https://highlightjs.org/](https://highlightjs.org/)  
highlight.js中文文档: [http://highlight.cndoc.wiki/doc/](http://highlight.cndoc.wiki/doc/)

## 1. highlight.js简介
highlight.js 是一个用 JavaScript 编写的语法高亮库。它可以用来美化网页中的代码块，使其在浏览器中呈现出更具可读性的样式。highlight.js 支持超过 180 种编程语言和格式，包括常见的语言如 JavaScript、Python、Java，以及各种配置文件、标记语言等。

highlight.js 的主要特点包括：
- 轻量级：highlight.js 是一个轻量级的库，易于集成到网页中，并且不依赖于其他库或框架。
- 易用性：只需简单的几行代码，就可以在网页中集成代码高亮功能。
- 多语言支持：支持超过 180 种编程语言和格式的语法高亮。
- 自动检测：highlight.js 可以自动检测代码块中的语言类型，无需手动指定。
- 可定制性：用户可以根据需要自定义代码块的样式和主题。

### 1.1 使用highlight.js
去官网[https://highlightjs.org/download](https://highlightjs.org/download)下载 highlight.js，可以选择自己需要的语言，也可以直接使用默认的 highlight.js。下载后得到压缩包 highlight.zip，如果只使用默认样式，则只需要将`highlight.min.js`和`default.min.css`放到项目中即可。
```html
<link rel="stylesheet" href="/path/to/styles/default.min.css">
<script src="/path/to/highlight.min.js"></script>
<script>hljs.highlightAll();</script>
```
上面代码是最简单的使用方式，调用`hljs.highlightAll()`会自动对页面中所有`<pre><code>`标签自动识别语言并进行高亮。如果需要指定语言，可以在`<code>`标签中添加`class`属性，如`<code class="language-javascript">`。

## 2. 在jekyll中使用highlight.js的过程以及遇到的问题
### 2.1 jekyll中的代码块
首先要弄清楚 jekyll 是如何渲染代码块的。我使用了两段代码来做测试：
首先用了一段 python 代码作为例子：
```python
print("hello world")
```
检查渲染后的 html 代码，可以看到如下图所示的结构：
![jekyll代码块渲染后的html结构](/post_assets/images/2023/10/16-raw-structrue-1.png)
然后用了同样的代码，但是随便改了个语言类别为 test1：
```test1
print("hello world")
```
检查渲染后的 html 代码，可以看到如下图所示的结构：
![jekyll代码块渲染后的html结构](/post_assets/images/2023/10/16-raw-structrue-2.png)

![Alt text](image.png)

可以看到，jekyll 渲染代码块的时候，对于可以识别的代码类型，会将代码块包裹在`<div class="highlighter-rouge">`中，其中包含了`language-python`类名，然后在其中依次添加类名为`highlight`的`<div>`和`<pre>`标签，然后添加一个没有任何类的`<code>`标签。对于无法识别的代码类型，则直接生成一个`<pre>`标签，然后在其中添加一个类名为`language-xxx`的`<code>`标签。如果未指定语言，则视为第一种情况，语言类型为`plaintext`。

为了方便后续统一处理，主要是后续添加行号以及方便后面样式上的统一修改，我采用的方法是把情况二转化成情况一的结构，也就是从`<code>`标签中提取语言类别，然后外层添加`<div class="highlighter-rouge">`。
```javascript
// 找到没有任何类的<pre>元素
let preWithoutLanguages = [];
let allPres = document.querySelectorAll(".post-content pre");
allPres.forEach((pre) => {
  if (pre.classList.length === 0) {
    preWithoutLanguages.push(pre);
  }
});
// 为这些<pre>元素外层添加一个.highlighter-rouge的div
preWithoutLanguages.forEach((pre) => {
  // 先看看它的<code>元素是否有language-开头的class
  let language = Array.from(
    pre.getElementsByTagName("code")[0].classList
  ).find((c) => c.startsWith("language-"));
  if (!language) {
    language = "language-plaintext";
  }
  let div = document.createElement("div");
  div.classList.add("highlighter-rouge");
  div.classList.add(language);
  // 内层还有一层div
  let innerDiv = document.createElement("div");
  innerDiv.classList.add("highlight");
  div.appendChild(innerDiv);
  pre.parentNode.insertBefore(div, pre);
  innerDiv.appendChild(pre);
});
```

### 2.2 使用highlight.js
直接使用`hljs.highlightAll()`会对所有的`<pre><code>`标签进行高亮，使用如下 python 代码进行测试：
```python
def test():
    print("hello world")
```
高亮后的 html 结构如下图所示：
![highlight.js高亮后的html结构](/post_assets/images/2023/10/16-highlight-structrue.png)
可以看到，其中的`code`标签中添加了类名`hljs`和`language-scss`，并添加了 `data-highlighted="yes"`属性。但是`python`被识别成了`scss`，这是由于一开始 jekyll 渲染代码块的时候没有将`language-xxx`类添加到`<code>`标签中，导致 highlight.js 无法识别指定的语言，所以进行了自动识别。因此在做这一步之前，需要先将`<code>`标签中的类名改为`language-xxx`，而这个语言类型就从`highlighter-rouge`元素中的`language-xxx`类名中获取。
```javascript
let preContainers = document.querySelectorAll(
  ".post-content div.highlighter-rouge"
);
let codeDataList = [];
let codeList = [];
preContainers.forEach((preContainer) => {
  // 从自身的class列表中提取语言类别, language-开头的class
  let language = Array.from(preContainer.classList).find((c) =>
    c.startsWith("language-")
  );
  if (!language) {
    language = "plaintext";
  }
  let code = preContainer.getElementsByTagName("code")[0];
  code.classList.add(`language-${language.replace("language-", "")}`);
});
// 代码高亮
hljs.highlightAll();
```
这样做之后，highlight.js 就能够正确识别代码块中的语言类型了。

### 2.3 使用 Web Worker 加载 highlight.js
根据官方文档所说，当代码块很大时，为了避免页面卡顿，可以使用 Web Worker 加载 highlight.js。创建一个 worker.js 文件，然后将高亮的代码放在其中，注意这里需要我们将要高亮的代码文本传给 worker，然后 worker 返回高亮后的代码文本。不能直接使用 `hljs.highlightAll()`，否则会报错`Uncaught ReferenceError: document is not defined`。因为在 worker 中不能直接操作 DOM。

我这里是把所有的代码块放在一个数组中，然后传给 worker，worker 返回高亮后的代码数组，然后在主线程中将高亮后的代码替换原来的代码块。
```javascript
// worker.js
onmessage = (event) => {
  importScripts("/assets/js/highlight/highlight.min.js");
  const result = [];
  event.data.forEach((codeData) => {
    let language = codeData.language;
    // 如果语言类型不在 highlight.js 支持的语言列表中，则使用 plaintext
    if (self.hljs.getLanguage(language) === undefined) {
      language = "plaintext";
    }
    result.push(
      self.hljs.highlight(codeData.code, { language: language }).value
    );
  });
  postMessage(result);
};
```
然后在主线程中使用 worker：
```javascript
// 用上一步中的代码获取到的 preContainers
preContainers.forEach((preContainer) => {
  // ...
  let code = preContainer.getElementsByTagName("code")[0];
  codeDataList.push({
    language: language.replace("language-", ""),
    code: code.textContent,
  });
  codeList.push(code);
});
worker.onmessage = (event) => {
codeList.forEach((code, i) => {
  code.innerHTML = event.data[i];
});
};
worker.postMessage(codeDataList);
```
这样做之后，页面加载的时候就不会因为代码块太多而卡顿了。

## 3. 添加行号
highlight.js 高亮后的代码是没有行号的，为了添加行号，我使用了一个叫`highlightjs-line-numbers.js`的插件。github 地址：[https://github.com/wcoder/highlightjs-line-numbers.js](https://github.com/wcoder/highlightjs-line-numbers.js)。
### 3.1 使用 highlightjs-line-numbers.js
下载或使用 CDN 引入`highlightjs-line-numbers.js`，然后在`hljs.highlightAll()`或其他高亮代码之后调用`hljs.initLineNumbersOnLoad()`即可。
```html
<script src="/path/to/highlightjs-line-numbers.js"></script>
<script>hljs.initLineNumbersOnLoad();</script>
```
也可以使用参数配置，比如单行默认是不显示行号的，可以使用`hljs.initLineNumbersOnLoad({ singleLine: true })`来显示单行的行号。

添加了行号的 html 结构如下图所示：
![highlight.js添加行号后的html结构](/post_assets/images/2023/10/16-line-number-structrue.png)
可以看到，它实现添加行号的方式是使用`table`来给代码最前面加上一列来显示行号。

注意，`hljs.initLineNumbersOnLoad()`并不是马上执行的，是一个异步操作，所以不能直接在它后面立刻执行其他依赖于行号的操作。

### 3.2 样式优化
直接使用 highlightjs-line-numbers.js 生成的行号样式不太好看，我主要想修改的有以下几点：
1. 调整基本样式，比如把左对齐改为右对齐，给行号右边加一道竖线等。
2. 支持后面的自动换行功能，多行文本的行号改为显示在这些文本的第一行而非中间。
3. 固定在左侧，不随着代码块的滚动而滚动。(sticky 定位)
```css
.hljs {
    background-color: transparent;
}
.hljs-ln {
    padding-bottom: 10px;
}
.hljs-ln-numbers {
    position: sticky;
    position: -webkit-sticky; /* 兼容 Safari */
    left: 0;
    background-color: #F7F4F3;
    vertical-align: top;
}
.hljs-ln-code {
    padding: 0 5px !important;
}
.hljs-ln-n {
    padding: 0 3px;
    margin-right: 3px;
    text-align: right;
    min-width: 2em;
    border-right: 1px solid #e3e0dc;
}
```
注意调整一下背景色，避免 stikcy 定位滚动时显得不自然。

## 4. 其他功能
### 4.1 代码块头部添加快捷操作
我想在代码块的头部添加一些方便的操作，比如显示语言类型、复制代码、切换自动换行等。为了避免影响美观，只有鼠标悬停在代码块上时才显示这些操作。
```javascript
// 放在之前 web worker 的 onmessage 事件中
codeList.forEach((code, i) => {
  code.innerHTML = event.data[i];
  // ... other code
  // 显示语言类别
  let codeHeader =
    `<div class="code-header">` +
    `<span class="language">${codeDataList[i].language}</span> | ` +
    `<span class="change-wrap-btn"><i class="fa fa-rotate-right"></i>自动换行</span> | ` +
    `<span class="copy-btn"><i class="fa fa-copy"></i>复制</span>` +
    `</div>`;
  // 通过 insertAdjacentHTML 在代码块前面插入代码块头部
  code.parentNode.insertAdjacentHTML("afterbegin", codeHeader);
});
// 默认隐藏顶部按钮，鼠标放在代码块上时显示
preContainers.forEach((preContainer) => {
  const codeHeader = preContainer.querySelector(".code-header");
  codeHeader.classList.add("hidden");
  preContainer.onmouseover = () => {
    codeHeader.classList.remove("hidden");
  }
  preContainer.onmouseleave = () => {
    codeHeader.classList.add("hidden");
  }
});
```
```css
.hidden {
  display: none;
}

.code-header {
  position: absolute;
  top: 0;
  right: 20px;
  z-index: 1;
}
```
### 4.2 复制代码功能
首先获取需要复制的代码文本，由于添加了行号，不能直接使用`innerText`或`textContent`，一开始想的是在高亮之前获取过一次代码文本，可以直接用这个文本传入到复制函数中。但问题也很明显，临时存储文本的变量因为在复制函数中用到了，所以并不能及时释放，会占用一定的内存。所以还是直接获取高亮后的代码文本比较好。需要遍历每一行，把行号去掉，然后拼接成一个字符串。每一行的行号放在类名为`hljs-ln-numbers`的`<td>`标签中，每一行的代码放在类名为`hljs-ln-code`的`<td>`标签中。
```javascript
document.querySelectorAll(".copy-btn").forEach(copyBtn => {
  copyBtn.onclick = () => {
    let parent = copyBtn.parentNode.parentNode;
    let codeTable = parent.querySelector(".hljs-ln tbody");
    let codeRows = codeTable.querySelectorAll("tr");
    let text = "";
    codeRows.forEach((row) => {
      // 忽略行号, 直接找.hljs-ln-code元素
      let code = row.querySelector(".hljs-ln-code");
      text += code.textContent + "\n";
    });
    copyText(text);
  }
});
```
复制代码是通过创建一个`textarea`元素，然后把代码文本放进去，然后选中这个`textarea`元素，然后执行`document.execCommand("copy")`来实现的。当然如果浏览器支持`navigator.clipboard`，则使用`navigator.clipboard.writeText(text)`来实现。
```javascript
function copyText(text) {
  if (navigator.clipboard) {
    // clipboard api 复制
    navigator.clipboard.writeText(text);
  } else {
    var textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    // 隐藏此输入框
    textarea.style.position = "fixed";
    textarea.style.clip = "rect(0 0 0 0)";
    textarea.style.top = "10px";
    // 赋值
    textarea.value = text;
    // 选中
    textarea.select();
    // 复制
    document.execCommand("copy", true);
    // 移除输入框
    document.body.removeChild(textarea);
  }
}
```
### 4.3 切换自动换行
由于代码块的宽度是固定的，所以当代码块中的代码过长时，会出现横向滚动条。虽然对于代码而言，大部分时候不自动换行显得更清晰，但有时候可能会有换行更方便的情况。因此我想添加一个切换自动换行的功能。
```javascript
document.querySelectorAll(".change-wrap-btn").forEach((changeWrapBtn, i) => {
  changeWrapBtn.onclick = () => {
    const pre = changeWrapBtn.parentNode.parentNode;
    const code = pre.getElementsByTagName("code")[0];
    code.classList.toggle("wrap");
  }
});
```
```css
.post-content pre code.wrap {
    white-space: pre-wrap !important;
}
```
## 5. 效果展示
最终的效果如下图所示：
![效果展示](/post_assets/images/2023/10/16-highlight-final-display.gif)

完整代码可以在我的 github 仓库中找到：[https://github.com/lxmghct/lxmghct.github.io](https://github.com/lxmghct/lxmghct.github.io)。核心代码在`assets/js/highlight`和`assets/css/highlight`目录下。

