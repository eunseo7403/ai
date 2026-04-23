let btn = document.getElementById("btn");
console.log(btn);

let list = document.getElementById("list");
console.log(list);

btn.addEventListener("click", function () {
  list.classList.toggle("fade-hidden");
});
