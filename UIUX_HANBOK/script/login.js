// 로그인 페이지 전용 스크립트

const SAMPLE_USER = {
  id: "ABCD1234",
  name: "홍길동",
  phoneFirst: "010",
  phoneMiddle: "0000",
  phoneLast: "0000",
};

const loginPanel = document.querySelector("#loginPanel");
const findPanel = document.querySelector("#findPanel");

const loginForm = document.querySelector("#loginForm");
const goFindId = document.querySelector("#goFindId");
const goFindPw = document.querySelector("#goFindPw");

const idTab = document.querySelector("#idTab");
const pwTab = document.querySelector("#pwTab");

const idForm = document.querySelector("#idForm");
const authCodeForm = document.querySelector("#authCodeForm");
const resetPwForm = document.querySelector("#resetPwForm");

const authTimer = document.querySelector("#authTimer");

let timerId = null;
let remainSeconds = 180;

const showLoginPanel = () => {
  loginPanel.hidden = false;
  findPanel.hidden = true;

  stopTimer();
};

const showFindPanel = () => {
  loginPanel.hidden = true;
  findPanel.hidden = false;
};

const hideAllSteps = () => {
  const steps = document.querySelectorAll(".find-step");

  steps.forEach((step) => {
    step.hidden = true;
  });
};

const showStep = (stepId) => {
  hideAllSteps();

  const targetStep = document.querySelector(`#${stepId}`);
  targetStep.hidden = false;
};

const activeTab = (tabName) => {
  idTab.classList.remove("is-active");
  pwTab.classList.remove("is-active");

  if (tabName === "id") {
    idTab.classList.add("is-active");
  }

  if (tabName === "pw") {
    pwTab.classList.add("is-active");
  }
};

const showIdFind = () => {
  showFindPanel();
  activeTab("id");
  showStep("idFindForm");
  stopTimer();
};

const showPwFind = () => {
  showFindPanel();
  activeTab("pw");
  showStep("pwFindMethod");
};

const startTimer = () => {
  stopTimer();

  remainSeconds = 180;
  authTimer.textContent = "3:00";

  timerId = setInterval(() => {
    remainSeconds--;

    const minute = Math.floor(remainSeconds / 60);
    const second = String(remainSeconds % 60).padStart(2, "0");

    authTimer.textContent = `${minute}:${second}`;

    if (remainSeconds <= 0) {
      stopTimer();
      alert("인증 시간이 만료되었습니다. 다시 인증해주세요.");
      showPwFind();
    }
  }, 1000);
};

const stopTimer = () => {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
};

// 로그인 버튼
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const userId = document.querySelector("#userId").value.trim();
  const userPw = document.querySelector("#userPw").value.trim();

  if (userId === "") {
    alert("아이디를 입력해주세요.");
    document.querySelector("#userId").focus();
    return;
  }

  if (userPw === "") {
    alert("비밀번호를 입력해주세요.");
    document.querySelector("#userPw").focus();
    return;
  }

  alert("로그인되었습니다.");

  // 실제 메인 페이지가 완성되면 이동됩니다.
  window.location.href = "./index.html";
});

// 로그인 화면에서 아이디 찾기 이동
goFindId.addEventListener("click", () => {
  showIdFind();
});

// 로그인 화면에서 비밀번호 찾기 이동
goFindPw.addEventListener("click", () => {
  showPwFind();
});

// 탭 클릭
idTab.addEventListener("click", () => {
  showIdFind();
});

pwTab.addEventListener("click", () => {
  showPwFind();
});

// 아이디 찾기 확인
idForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#findName").value.trim();
  const phoneFirst = document.querySelector("#phoneFirst").value;
  const phoneMiddle = document.querySelector("#phoneMiddle").value.trim();
  const phoneLast = document.querySelector("#phoneLast").value.trim();

  const isSameUser =
    name === SAMPLE_USER.name &&
    phoneFirst === SAMPLE_USER.phoneFirst &&
    phoneMiddle === SAMPLE_USER.phoneMiddle &&
    phoneLast === SAMPLE_USER.phoneLast;

  if (isSameUser) {
    document.querySelector("#foundId").textContent = SAMPLE_USER.id;
    showStep("idFindSuccess");
  } else {
    showStep("idFindFail");
  }
});

// 비밀번호 인증 방법 클릭
const authStartButtons = document.querySelectorAll(".js-start-auth");

authStartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showStep("pwAuthCode");
    startTimer();
  });
});

// 인증번호 확인
authCodeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const authCode = document.querySelector("#authCode").value.trim();

  if (authCode === "") {
    alert("인증번호를 입력해주세요.");
    document.querySelector("#authCode").focus();
    return;
  }

  stopTimer();
  showStep("pwResetForm");
});

// 비밀번호 재설정
resetPwForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const newPw = document.querySelector("#newPw").value.trim();
  const newPwCheck = document.querySelector("#newPwCheck").value.trim();

  if (newPw === "") {
    alert("새로운 비밀번호를 입력해주세요.");
    document.querySelector("#newPw").focus();
    return;
  }

  if (newPwCheck === "") {
    alert("비밀번호 확인을 입력해주세요.");
    document.querySelector("#newPwCheck").focus();
    return;
  }

  if (newPw !== newPwCheck) {
    alert("비밀번호가 일치하지 않습니다.");
    document.querySelector("#newPwCheck").focus();
    return;
  }

  showStep("pwResetComplete");
});

// 로그인 페이지로 이동 버튼
const loginButtons = document.querySelectorAll(".js-go-login");

loginButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showLoginPanel();
  });
});

// 아이디 찾기 성공 후 비밀번호 찾기 이동
const goPwButtons = document.querySelectorAll(".js-go-pw");

goPwButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showPwFind();
  });
});

// 비밀번호 보기 / 숨기기
const passwordToggleButtons = document.querySelectorAll(".js-toggle-password");

passwordToggleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    const targetInput = document.querySelector(`#${targetId}`);
    const iconImage = button.querySelector("img");

    if (targetInput.type === "password") {
      targetInput.type = "text";
      iconImage.setAttribute("src", button.dataset.iconHide);
      button.setAttribute("aria-label", "비밀번호 숨기기");
    } else {
      targetInput.type = "password";
      iconImage.setAttribute("src", button.dataset.iconShow);
      button.setAttribute("aria-label", "비밀번호 보기");
    }
  });
});

// 입력값 지우기
const clearButtons = document.querySelectorAll(".js-clear-input");

clearButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.dataset.target;
    const targetInput = document.querySelector(`#${targetId}`);

    targetInput.value = "";
    targetInput.focus();
  });
});
