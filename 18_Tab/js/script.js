$(function () {
  // 탭 메뉴를 클릭하면 해당 버튼에 on 클래스 붙이기
  $(".tab li").click(function () {
    let num = $(this).index();

    // 기존에 on class 삭제
    $(".tab li").removeClass("on");
    $(this).addClass("on");

    // 기존에 list_wrap 숨김
    $(".list_wrap").hide();
    $(".list_wrap").eq(num).show();
  });
});
