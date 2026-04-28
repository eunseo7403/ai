// ==============================
// 메뉴 스크롤 이동
// ==============================

// 이동 기능이 필요한 링크들을 모두 선택합니다.
const scrollLinks = document.querySelectorAll(
  ".gnb-list a, .header-apply-button, .main-cta-button, .logo a",
);

// 고정 헤더 높이만큼 위치를 보정하기 위한 값입니다.
const header = document.querySelector(".site-header");

scrollLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    // 클릭한 a 태그의 href 값을 가져옵니다.
    const targetId = link.getAttribute("href");

    // href 값과 같은 id를 가진 section을 찾습니다.
    const targetSection = document.querySelector(targetId);

    if (!targetSection) return;

    const headerHeight = header.offsetHeight;

    // 이동할 섹션의 실제 위치를 계산합니다.
    const targetPosition =
      targetSection.getBoundingClientRect().top + window.scrollY - headerHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  });
});

// ==============================
// 신청 폼 유효성 검사 및 구글 스프레드시트 연결
// ==============================

const applyForm = document.querySelector("#applyForm");

const userName = document.querySelector("#userName");
const userPhone = document.querySelector("#userPhone");
const interest = document.querySelector("#interest");
const privacyAgree = document.querySelector("#privacyAgree");

// Google Apps Script 웹 앱 URL
const scriptURL =
  "https://script.google.com/macros/s/AKfycbwN01DEmzdhSGilxKars5b_t3aFgPvFZX8VjK5dr8xg75q-aZgoDNt31h7n_YjQYnCl/exec";

// 신청 완료 메시지를 화면에 보여주기 위한 요소를 생성합니다.
const completeMessage = document.createElement("p");
completeMessage.classList.add("complete-message");
completeMessage.textContent =
  "무료 진단 신청이 완료되었습니다. 확인 후 순차적으로 연락드릴게요.";

// 처음에는 화면에 보이지 않게 처리합니다.
completeMessage.style.display = "none";

// 신청 폼 맨 아래에 완료 메시지를 추가합니다.
applyForm.appendChild(completeMessage);

applyForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // 이름 입력 확인
  if (userName.value.trim() === "") {
    alert("이름을 입력해주세요.");
    userName.focus();
    return;
  }

  // 연락처 입력 확인
  if (userPhone.value.trim() === "") {
    alert("연락처를 입력해주세요.");
    userPhone.focus();
    return;
  }

  // 관심 분야 선택 확인
  if (interest.value === "") {
    alert("관심 분야를 선택해주세요.");
    interest.focus();
    return;
  }

  // 개인정보 동의 확인
  if (!privacyAgree.checked) {
    alert("개인정보 수집 및 이용에 동의해주세요.");
    privacyAgree.focus();
    return;
  }

  // 폼 데이터를 FormData 형태로 가져옵니다.
  const formData = new FormData(applyForm);

  // 제출 버튼 중복 클릭 방지
  const submitButton = applyForm.querySelector(".submit-button");
  submitButton.disabled = true;
  submitButton.textContent = "신청 중...";

  fetch(scriptURL, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.result === "success") {
        // 신청 완료 메시지 출력
        completeMessage.style.display = "block";

        alert(
          "무료 진단 신청이 완료되었습니다. 확인 후 순차적으로 연락드릴게요.",
        );

        // 폼 초기화
        applyForm.reset();
      } else {
        alert("신청 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        console.log(data);
      }
    })
    .catch((error) => {
      alert("신청 중 오류가 발생했습니다. 다시 시도해주세요.");
      console.log(error);
    })
    .finally(() => {
      // 제출 버튼 다시 활성화
      submitButton.disabled = false;
      submitButton.textContent = "무료 진단 신청하기";
    });
});

// ==============================
// 스크롤 등장 효과
// ==============================

// CSS에서 active 클래스가 붙으면 요소가 자연스럽게 보이도록 작성해두었습니다.
const animationItems = document.querySelectorAll(
  ".hero-content, .hero-visual, .section-heading, .problem-card, .step-card, .change-card, .apply-info, .apply-form",
);

const observerOptions = {
  threshold: 0.2,
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, observerOptions);

animationItems.forEach((item) => {
  scrollObserver.observe(item);
});

// ==============================
// TOP 버튼
// ==============================

// TOP 버튼을 JavaScript에서 생성합니다.
const topButton = document.createElement("button");
topButton.type = "button";
topButton.classList.add("top-button");
topButton.textContent = "TOP";

// body 안에 TOP 버튼을 추가합니다.
document.body.appendChild(topButton);

// 스크롤 위치가 500px 이상이면 TOP 버튼을 보여줍니다.
window.addEventListener("scroll", () => {
  if (window.scrollY > 500) {
    topButton.classList.add("show");
  } else {
    topButton.classList.remove("show");
  }
});

// TOP 버튼 클릭 시 페이지 맨 위로 부드럽게 이동합니다.
topButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
