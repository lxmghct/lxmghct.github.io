function clickTag(tag) {
  const filter = document.querySelector(`.tag-filter[data-tag="${tag}"]`);
  if (filter) {
    filter.click();
  } else {
    document.querySelector('.tag-filter[data-tag="all"]').click();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const tagFilters = document.querySelectorAll(".tag-filter");
  tagFilters.forEach((filter) => {
    filter.addEventListener("click", function () {
      const tag = this.getAttribute("data-tag");
      tagFilters.forEach((f) => f.classList.remove("active"));
      this.classList.add("active");
      filterPosts(tag);
      // 将标签添加到URL中
      if (tag == "all") {
        history.pushState(null, null, window.location.pathname);
      } else {
        history.pushState(null, null, window.location.pathname + "#" + tag);
      }
    });
  });

  function filterPosts(tag) {
    const posts = document.querySelectorAll(".tag-target");
    posts.forEach((post) => {
      const tags = post.getAttribute("name").split(",");
      if (tags.indexOf(tag) !== -1 || tag == "all") {
        post.style.display = "block";
      } else {
        post.style.display = "none";
      }
    });
  }

  const hash = window.location.hash;
  if (hash && hash.startsWith("#")) {
    clickTag(hash.substring(1));
  }

  // 如果当前是/pages/classify.html页面，那么点击标签后，需要跳转到/pages/classify.html页面
  if (window.location.pathname == "/pages/classify.html") {
    const tagLinks = document.querySelectorAll(".classify-tag-after-post-title a");
    tagLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        clickTag(this.innerText);
      });
    });
  }

});

(function () {
  document.querySelectorAll("a.post-tag").forEach(item => {
    item.addEventListener("click", function () {
      var name = item.getAttribute("data-tag");
      // 如果当前页面是/pages/tags.html，只需修改hash值
      if (window.location.pathname == "/pages/tags.html") {
        clickTag && clickTag(name);
      } else {
        window.location.href = "/pages/tags.html#" + name;
      }
    });
  });
})();
