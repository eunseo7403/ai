// jquery 사용시 준비사항
$(function () {
  //버튼을 손모양으로 표시
  $("button").css({ cursor: "pointer" });
  $("#btn1").click(function () {
    $(".box1 div:first-child").fadeOut(1000);
  });

  $("#btn2").click(function () {
    $(".box1 div:first-child").fadeIn(1000);
  });

  $("#btn3").click(function () {
    $(".box1 div:last-child").fadeToggle();
  });

  $("#btn4").click(function () {
    $(".box2 div:first-child").slideUp();
  });

  $("#btn5").click(function () {
    $(".box2 div:first-child").slideDown();
  });

  $("#btn6").click(function () {
    $(".box2 div:nth-child(2)").slideToggle();
  });

  $("#btn7").click(function () {
    $(".box2 .ani").animate({ left: "840px" });
  });

  $("#btn8").click(function () {
    $(".box2 .ani").animate({ left: "440px" });
  });

  //$("선택자").addClass("추가 할 클래스 이름")
  $("#btn9").click(function () {
    $(".box3 div:first-child").addClass("bg");
  });

  //$("선택자").removeClass("삭제 할 클래스 이름")
  $("#btn10").click(function () {
    $(".box3 div:first-child").removeClass("bg");
  });
});
