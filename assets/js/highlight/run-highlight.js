(function () {
  // 忽略未转义的 HTML 代码
  hljs.configure({ ignoreUnescapedHTML: true });
  // 代码高亮
  // hljs.highlightAll();

  // 如果是无法识别的语言, 不会被自动添加div.highlighter-rouge, 所以需要手动处理
  // 找到没有任何类的<pre>元素
  let preWithoutLanguages = []
  let allPres = document.querySelectorAll(".post-content pre");
  allPres.forEach((pre) => {
    if (pre.classList.length === 0) {
      preWithoutLanguages.push(pre);
    }
  });
  // 为这些<pre>元素外层添加一个.highlighter-rouge的div
  preWithoutLanguages.forEach((pre) => {
    // 先看看它的<code>元素是否有language-开头的class
    let language = Array.from(pre.getElementsByTagName("code")[0].classList).find((c) => c.startsWith("language-"));
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
  
  let preContainers = document.querySelectorAll(".post-content div.highlighter-rouge");
  let codeDataList = []
  let codeList = []
  preContainers.forEach((preContainer) => {
    // 从自身的class列表中提取语言类别, language-开头的class
    let language = Array.from(preContainer.classList).find((c) => c.startsWith("language-"));
    if (!language) {
      language = "plaintext";
    }
    let code = preContainer.getElementsByTagName("code")[0];
    codeDataList.push({ language: language.replace("language-", ""), code: code.textContent });
    codeList.push(code);
  });
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
      code.parentNode.insertAdjacentHTML("afterbegin", `<div class="language">${codeDataList[i].language}</div>`);
    });
    // 代码行号
    hljs.initLineNumbersOnLoad();
  };
  worker.postMessage(codeDataList);
})();
