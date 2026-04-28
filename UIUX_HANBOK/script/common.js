// 공통 스크립트 파일

const commonLinks = document.querySelectorAll("a[href='#']");

commonLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

// 공통 2depth 탭 메뉴 데이터
const menuData = {
  intro: {
    title: "협회소개",
    links: [
      { id: "intro", name: "협회소개", href: "./sub1.html#intro" },
      { id: "greeting", name: "인사말", href: "./sub1.html#greeting" },
      { id: "history", name: "연혁", href: "./sub1.html#history" },
      { id: "organization", name: "조직도", href: "./sub1.html#organization" },
      { id: "location", name: "오시는 길", href: "./sub1.html#location" },
    ],
  },

  pr: {
    title: "홍보광장",
    links: [
      { id: "notice", name: "공지사항", href: "./sub2.html#notice" },
      { id: "press", name: "언론보도", href: "./sub2.html#press" },
      { id: "gallery", name: "갤러리", href: "./sub2.html#gallery" },
      { id: "video", name: "영상", href: "./sub2.html#video" },
    ],
  },

  azalea: {
    title: "아젤리아 드레스",
    links: [
      { id: "brand", name: "브랜드 소개", href: "./sub3.html#brand" },
      { id: "dress", name: "아젤리아 드레스", href: "./sub3.html#dress" },
      { id: "royal", name: "아젤리아 궁중한복", href: "./sub3.html#royal" },
      { id: "kids", name: "아젤리아 키즈", href: "./sub3.html#kids" },
      {
        id: "fashion-show",
        name: "아젤리아 패션쇼 & 어워즈",
        href: "./sub3.html#fashion-show",
      },
      { id: "art", name: "아젤리아 예술단", href: "./sub3.html#art" },
    ],
  },

  exchange: {
    title: "국제교류체험관",
    links: [
      {
        id: "magazine",
        name: "아젤리아 메거진",
        href: "./sub4.html#magazine",
      },
      { id: "tv", name: "아젤리아 TV 방송", href: "./sub4.html#tv" },
      { id: "enter", name: "아젤리아 엔터", href: "./sub4.html#enter" },
      {
        id: "event",
        name: "국내 · 국제교류 기획 공연 이벤트",
        href: "./sub4.html#event",
      },
      {
        id: "experience",
        name: "국제교류한복체험",
        href: "./sub4.html#experience",
      },
      { id: "forum", name: "전통한문화포럼", href: "./sub4.html#forum" },
    ],
  },

  welfare: {
    title: "나눔과기쁨 & 복지관",
    links: [
      { id: "nanum", name: "(사) 나눔과 기쁨", href: "./sub5.html#nanum" },
    ],
  },

  partner: {
    title: "협력기관",
    links: [
      {
        id: "partner-info",
        name: "협력기관 정보",
        href: "./sub6.html#partner-info",
      },
    ],
  },
};

const siteHeader = document.querySelector(".site-header");
const gnbLinks = document.querySelectorAll(".gnb a[data-menu]");
const subMenuWrap = document.querySelector("#subMenuWrap");
const subMenuTitle = document.querySelector("#subMenuTitle");
const subMenuList = document.querySelector("#subMenuList");

const pageMenu = document.body.dataset.menu;
const pageSub = document.body.dataset.sub;

const showSubMenu = () => {
  if (subMenuWrap) {
    subMenuWrap.classList.add("is-show");
  }
};

const hideSubMenu = () => {
  if (subMenuWrap) {
    subMenuWrap.classList.remove("is-show");
  }
};

const renderSubMenu = (menuKey) => {
  const currentMenu = menuData[menuKey];

  if (!currentMenu || !subMenuTitle || !subMenuList) {
    return;
  }

  subMenuTitle.textContent = currentMenu.title;
  subMenuList.innerHTML = "";

  gnbLinks.forEach((link) => {
    link.classList.remove("is-active");
    link.removeAttribute("aria-current");
  });

  if (pageMenu === menuKey) {
    const activeGnb = document.querySelector(`.gnb a[data-menu="${menuKey}"]`);

    if (activeGnb) {
      activeGnb.classList.add("is-active");
      activeGnb.setAttribute("aria-current", "page");
    }
  }

  const activeSubId = pageMenu === menuKey && pageSub ? pageSub : "";

  currentMenu.links.forEach((item) => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = item.href;
    a.textContent = item.name;

    if (item.id === activeSubId) {
      a.classList.add("is-active");
    }

    li.appendChild(a);
    subMenuList.appendChild(li);
  });
};

if (subMenuWrap && subMenuTitle && subMenuList && siteHeader) {
  if (pageMenu && menuData[pageMenu]) {
    renderSubMenu(pageMenu);
    showSubMenu();
  } else {
    renderSubMenu("intro");
  }

  gnbLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      const menuKey = link.dataset.menu;

      renderSubMenu(menuKey);
      showSubMenu();
    });

    link.addEventListener("focus", () => {
      const menuKey = link.dataset.menu;

      renderSubMenu(menuKey);
      showSubMenu();
    });
  });

  siteHeader.addEventListener("mouseleave", () => {
    if (pageMenu && menuData[pageMenu]) {
      renderSubMenu(pageMenu);
      showSubMenu();
    } else {
      hideSubMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !pageMenu) {
      hideSubMenu();
    }
  });
}

// 모바일 전체 메뉴 생성
const mobileMenuButton = document.querySelector("#mobileMenuButton");
const mobileMenuList = document.querySelector("#mobileMenuList");

const mobileMenuData = [
  {
    key: "intro",
    title: "협회소개",
    href: "./sub1.html",
    children: [
      { name: "협회소개", href: "./sub1.html#intro" },
      { name: "인사말", href: "./sub1.html#greeting" },
      { name: "연혁", href: "./sub1.html#history" },
      { name: "조직도", href: "./sub1.html#organization" },
      { name: "오시는 길", href: "./sub1.html#location" },
    ],
  },
  {
    key: "pr",
    title: "홍보광장",
    href: "./sub2.html",
    children: [
      { name: "공지사항", href: "./sub2.html#notice" },
      { name: "언론보도", href: "./sub2.html#press" },
      { name: "갤러리", href: "./sub2.html#gallery" },
      { name: "영상", href: "./sub2.html#video" },
    ],
  },
  {
    key: "azalea",
    title: "아젤리아패션그룹",
    href: "./sub3.html",
    children: [
      { name: "브랜드 소개", href: "./sub3.html#brand" },
      { name: "아젤리아 드레스", href: "./sub3.html#dress" },
      { name: "아젤리아 궁중한복", href: "./sub3.html#royal" },
      { name: "아젤리아 키즈", href: "./sub3.html#kids" },
      {
        name: "아젤리아 패션쇼 & 어워즈",
        href: "./sub3.html#fashion-show",
      },
      { name: "아젤리아 예술단", href: "./sub3.html#art" },
    ],
  },
  {
    key: "exchange",
    title: "국제교류체험관",
    href: "./sub4.html",
    children: [
      { name: "아젤리아 메거진", href: "./sub4.html#magazine" },
      { name: "아젤리아 TV 방송", href: "./sub4.html#tv" },
      { name: "아젤리아 엔터", href: "./sub4.html#enter" },
      {
        name: "국내 · 국제교류 기획 공연 이벤트",
        href: "./sub4.html#event",
      },
      { name: "국제교류한복체험", href: "./sub4.html#experience" },
      { name: "전통한문화포럼", href: "./sub4.html#forum" },
    ],
  },
  {
    key: "welfare",
    title: "나눔과기쁨 & 복지관",
    href: "./sub5.html",
    children: [],
  },
  {
    key: "partner",
    title: "협력기관",
    href: "./sub6.html",
    children: [],
  },
];

const closeMobileSubMenus = () => {
  const mobileMenuItems = document.querySelectorAll(".mobile-menu-item");

  mobileMenuItems.forEach((item) => {
    item.classList.remove("is-open");
  });
};

const clearMobileMenuFocus = () => {
  const activeElement = document.activeElement;

  if (
    activeElement &&
    (activeElement.closest(".mobile-nav") || activeElement === mobileMenuButton)
  ) {
    activeElement.blur();
  }
};

const closeMobileMenu = () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.remove("is-mobile-open");
  document.body.style.overflow = "";
  closeMobileSubMenus();
  clearMobileMenuFocus();

  if (mobileMenuButton) {
    mobileMenuButton.setAttribute("aria-expanded", "false");
    mobileMenuButton.setAttribute("aria-label", "모바일 메뉴 열기");
    mobileMenuButton.blur();
  }
};

const createMobileMenu = () => {
  if (!mobileMenuList) {
    return;
  }

  mobileMenuList.innerHTML = "";

  mobileMenuData.forEach((menu) => {
    const menuItem = document.createElement("li");
    menuItem.className = "mobile-menu-item";

    if (menu.children.length > 0) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "mobile-menu-head";
      button.innerHTML = `
        <span>${menu.title}</span>
        <span class="mobile-menu-arrow" aria-hidden="true"></span>
      `;

      const subList = document.createElement("ul");

      subList.className = "mobile-sub-list";

      menu.children.forEach((child) => {
        const subItem = document.createElement("li");
        const subLink = document.createElement("a");

        subLink.href = child.href;
        subLink.textContent = child.name;

        subLink.addEventListener("click", () => {
          clearMobileMenuFocus();
        });

        subItem.appendChild(subLink);
        subList.appendChild(subItem);
      });

      button.addEventListener("click", () => {
        const isOpen = menuItem.classList.contains("is-open");

        closeMobileSubMenus();

        if (!isOpen) {
          menuItem.classList.add("is-open");
        }

        button.blur();
      });

      menuItem.appendChild(button);
      menuItem.appendChild(subList);
    } else {
      const link = document.createElement("a");

      link.className = "mobile-direct-link";
      link.href = menu.href;
      link.textContent = menu.title;

      link.addEventListener("click", () => {
        clearMobileMenuFocus();
      });

      menuItem.appendChild(link);
    }

    mobileMenuList.appendChild(menuItem);
  });
};

createMobileMenu();

// 모바일 메뉴 열기 / 닫기
if (mobileMenuButton && siteHeader) {
  mobileMenuButton.addEventListener("click", () => {
    const isOpen = !siteHeader.classList.contains("is-mobile-open");

    if (isOpen) {
      siteHeader.classList.add("is-mobile-open");
      mobileMenuButton.setAttribute("aria-expanded", "true");
      mobileMenuButton.setAttribute("aria-label", "모바일 메뉴 닫기");
      document.body.style.overflow = "hidden";
      closeMobileSubMenus();
    } else {
      closeMobileMenu();
    }

    mobileMenuButton.blur();
  });
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 1024) {
    closeMobileMenu();
  }
});
