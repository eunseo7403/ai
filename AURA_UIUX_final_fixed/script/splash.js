const splash = document.getElementById("splash");

// 스플래시 애니메이션이 끝난 뒤 온보딩 화면으로 이동합니다.
setTimeout(() => {
  location.href = AURA_PATH.onboarding;
}, 3600);
