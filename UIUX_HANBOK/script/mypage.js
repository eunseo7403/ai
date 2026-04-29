// 마이페이지 전용 스크립트

const mypageForm = document.querySelector("#mypageForm");
const cancelBtn = document.querySelector("#cancelBtn");

const emailSelect = document.querySelector("#emailSelect");
const emailDomain = document.querySelector("#emailDomain");

const withdrawOpenBtn = document.querySelector("#withdrawOpenBtn");
const withdrawModal = document.querySelector("#withdrawModal");
const withdrawCloseBtn = document.querySelector("#withdrawCloseBtn");
const withdrawForm = document.querySelector("#withdrawForm");

const openWithdrawModal = () => {
  withdrawModal.hidden = false;
  document.body.style.overflow = "hidden";
};

const closeWithdrawModal = () => {
  withdrawModal.hidden = true;
  document.body.style.overflow = "";

  withdrawForm.reset();
};

emailSelect.addEventListener("change", () => {
  const selectedValue = emailSelect.value;

  if (selectedValue === "") {
    emailDomain.readOnly = false;
    emailDomain.value = "";
    emailDomain.focus();
  } else {
    emailDomain.value = selectedValue;
    emailDomain.readOnly = true;
  }
});

mypageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const memberPw = document.querySelector("#memberPw").value.trim();
  const memberPwCheck = document.querySelector("#memberPwCheck").value.trim();

  if (memberPw !== "" || memberPwCheck !== "") {
    if (memberPw.length < 6) {
      alert("비밀번호는 6자 이상으로 입력해주세요.");
      document.querySelector("#memberPw").focus();
      return;
    }

    if (memberPw !== memberPwCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      document.querySelector("#memberPwCheck").focus();
      return;
    }
  }

  alert("기본정보가 저장되었습니다.");
});

cancelBtn.addEventListener("click", () => {
  window.location.reload();
});

withdrawOpenBtn.addEventListener("click", () => {
  openWithdrawModal();
});

withdrawCloseBtn.addEventListener("click", () => {
  closeWithdrawModal();
});

withdrawModal.addEventListener("click", (event) => {
  if (event.target === withdrawModal && window.innerWidth > 767) {
    closeWithdrawModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !withdrawModal.hidden) {
    closeWithdrawModal();
  }
});

withdrawForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const withdrawPw = document.querySelector("#withdrawPw").value.trim();
  const withdrawPwCheck = document
    .querySelector("#withdrawPwCheck")
    .value.trim();
  const withdrawAgree = document.querySelector("#withdrawAgree");

  if (withdrawPw === "") {
    alert("비밀번호를 입력해주세요.");
    document.querySelector("#withdrawPw").focus();
    return;
  }

  if (withdrawPw.length < 6) {
    alert("비밀번호는 6자 이상으로 입력해주세요.");
    document.querySelector("#withdrawPw").focus();
    return;
  }

  if (withdrawPwCheck === "") {
    alert("비밀번호를 한번 더 입력해주세요.");
    document.querySelector("#withdrawPwCheck").focus();
    return;
  }

  if (withdrawPw !== withdrawPwCheck) {
    alert("비밀번호가 일치하지 않습니다.");
    document.querySelector("#withdrawPwCheck").focus();
    return;
  }

  if (!withdrawAgree.checked) {
    alert("탈퇴 동의에 체크해주세요.");
    withdrawAgree.focus();
    return;
  }

  alert("회원탈퇴가 완료되었습니다.");
  window.location.href = "./login.html";
});
