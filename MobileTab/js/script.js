$(function () {
  // 메뉴 버튼을 클릭하면 nav 메뉴가 열리도록
  $("button").click(function () {
    $(".cover").fadeIn(300);
    $(".mobile-menu").animate({ right: 0 }, 300);
  });

  // 닫기 버튼을 클릭하면 nav 메뉴가 닫히도록
  $(".close-btn").click(function () {
    $(".mobile-menu").animate({ right: "-100%" }, 300);
    $(".cover").fadeOut(300);
  });
});
