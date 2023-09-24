// 参考https://knightyun.github.io/2019/03/04/articles-search

// 获取搜索框、搜索按钮、清空搜索、结果输出对应的元素
const searchBtn = document.querySelector(".search-start");
const searchClearBtn = document.querySelector(".search-clear");
const searchInput = document.querySelector(".search-input");
const searchResultContainer = document.querySelector(".search-result-container");
const searchResultSummary = document.querySelector(".search-result-summary");
const searchTitleFilter = document.querySelector(".search-filter-input");

var searchContent = "";
var articleData = [];
var searchResults = [];

function makeHttpRequest(method, url, data) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open(method, url, true);
    xhr.onload = function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        resolve(xhr);
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = function () {
      reject("网络错误");
    };
    if (data) {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send();
    }
  });
}

/**
 * 获取jekyll-feed生成的feed.xml中的数据
 */
function getXmlData() {
  articleData = [];
  return new Promise(function (resolve, reject) {
    makeHttpRequest("get", "/feed.xml")
      .then(function (res) {
        const xml = res.responseXML;
        const items = xml.getElementsByTagName("entry");
        for (const item of items) {
          const title = item.getElementsByTagName("title")[0].childNodes[0].nodeValue;
          const link = item.getElementsByTagName("link")[0].getAttribute("href");
          let content = item.getElementsByTagName("content")[0].childNodes[0].nodeValue.replace(/<.*?>/g, "");
          articleData.push({ title, link, content });
        }
        resolve(articleData);
      }).catch(function (err) {
        reject(err);
      });
  });
}

/**
 * 获取自己生成的json文件中的数据
 */
function getJsonData() {
  articleData = [];
  return new Promise(function (resolve, reject) {
    makeHttpRequest("get", "/assets/posts.json")
      .then(function (res) {
        const data = JSON.parse(res.responseText);
        for (const item of data) {
          articleData.push({ title: item.title, link: item.url, content: item.content });
        }
        resolve(articleData);
      }).catch(function (err) {
        reject(err);
      });
  });
}

function getSearchResult() {
  const onlySearchTitle = searchTitleFilter.checked;
  searchResults = [];
  searchContent = searchInput.value.trim();
  if (searchContent !== "") {
    const regExp = new RegExp(searchContent, "gi");
    for (const item of articleData) {
      if (item.title.match(regExp) || (!onlySearchTitle && item.content.match(regExp))) {
        searchResults.push(item);
      }
    }
  }
}

const endCharSet = new Set(['。', '！', '？', '\n', '\r']);

function convertHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
/**
 * 查找匹配位置，并取出每处匹配的前后若干字符
 * @param {*} keyword 
 * @param {*} content 
 * @returns 
 */
function getMatchedPositions(keyword, content) {
  const previewList = [];
  let regex = new RegExp(keyword, "gi");
  let match;
  const maxLeftOffset = 30;
  const maxRightOffset = 40;
  while ((match = regex.exec(content)) !== null) {
    let startIndex = Math.max(0, match.index - maxLeftOffset);
    let endIndex = Math.min(content.length, match.index + keyword.length + maxRightOffset);
    let preStr = content.substring(startIndex, match.index);
    let suffixStr = content.substring(match.index + keyword.length, endIndex);
    let matchStr = content.substring(match.index, match.index + keyword.length);
    // 截取preStr中最后一个终止符后的内容
    for (let i = preStr.length - 1; i >= 0; i--) {
      if (endCharSet.has(preStr[i])) {
        preStr = preStr.substring(i + 1);
        break;
      }
    }
    // 截取suffixStr中第一个终止符前的内容
    for (let i = 0; i < suffixStr.length; i++) {
      if (endCharSet.has(suffixStr[i])) {
        suffixStr = suffixStr.substring(0, i);
        break;
      }
    }
    let preview = convertHtml(preStr) + "<span class='highlight'>" + convertHtml(matchStr) + "</span>" + convertHtml(suffixStr);
    previewList.push(preview);
  }
  return previewList;
}

function renderSearchResult() {
  let html = "";
  let totalMatched = 0;
  const onlySearchTitle = searchTitleFilter.checked;
  if (searchResults.length !== 0) {
    for (let i = 0; i < searchResults.length; i++) {
      const item = searchResults[i];
      if (onlySearchTitle) {
        html += `<div class="search-result-item"><div class="title"><a href="${item.link}">${item.title}</a></div></div>`;
      } else {
        // 查找在item中共有几处匹配, 并取出每处匹配的前后字符
        let matchedPositions = getMatchedPositions(searchContent, item.title + '\n' + item.content);
        totalMatched += matchedPositions.length;
        let positionHtml = "";
        for (let j = 0; j < matchedPositions.length; j++) {
          positionHtml += `<div><span class="preview-number">${j + 1}.</span> ${matchedPositions[j]}</div>`;
        }
        const titleHtml = `<div class="title">${i + 1}. <a href="${item.link}">${item.title}</a><span class="matched-num">(${matchedPositions.length}处匹配)</span></div>`;
        html += `<div class="search-result-item">${titleHtml}<div class="preview">${positionHtml}</div></div>`;
      }
    }
  } else {
    html = "<div class='search-result-item'>没有找到内容，请尝试更换关键词！</div>";
  }
  searchResultContainer.innerHTML = html;
  if (onlySearchTitle) {
    totalMatched = searchResults.length;
  }
  searchResultSummary.innerHTML = `<span class="number">${searchResults.length}</span>篇文章中找到<span class="number">${totalMatched}</span>处匹配`;
}

// 输入计时器
var inputTimeout = null;

/**
 * 开始搜索
 */
function startSearch() {
  inputTimeout && clearTimeout(inputTimeout);
  if (articleData.length === 0) {
    // getXmlData().then(() => {
    //   getSearchResult();
    //   renderSearchResult();
    // });
    getJsonData().then(() => {
      getSearchResult();
      renderSearchResult();
    })
  } else {
    getSearchResult();
    renderSearchResult();
  }
}

// 回车事件
searchBtn.addEventListener("click", function () {
  startSearch();
});

// input事件
searchInput.addEventListener("input", function () {
  inputTimeout && clearTimeout(inputTimeout);
  // 防止输入过快影响性能
  inputTimeout = setTimeout(() => {
    startSearch();
  }, 500);
});

// 为搜索框添加回车事件监听器
searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    startSearch();
  }
});

// "只搜索标题"复选框事件
searchTitleFilter.addEventListener("change", function () {
  startSearch();
});

// 清空搜索框事件
searchClearBtn.addEventListener("click", function () {
  searchInput.value = "";
  startSearch();
});
