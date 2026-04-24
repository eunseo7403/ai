let btn = document.getElementById("btn");
let mobileMenu = document.getElementById("mobileMenu");
let cover = document.getElementById("cover");
let closeBtn = document.getElementById("closeBtn");

console.log(btn, mobileMenu, cover);

btn.addEventListener("click", function () {
  mobileMenu.classList.add("on");
  cover.classList.add("on");
});

closeBtn.addEventListener("click", function () {
  mobileMenu.classList.remove("on");
  cover.classList.remove("on");
});
