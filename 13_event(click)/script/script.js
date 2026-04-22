$(function () {
  $("#btn1").click(function () {
    $(".orange").hide();
  });

  $("#btn2").click(function () {
    $(".orange").show();
  });

  $("#btn3").click(function () {
    $(".lightblue").toggle();
  });

  $("#btn1").css({ width: "100px", height: "200px" });

  $("#btn4").click(function () {
    $(".lightpurple").css({ width: "600px", height: "600px" });
  });

  $("#btn5").click(function () {
    $(".lightpurple").css({ width: "200px", height: "200px" });
  });
});
