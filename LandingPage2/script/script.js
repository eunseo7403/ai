document.addEventListener("DOMContentLoaded", function () {
  const APPS_SCRIPT_URL = "여기에_배포한_웹앱_URL_붙여넣기";

  const digitMap = {
    0: document.getElementById("hour-tens"),
    1: document.getElementById("hour-ones"),
    2: document.getElementById("minute-tens"),
    3: document.getElementById("minute-ones"),
    4: document.getElementById("second-tens"),
    5: document.getElementById("second-ones"),
  };

  function updateCountdown() {
    const now = new Date();

    const target = new Date();
    target.setHours(22, 0, 0, 0);

    if (now >= target) {
      target.setDate(target.getDate() + 1);
    }

    const diff = target - now;

    const totalSeconds = Math.floor(diff / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0",
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    const timeString = `${hours}${minutes}${seconds}`;

    for (let i = 0; i < timeString.length; i++) {
      if (digitMap[i]) {
        digitMap[i].textContent = timeString[i];
      }
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  const cards = document.querySelectorAll(".product-card");
  const radios = document.querySelectorAll('input[name="gift"]');

  radios.forEach((radio) => {
    radio.addEventListener("change", function () {
      cards.forEach((card) => card.classList.remove("selected"));

      const currentCard = this.closest(".product-card");
      if (this.checked && currentCard) {
        currentCard.classList.add("selected");
      }
    });
  });

  const openApplyModalBtn = document.getElementById("openApplyModal");
  const applyModal = document.getElementById("applyModal");
  const closeApplyModalBtn = document.getElementById("closeApplyModal");
  const cancelApplyModalBtn = document.getElementById("cancelApplyModal");
  const selectedProductText = document.getElementById("selectedProductText");
  const productNameField = document.getElementById("productNameField");
  const applyForm = document.getElementById("applyForm");
  const submitApplyBtn = document.getElementById("submitApplyBtn");

  function getSelectedGift() {
    return document.querySelector('input[name="gift"]:checked');
  }

  function openModal() {
    const selectedGift = getSelectedGift();

    if (!selectedGift) {
      alert("응모할 상품을 먼저 선택해주세요.");
      return;
    }

    if (selectedGift.disabled) {
      alert("선택할 수 없는 상품입니다.");
      return;
    }

    selectedProductText.textContent = selectedGift.value;
    productNameField.value = selectedGift.value;

    applyModal.classList.add("is-open");
    applyModal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    applyModal.classList.remove("is-open");
    applyModal.setAttribute("aria-hidden", "true");
  }

  openApplyModalBtn.addEventListener("click", openModal);
  closeApplyModalBtn.addEventListener("click", closeModal);
  cancelApplyModalBtn.addEventListener("click", closeModal);

  applyModal.addEventListener("click", function (e) {
    if (e.target === applyModal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && applyModal.classList.contains("is-open")) {
      closeModal();
    }
  });

  applyForm.addEventListener("submit", function (e) {
    const selectedGift = getSelectedGift();
    const applicantName = document.getElementById("applicantName").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!selectedGift) {
      e.preventDefault();
      alert("응모할 상품을 먼저 선택해주세요.");
      return;
    }

    if (!applicantName || !phone || !email) {
      e.preventDefault();
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (
      !APPS_SCRIPT_URL ||
      APPS_SCRIPT_URL.includes("여기에_배포한_웹앱_URL")
    ) {
      e.preventDefault();
      alert("script.js 안의 APPS_SCRIPT_URL에 배포한 웹앱 주소를 넣어주세요.");
      return;
    }

    productNameField.value = selectedGift.value;
    applyForm.action = APPS_SCRIPT_URL;

    submitApplyBtn.disabled = true;
    submitApplyBtn.textContent = "전송 중...";
  });

  window.addEventListener("message", function (event) {
    const data = event.data;

    if (!data || data.type !== "GSHEET_SUBMIT") {
      return;
    }

    submitApplyBtn.disabled = false;
    submitApplyBtn.textContent = "신청하기";

    if (data.status === "success") {
      alert("응모가 완료되었습니다.");
      applyForm.reset();
      closeModal();
    } else {
      alert("시트 저장 중 오류가 발생했습니다.\n" + (data.message || ""));
    }
  });
});
