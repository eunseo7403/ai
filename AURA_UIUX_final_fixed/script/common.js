const AURA_PATH = {
  onboarding: "./onboarding.html",
  login: "./login.html",
  home: "./home.html",
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

// 아직 별도 페이지가 없는 메뉴는 링크 대신 버튼으로 안내합니다.
const initComingSoonButtons = () => {
  const comingSoonButtons = document.querySelectorAll("[data-coming-soon]");

  comingSoonButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const label = button.dataset.comingSoon || "해당 기능";
      alert(label + " 기능은 준비 중입니다.");
    });
  });
};

// 공통 기능 실행
initSaveCodiButtons();
initComingSoonButtons();
