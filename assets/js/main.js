$(document).ready(function () {
  $(function () {
    $(window).scroll(function () {
      if ($(window).scrollTop() > 150) {
        $("#backtotop").addClass("showme");
      } else {
        $("#backtotop").removeClass("showme");
      }
    });

    $("#backtotop").click(function () {
      $("body,html").animate({ scrollTop: 0 }, 400);
      return false;
    });

    $("pre").addClass("prettyprint linenums");
    prettyPrint();

    $("a#single_image").fancybox();
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

    $(".bookpiclist .bookpic").hover(
      function () {
        $(this).find(".booklabel").stop().animate({ bottom: 0 }, 200);
        $(this).find("img").stop().animate({ top: -30 }, 500);
      },
      function () {
        $(this).find(".booklabel").stop().animate({ bottom: -40 }, 200);
        $(this).find("img").stop().animate({ top: 0 }, 300);
      }
    );
  });

  $("li.phoneselect").click(function () {
    $("div.navbar-collapse").removeClass("in");
    $("button.navbar-toggle").addClass("collapsed");
  });

  $(".circle").load(function () {
    $(".circle").addClass("show");
  });

  $(".bookpiclist .bookpic").hover(
    function () {
      $(this).find(".booklabel").stop().animate({ bottom: 0 }, 200);
      $(this).find("img").stop().animate({ top: -30 }, 500);
    },
    function () {
      $(this).find(".booklabel").stop().animate({ bottom: -40 }, 200);
      $(this).find("img").stop().animate({ top: 0 }, 300);
    }
  );

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
  $("#header-search i").click(function () {
    showSearchContainer();
  });

  // 遮罩层点击
  $(".search-mask").click(function () {
    $(".search-container").css("display", "none");
    $(".search-mask").css("display", "none");
  });
});
