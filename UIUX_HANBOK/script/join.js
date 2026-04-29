// 회원가입 페이지 전용 스크립트

const stepList = document.querySelector(".join-step-list");
const stepItems = document.querySelectorAll(".join-step");
const stepTerms = document.querySelector("#stepTerms");
const stepInfo = document.querySelector("#stepInfo");
const stepComplete = document.querySelector("#stepComplete");

const agreeAll = document.querySelector("#agreeAll");
const requiredAgrees = document.querySelectorAll(".required-agree");
const termsNextBtn = document.querySelector("#termsNextBtn");

const agreementToggles = document.querySelectorAll(".agreement-toggle");

const joinForm = document.querySelector("#joinForm");
const idCheckBtn = document.querySelector("#idCheckBtn");
const emailSelect = document.querySelector("#emailSelect");
const emailDomain = document.querySelector("#emailDomain");

let isIdChecked = false;

// 단계 화면 전환
const showJoinStep = (stepNumber) => {
  stepList.classList.remove("step-1", "step-2", "step-3");
  stepList.classList.add(`step-${stepNumber}`);

  stepTerms.hidden = true;
  stepInfo.hidden = true;
  stepComplete.hidden = true;

  stepItems.forEach((item, index) => {
    const currentStep = index + 1;

    item.classList.remove("is-active");
    item.classList.remove("is-complete");

    if (currentStep < stepNumber) {
      item.classList.add("is-complete");
    }

    if (currentStep === stepNumber) {
      item.classList.add("is-active");
    }
  });

  if (stepNumber === 1) {
    stepTerms.hidden = false;
  }

  if (stepNumber === 2) {
    stepInfo.hidden = false;
  }

  if (stepNumber === 3) {
    stepComplete.hidden = false;

    stepItems.forEach((item) => {
      item.classList.remove("is-active");
      item.classList.add("is-complete");
    });
  }
};

// 약관 아코디언
agreementToggles.forEach((button) => {
  button.addEventListener("click", () => {
    const agreementItem = button.closest(".agreement-item");

    agreementItem.classList.toggle("is-open");
  });
});

// 전체동의
agreeAll.addEventListener("change", () => {
  requiredAgrees.forEach((checkbox) => {
    checkbox.checked = agreeAll.checked;
  });
});

// 개별 동의 체크 시 전체동의 상태 변경
requiredAgrees.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const isAllChecked = Array.from(requiredAgrees).every((item) => {
      return item.checked;
    });

    agreeAll.checked = isAllChecked;
  });
});

// 약관 확인 버튼
termsNextBtn.addEventListener("click", () => {
  const isAllRequiredChecked = Array.from(requiredAgrees).every((item) => {
    return item.checked;
  });

  if (!isAllRequiredChecked) {
    alert("필수 약관에 모두 동의해주세요.");
    return;
  }

  showJoinStep(2);
});

// 아이디 중복확인
idCheckBtn.addEventListener("click", () => {
  const joinId = document.querySelector("#joinId").value.trim();

  if (joinId === "") {
    alert("아이디를 입력해주세요.");
    document.querySelector("#joinId").focus();
    return;
  }

  isIdChecked = true;
  alert("사용 가능한 아이디입니다.");
});

// 아이디 값이 바뀌면 중복확인 다시 필요
document.querySelector("#joinId").addEventListener("input", () => {
  isIdChecked = false;
});

// 이메일 도메인 선택
emailSelect.addEventListener("change", () => {
  const selectedValue = emailSelect.value;

  if (selectedValue === "") {
    emailDomain.value = "";
    emailDomain.readOnly = false;
    emailDomain.focus();
  } else {
    emailDomain.value = selectedValue;
    emailDomain.readOnly = true;
  }
});

// 회원정보 작성 완료
joinForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const joinId = document.querySelector("#joinId").value.trim();
  const joinName = document.querySelector("#joinName").value.trim();
  const joinPw = document.querySelector("#joinPw").value.trim();
  const joinPwCheck = document.querySelector("#joinPwCheck").value.trim();
  const emailId = document.querySelector("#emailId").value.trim();
  const emailDomainValue = document.querySelector("#emailDomain").value.trim();
  const phoneMiddle = document.querySelector("#phoneMiddle").value.trim();
  const phoneLast = document.querySelector("#phoneLast").value.trim();
  const activity = document.querySelector("#activity").value.trim();

  const passwordPattern =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[?!@#*])[A-Za-z\d?!@#*]{8,12}$/;

  if (joinId === "") {
    alert("아이디를 입력해주세요.");
    document.querySelector("#joinId").focus();
    return;
  }

  if (!isIdChecked) {
    alert("아이디 중복확인을 해주세요.");
    idCheckBtn.focus();
    return;
  }

  if (joinName === "") {
    alert("이름을 입력해주세요.");
    document.querySelector("#joinName").focus();
    return;
  }

  if (joinPw === "") {
    alert("비밀번호를 입력해주세요.");
    document.querySelector("#joinPw").focus();
    return;
  }

  if (!passwordPattern.test(joinPw)) {
    alert("비밀번호는 영문, 숫자, 특수기호를 혼합하여 8-12자로 입력해주세요.");
    document.querySelector("#joinPw").focus();
    return;
  }

  if (joinPwCheck === "") {
    alert("비밀번호를 한번 더 입력해주세요.");
    document.querySelector("#joinPwCheck").focus();
    return;
  }

  if (joinPw !== joinPwCheck) {
    alert("비밀번호가 일치하지 않습니다.");
    document.querySelector("#joinPwCheck").focus();
    return;
  }

  if (emailId === "") {
    alert("이메일을 입력해주세요.");
    document.querySelector("#emailId").focus();
    return;
  }

  if (emailDomainValue === "") {
    alert("이메일 도메인을 입력해주세요.");
    document.querySelector("#emailDomain").focus();
    return;
  }

  if (phoneMiddle === "" || phoneLast === "") {
    alert("전화번호를 입력해주세요.");
    document.querySelector("#phoneMiddle").focus();
    return;
  }

  if (activity === "") {
    alert("활동분야를 입력해주세요.");
    document.querySelector("#activity").focus();
    return;
  }

  showJoinStep(3);
});
