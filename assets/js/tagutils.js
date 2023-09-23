function clickTag(tag) {
  console.log("clickTag: \"" + tag + "\"");
  const filter = document.querySelector(`.tag-filter[data-tag="${tag}"]`);
  console.log(filter);
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

  if (window.location.pathname === "/pages/tags.html" || window.location.pathname === "/pages/classify.html") {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#")) {
      const str = hash.substring(1);
      // 中文标签需要解码
      clickTag(decodeURIComponent(str));
    }
  }

  function initClickEvent(selector, path) {
    const links = document.querySelectorAll(selector);
    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        const tag = this.getAttribute("data-tag");
        if (window.location.pathname === path) {
          e.preventDefault();
          clickTag(tag);
        } else {
          window.location.href = path + "#" + tag;
        }
      });
    });
  }
  setTimeout(() => {
    initClickEvent("a.post-tag", "/pages/tags.html");
    initClickEvent("a.post-classify", "/pages/classify.html");
  }, 1000);

});
