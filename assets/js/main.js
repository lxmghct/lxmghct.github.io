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
  });

  $(".circle").load(function () {
    $(".circle").addClass("show");
  });

  function showSearchContainer() {
    $(".search-container").css("display", "block");
    $(".search-mask").css("display", "block");
    $(".search-container .search-input").val($("#header-search-input").val());
    $(".search-start").click();
  }
  // 搜索
  $("#header-search-input").keydown((event) => {
    if (event.keyCode == 13) {
      showSearchContainer();
    }
  });
  $("#header-search i").click(showSearchContainer);
  $(".header-hidden-buttons .search-icon").click(showSearchContainer);
  $(".header-hidden-buttons .fa-search").click(showSearchContainer);

  // 遮罩层与关闭按钮点击
  function hideSearchContainer() {
    $(".search-container").css("display", "none");
    $(".search-mask").css("display", "none");
  }
  $(".search-container .search-container-close").click(hideSearchContainer);
  $(".search-mask").click(hideSearchContainer);

  // 菜单
  $("#nav-trigger").blur(() => {
    // 延时隐藏, blur比click先触发
    setTimeout(() => {
      $(".phone-nav").removeClass("phone-nav-show");
    }, 100);
  });
  $(".header-hidden-buttons .menu-icon").click(() => {
    if (!$(".phone-nav").hasClass("phone-nav-show")) {
      $("#nav-trigger").focus();
      $(".phone-nav").addClass("phone-nav-show");
    }
  });

});
