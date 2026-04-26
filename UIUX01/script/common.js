const AURA_PATH = {
  onboarding: "./onboarding.html",
  login: "./login.html",
  home: "./home.html",
};

const HEART_EMPTY = "./images/home/icons/heart.png";
const HEART_FILL = "./images/home/icons/heart-fill.png";

// 공통 좋아요 버튼 기능
const initHeartButtons = () => {
  const heartButtons = document.querySelectorAll(".heart-button");

  heartButtons.forEach((button) => {
    const heartImg = button.querySelector("img");

    if (!heartImg) return;

    button.addEventListener("click", () => {
      const isActive = button.classList.contains("active");

      if (isActive) {
        button.classList.remove("active");
        heartImg.src = HEART_EMPTY;
        return;
      }

      button.classList.add("active");
      heartImg.src = HEART_FILL;
    });
  });
};

// 공통 오늘의 코디 저장 버튼 기능
const initSaveCodiButtons = () => {
  const saveCodiButtons = document.querySelectorAll(".save-codi-button");

  saveCodiButtons.forEach((button) => {
    button.addEventListener("click", () => {
      alert("오늘의 코디가 저장되었습니다.");
    });
  });
};

// 공통 기능 실행
initHeartButtons();
initSaveCodiButtons();
