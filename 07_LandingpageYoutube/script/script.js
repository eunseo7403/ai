document.addEventListener("DOMContentLoaded", function () {
  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbwoywbtdLZH1Gcrw-40_0mcI5E828uFBF9CG7ODEAg2a2ocJM8ccMiSktkoHlMkVyE8og/exec";

  /* countdown */
  const digitMap = {
    0: document.getElementById("hour-tens"),
    1: document.getElementById("hour-ones"),
    2: document.getElementById("minute-tens"),
    3: document.getElementById("minute-ones"),
    4: document.getElementById("second-tens"),
    5: document.getElementById("second-ones"),
  };

  function hasAllClockDigits() {
    return Object.values(digitMap).every(Boolean);
  }

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

  if (hasAllClockDigits()) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* product select */
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

  /* modal */
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

    if (selectedProductText) {
      selectedProductText.textContent = selectedGift.value;
    }

    if (productNameField) {
      productNameField.value = selectedGift.value;
    }

    if (applyModal) {
      applyModal.classList.add("is-open");
      applyModal.setAttribute("aria-hidden", "false");
    }
  }

  function closeModal() {
    if (applyModal) {
      applyModal.classList.remove("is-open");
      applyModal.setAttribute("aria-hidden", "true");
    }
  }

  if (openApplyModalBtn) {
    openApplyModalBtn.addEventListener("click", openModal);
  }

  if (closeApplyModalBtn) {
    closeApplyModalBtn.addEventListener("click", closeModal);
  }

  if (cancelApplyModalBtn) {
    cancelApplyModalBtn.addEventListener("click", closeModal);
  }

  if (applyModal) {
    applyModal.addEventListener("click", function (e) {
      if (e.target === applyModal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Escape" &&
      applyModal &&
      applyModal.classList.contains("is-open")
    ) {
      closeModal();
    }
  });

  if (applyForm) {
    applyForm.addEventListener("submit", function (e) {
      const selectedGift = getSelectedGift();
      const applicantName = document
        .getElementById("applicantName")
        ?.value.trim();
      const phone = document.getElementById("phone")?.value.trim();
      const email = document.getElementById("email")?.value.trim();

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
        alert(
          "script.js 안의 APPS_SCRIPT_URL에 배포한 웹앱 주소를 넣어주세요.",
        );
        return;
      }

      if (productNameField) {
        productNameField.value = selectedGift.value;
      }

      applyForm.action = APPS_SCRIPT_URL;

      if (submitApplyBtn) {
        submitApplyBtn.disabled = true;
        submitApplyBtn.textContent = "전송 중...";
      }
    });
  }

  function resetProductSelection() {
    const firstEnabledRadio = document.querySelector(
      'input[name="gift"]:not(:disabled)',
    );

    cards.forEach((card) => card.classList.remove("selected"));

    if (firstEnabledRadio) {
      firstEnabledRadio.checked = true;
      const firstCard = firstEnabledRadio.closest(".product-card");

      if (firstCard) {
        firstCard.classList.add("selected");
      }
    }
  }

  window.addEventListener("message", function (event) {
    const data = event.data;

    if (!data || data.type !== "GSHEET_SUBMIT") {
      return;
    }

    if (submitApplyBtn) {
      submitApplyBtn.disabled = false;
      submitApplyBtn.textContent = "신청하기";
    }

    if (data.status === "success") {
      alert("응모가 완료되었습니다.");

      if (applyForm) {
        applyForm.reset();
      }

      resetProductSelection();
      closeModal();
    } else {
      alert("시트 저장 중 오류가 발생했습니다.\n" + (data.message || ""));
    }
  });
});
