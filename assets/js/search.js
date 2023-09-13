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

function getMatchedPositions(keyword, content) {
  const previewList = [];
  let regex = new RegExp(keyword, "gi");
  let match;
  while ((match = regex.exec(content)) !== null) {
    var startIndex = Math.max(0, match.index - 20);
    var endIndex = Math.min(content.length, match.index + keyword.length + 20);
    var preview = content.substring(startIndex, match.index) +
    "<span class='highlight'>" + content.substring(match.index, match.index + keyword.length) + "</span>" +
    content.substring(match.index + keyword.length, endIndex);
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
        // 查找在item中共有几处匹配, 并取出每处匹配的前后20个字符
        let matchedPositions = getMatchedPositions(searchContent, item.title + '\n' + item.content);
        totalMatched += matchedPositions.length;
        let positionHtml = "";
        for (let j = 0; j < matchedPositions.length; j++) {
          positionHtml += `<div>${j + 1}. ${matchedPositions[j]}</div>`;
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

function startSearch() {
  if (articleData.length === 0) {
    getXmlData().then(() => {
      getSearchResult();
      renderSearchResult();
    });
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
  startSearch();
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
