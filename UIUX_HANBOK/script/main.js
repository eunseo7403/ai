// 메인 페이지 전용 스크립트

// 메인 비주얼 슬라이드 + product 내용 연동
const mainVisualData = [
  {
    visualMain: "한복",
    visualSub: "한국의 전통의상",
    visualDesc: "“ 아름다운 우리 옷 한복<br />전통에 스며들다. ”",
    visualEn: "be influenced by tradition",

    productNumber: "01",
    productCategory: '태극문양디자인<span class="mobile-hide-text">등록</span>',
    productTitle: "한복드레스",
    productDesc: "디자인등록특허<br />제30-1087062호",
    productThumb: "./images/pc_banner.png",
    productThumbAlt: "한복드레스",

    productBgPc: "./images/pc_banner.png",
    productBgTab: "./images/tab_banner.png",
    productBgMo: "./images/mo_banner.png",
  },
  {
    visualMain: "드레스",
    visualSub: "전통과 현대의 조화",
    visualDesc: "“ 전통의 선을 살려<br />새로운 아름다움을 입다. ”",
    visualEn: "modern beauty of hanbok",

    productNumber: "02",
    productCategory: '아젤리아디자인<span class="mobile-hide-text">등록</span>',
    productTitle: "아젤리아드레스",
    productDesc: "전통미를 담은<br />현대 한복 드레스",
    productThumb: "./images/pc_banner02.png",
    productThumbAlt: "아젤리아드레스",

    productBgPc: "./images/pc_banner02.png",
    productBgTab: "./images/pc_banner02.png",
    productBgMo: "./images/pc_banner02.png",
  },
  {
    visualMain: "문화",
    visualSub: "한복으로 잇는 가치",
    visualDesc: "“ 우리의 색과 선으로<br />문화를 이어가다. ”",
    visualEn: "connect culture with hanbok",

    productNumber: "03",
    productCategory: '전통문화디자인<span class="mobile-hide-text">소개</span>',
    productTitle: "전통문화한복",
    productDesc: "한국의 아름다움을<br />새롭게 표현하다",
    productThumb: "./images/pc_banner03.png",
    productThumbAlt: "전통문화한복",

    productBgPc: "./images/pc_banner03.png",
    productBgTab: "./images/pc_banner03.png",
    productBgMo: "./images/pc_banner03.png",
  },
];

const mainVisualElement = document.querySelector(".main-visual-swiper");
const mainProduct = document.querySelector(".main-product");
const visualControlButtons = document.querySelectorAll(".visual-control-btn");

const visualMainText = document.querySelector("#visualMainText");
const visualSubTitle = document.querySelector("#visualSubTitle");
const visualDesc = document.querySelector("#visualDesc");
const visualEnCopy = document.querySelector("#visualEnCopy");

const productNumber = document.querySelector("#productNumber");
const productCategory = document.querySelector("#productCategory");
const productTitle = document.querySelector("#productTitle");
const productDesc = document.querySelector("#productDesc");
const productThumb = document.querySelector("#productThumb");

let mainVisualSwiper = null;

// 메인 비주얼 슬라이드 선택 버튼 활성화
const updateVisualControlButtons = (index) => {
  visualControlButtons.forEach((button, buttonIndex) => {
    const isActive = index === buttonIndex;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
};

// 메인 비주얼 텍스트 + product 내용 변경
const updateMainVisualContent = (index) => {
  const currentData = mainVisualData[index];

  if (!currentData) {
    return;
  }

  visualMainText.textContent = currentData.visualMain;
  visualSubTitle.textContent = currentData.visualSub;
  visualDesc.innerHTML = currentData.visualDesc;
  visualEnCopy.textContent = currentData.visualEn;

  productNumber.textContent = currentData.productNumber;
  productCategory.innerHTML = currentData.productCategory;
  productTitle.textContent = currentData.productTitle;
  productDesc.innerHTML = currentData.productDesc;

  productThumb.setAttribute("src", currentData.productThumb);
  productThumb.setAttribute("alt", currentData.productThumbAlt);

  mainProduct.style.setProperty(
    "--product-bg-pc",
    `url("${currentData.productBgPc}")`,
  );
  mainProduct.style.setProperty(
    "--product-bg-tab",
    `url("${currentData.productBgTab}")`,
  );
  mainProduct.style.setProperty(
    "--product-bg-mo",
    `url("${currentData.productBgMo}")`,
  );

  updateVisualControlButtons(index);
};

// 메인 비주얼 Swiper
if (mainVisualElement && typeof Swiper !== "undefined") {
  mainVisualSwiper = new Swiper(".main-visual-swiper", {
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
    loop: true,
    speed: 800,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },

    on: {
      init(swiper) {
        updateMainVisualContent(swiper.realIndex);
      },
      slideChange(swiper) {
        updateMainVisualContent(swiper.realIndex);
      },
    },
  });
}

// 메인 비주얼 선택 버튼 클릭
visualControlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!mainVisualSwiper) {
      return;
    }

    const slideIndex = Number(button.dataset.slide);

    mainVisualSwiper.slideToLoop(slideIndex);
  });
});

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
const galleryMediaQuery = window.matchMedia("(min-width: 768px)");
let gallerySwiper = null;

const initGallerySwiper = () => {
  if (!gallerySwiperElement || typeof Swiper === "undefined") {
    return;
  }

  if (galleryMediaQuery.matches) {
    if (gallerySwiper) {
      return;
    }

    gallerySwiper = new Swiper(".gallery-swiper", {
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

    return;
  }

  if (gallerySwiper) {
    gallerySwiper.destroy(true, true);
    gallerySwiper = null;
  }

  const galleryTrack = document.querySelector(".gallery-track");
  const galleryCards = document.querySelectorAll(".gallery-card");

  if (galleryTrack) {
    galleryTrack.removeAttribute("style");
  }

  galleryCards.forEach((card) => {
    card.removeAttribute("style");
  });
};

initGallerySwiper();

galleryMediaQuery.addEventListener("change", initGallerySwiper);

// 스크롤 시 섹션 등장 효과 - PC only
const revealElements = document.querySelectorAll(".scroll-reveal");
const revealMediaQuery = window.matchMedia("(min-width: 1025px)");

if (revealElements.length > 0 && revealMediaQuery.matches) {
  if ("IntersectionObserver" in window) {
    document.body.classList.add("is-reveal-ready");

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-show");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -80px 0px",
      },
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-show");
    });
  }
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-show");
  });
}
