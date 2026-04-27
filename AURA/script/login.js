const loginForm = document.getElementById("loginForm");
const userId = document.getElementById("userId");
const userPw = document.getElementById("userPw");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const idValue = userId.value.trim();
  const pwValue = userPw.value.trim();

  if (idValue === "") {
    alert("아이디 또는 이메일을 입력해주세요.");
    userId.focus();
    return;
  }

  if (pwValue === "") {
    alert("비밀번호를 입력해주세요.");
    userPw.focus();
    return;
  }

  location.href = "./home.html";
});
