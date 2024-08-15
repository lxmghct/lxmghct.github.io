/**
 * 复制文本到剪贴板
 * @param {string} text 要复制的文本
 */
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

(function () {
  // 忽略未转义的 HTML 代码
  hljs.configure({ ignoreUnescapedHTML: true });

  // 如果是无法识别的语言, 不会被自动添加div.highlighter-rouge, 所以需要手动处理
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
    codeDataList.push({
      language: language.replace("language-", ""),
      code: code.textContent,
    });
    codeList.push(code);
    // code.classList.add(`language-${language.replace("language-", "")}`);
  });
  // 代码高亮
  // hljs.highlightAll();
  // Web Worker
  const worker = new Worker("/assets/js/highlight/worker.js");
  worker.onmessage = (event) => {
    // 高亮完成后的示例:
    // <code data-highlighted="yes" class="hljs language-csharp" ></code>
    codeList.forEach((code, i) => {
      code.innerHTML = event.data[i];
      code.setAttribute("data-highlighted", "yes");
      code.classList.add("hljs");
      code.classList.add(`language-${codeDataList[i].language}`);
      // 显示语言类别
      let codeHeader =
        `<div class="code-header">` +
        `<span class="language">${codeDataList[i].language}</span> | ` +
        `<span class="change-wrap-btn"><i class="fa fa-rotate-right"></i>自动换行</span> | ` +
        `<span class="copy-btn"><i class="fa fa-copy"></i>复制</span>` +
        `</div>`;
      code.parentNode.insertAdjacentHTML("afterbegin", codeHeader);
    });
    // 代码行号
    hljs.initLineNumbersOnLoad({ singleLine: true });
    // 添加复制按钮点击事件
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
    // 添加自动换行按钮点击事件
    document.querySelectorAll(".change-wrap-btn").forEach((changeWrapBtn, i) => {
      changeWrapBtn.onclick = () => {
        const pre = changeWrapBtn.parentNode.parentNode;
        const code = pre.getElementsByTagName("code")[0];
        code.classList.toggle("wrap");
      }
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
  };
  worker.postMessage(codeDataList);
})();
