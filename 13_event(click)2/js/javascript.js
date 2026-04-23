let btn1 = document.getElementById("btn1");
console.log(btn1);

let fadebox = document.getElementById("fadebox");
console.log(fadebox);

btn1.addEventListener("click", function () {
  fadebox.style.transition = "all 1s";
  fadebox.style.opacity = 0;
  //   fadebox.style.visibility = "hidden";
});

let btn2 = document.getElementById("btn2");
btn2.addEventListener("click", function () {
  fadebox.style.transition = "all 1s";
  fadebox.style.opacity = 1;
});

let btn3 = document.getElementById("btn3");
let fadetogglebox = document.getElementById("fadetogglebox");
btn3.addEventListener("click", function () {
  fadetogglebox.classList.toggle("fade-hidden");
});

let btn4 = document.getElementById("btn4");
let upbox = document.getElementById("up");
btn4.addEventListener("click", function () {
  upbox.classList.add("slide-hidden");
});

let btn5 = document.getElementById("btn5");
btn5.addEventListener("click", function () {
  upbox.classList.remove("slide-hidden");
});

let btn6 = document.getElementById("btn6");
let slidetgbox = document.getElementById("slidetogglebox");
btn6.addEventListener("click", function () {
  slidetgbox.classList.toggle("slide-hidden");
});

let btn7 = document.getElementById("btn7");
let anibox = document.getElementById("anim");

btn7.addEventListener("click", function () {
  anibox.classList.add("ani-move");
});

let btn8 = document.getElementById("btn8");
btn8.addEventListener("click", function () {
  anibox.classList.remove("ani-move");
});
