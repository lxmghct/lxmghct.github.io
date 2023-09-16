$(document).ready(function () {
  $(function () {
    $(window).scroll(function () {
      if ($(window).scrollTop() > 150) {
        $("#back-to-top").addClass("showme");
      } else {
        $("#back-to-top").removeClass("showme");
      }
    });

    $("#back-to-top").click(function () {
      $("body,html").animate({ scrollTop: 0 }, 400);
      return false;
    });

    $("pre").addClass("prettyprint linenums");
    prettyPrint();

    $("a.group").fancybox({
      transitionIn: "elastic",
      transitionOut: "elastic",
      speedIn: 600,
      speedOut: 200,
      overlayShow: false,
    });
  });

  $(document).pjax(".pjaxlink", "#pjax", {
    fragment: "#pjax",
    timeout: 10000,
  });

  $(document).on("pjax:send", function () {
    $(".pjax_loading").css("display", "block");
  });

  $(document).on("pjax:complete", function () {
    $("pre").addClass("prettyprint linenums");
    prettyPrint();
    $(".pjax_loading").css("display", "none");
  });

  $(".circle").load(function () {
    $(".circle").addClass("show");
  });

  $("a").click(function (event) {
    const href = $(this).attr("href");
    // href与当前页面url不同
    if (href && href != window.location.href) {
      event.preventDefault();
      window.location.href = $(this).attr("href");
    }
  });

  function showSearchContainer() {
    $(".search-container").css("display", "block");
    $(".search-mask").css("display", "block");
    $(".search-container .search-input").val($("#header-search-input").val());
    $(".search-start").click();
  }
  // 搜索
  $("#header-search-input").keydown(function (event) {
    if (event.keyCode == 13) {
      showSearchContainer();
    }
  });
  $("#header-search i").click(showSearchContainer);
  $(".header-hidden-buttons .search-icon").click(showSearchContainer);
  $(".header-hidden-buttons .fa-search").click(showSearchContainer);

  // 遮罩层点击
  $(".search-mask").click(function () {
    $(".search-container").css("display", "none");
    $(".search-mask").css("display", "none");
  });
});
