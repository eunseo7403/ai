// 메인 페이지 전용 스크립트

const noticeTabButtons = document.querySelectorAll(".notice-tab-list button");
const noticeCards = document.querySelectorAll(".notice-card");
const topButton = document.querySelector("#topButton");
const productSection = document.querySelector(".main-product");

noticeTabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filterValue = button.dataset.filter;

    noticeTabButtons.forEach((item) => {
      item.classList.remove("is-active");
    });

    button.classList.add("is-active");

    noticeCards.forEach((card) => {
      const cardCategory = card.dataset.category;

      if (filterValue === "all" || filterValue === cardCategory) {
        card.classList.remove("is-hidden");
      } else {
        card.classList.add("is-hidden");
      }
    });
  });
});

// TOP 버튼 노출 제어
const toggleTopButton = () => {
  if (!topButton || !productSection) {
    return;
  }

  const productSectionTop = productSection.offsetTop;

  if (window.scrollY >= productSectionTop - 80) {
    topButton.classList.add("is-show");
  } else {
    topButton.classList.remove("is-show");
  }
};

window.addEventListener("scroll", toggleTopButton);
window.addEventListener("load", toggleTopButton);

if (topButton) {
  topButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

// 갤러리 Swiper
const gallerySwiperElement = document.querySelector(".gallery-swiper");

if (gallerySwiperElement && typeof Swiper !== "undefined") {
  const gallerySwiper = new Swiper(".gallery-swiper", {
    slidesPerView: "auto",
    spaceBetween: 24,
    speed: 700,
    loop: true,
    grabCursor: true,
    slideToClickedSlide: true,

    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
  });
}
