const nextButton = document.querySelector(".onboarding-next");
const skipButton = document.querySelector(".onboarding-skip");
const dots = document.querySelectorAll(".onboarding-dot");
const styleCards = document.querySelectorAll(".style-card");

const selectedStyles = [];

// common.js에 AURA_PATH.login이 있으면 그 경로를 사용하고,
// 없으면 같은 폴더의 login.html로 이동합니다.
const LOGIN_PATH =
  typeof AURA_PATH !== "undefined" && AURA_PATH.login
    ? AURA_PATH.login
    : "./login.html";

// Swiper 실행
const onboardingSwiper = new Swiper(".onboarding-swiper", {
  slidesPerView: 1,
  speed: 500,
  allowTouchMove: true,
});

// 현재 슬라이드에 맞춰 하단 점 active 변경
const updateDots = () => {
  const activeIndex = onboardingSwiper.activeIndex;

  dots.forEach((dot, index) => {
    dot.classList.remove("active");

    if (index === activeIndex) {
      dot.classList.add("active");
    }
  });
};

// 마지막 슬라이드에서는 버튼 문구를 시작하기로 변경
const updateButtonText = () => {
  if (onboardingSwiper.isEnd) {
    nextButton.textContent = "시작하기";
  } else {
    nextButton.textContent = "다음";
  }
};

// 처음 화면 상태 적용
updateDots();
updateButtonText();

// 슬라이드가 바뀔 때 실행
onboardingSwiper.on("slideChange", () => {
  updateDots();
  updateButtonText();
});

// 점 버튼 클릭 시 해당 슬라이드로 이동
dots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const slideIndex = Number(dot.dataset.index);

    onboardingSwiper.slideTo(slideIndex);
  });
});

// 스타일 카드 선택 기능
styleCards.forEach((card) => {
  card.addEventListener("click", () => {
    const styleName = card.dataset.style;
    const isSelected = card.classList.contains("active");

    // 이미 선택된 카드를 다시 누르면 선택 해제
    if (isSelected) {
      card.classList.remove("active");

      const selectedIndex = selectedStyles.indexOf(styleName);
      selectedStyles.splice(selectedIndex, 1);

      return;
    }

    // 최대 5개까지만 선택 가능
    if (selectedStyles.length >= 5) {
      alert("최대 5개까지 선택할 수 있습니다.");
      return;
    }

    card.classList.add("active");
    selectedStyles.push(styleName);
  });
});

// 다음 / 시작하기 버튼 클릭
nextButton.addEventListener("click", () => {
  // 마지막 슬라이드라면 로그인 페이지로 이동
  if (onboardingSwiper.isEnd) {
    console.log("선택한 스타일:", selectedStyles);

    location.href = LOGIN_PATH;
    return;
  }

  // 마지막 슬라이드가 아니면 다음 슬라이드로 이동
  onboardingSwiper.slideNext();
});

// 건너뛰기 버튼 클릭
skipButton.addEventListener("click", () => {
  location.href = LOGIN_PATH;
});
