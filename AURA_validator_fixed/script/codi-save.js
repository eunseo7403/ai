const codiSaveButton = document.querySelector(".codi-save-button");
const codiAddButton = document.querySelector(".codi-clothes-add-card");
const editClothesButton = document.querySelector(".edit-clothes-button");
const clothesList = document.querySelector(".codi-clothes-scroll");
const clothesSelectSheet = document.getElementById("clothesSelectSheet");
const clothesSelectList = document.getElementById("clothesSelectList");
const clothesSelectClose = document.querySelector(".clothes-select-close");
const selectCategoryTabs = document.querySelectorAll(".select-category-tab");
const previewLayers = document.querySelectorAll(".preview-layer");

let isEditMode = false;
let currentSelectCategory = "전체";

/* ================================
   보유 옷 목록 데이터
================================ */

const closetItems = [
  {
    name: "자켓",
    category: "아우터",
    season: "봄/가을",
    image: "./images/clothes/codi/outerwear.png",
  },
  {
    name: "울 코트",
    category: "아우터",
    season: "봄/가을",
    image: "./images/clothes/08.png",
  },
  {
    name: "니트 스웨터",
    category: "상의",
    season: "가을/겨울",
    image: "./images/clothes/codi/top.png",
  },
  {
    name: "후드티",
    category: "상의",
    season: "봄/가을/겨울",
    image: "./images/clothes/10.png",
  },
  {
    name: "데님 팬츠",
    category: "하의",
    season: "모든 계절",
    image: "./images/clothes/codi/bottom.png",
  },
  {
    name: "슬랙스",
    category: "하의",
    season: "모든 계절",
    image: "./images/clothes/09.png",
  },
  {
    name: "스니커즈",
    category: "신발",
    season: "모든 계절",
    image: "./images/clothes/04.png",
  },
  {
    name: "목도리",
    category: "악세서리",
    season: "겨울",
    image: "./images/clothes/03.png",
  },
  {
    name: "버킷햇",
    category: "모자",
    season: "봄/여름",
    image: "./images/clothes/11.png",
  },
  {
    name: "미니백",
    category: "가방",
    season: "모든 계절",
    image: "./images/clothes/12.png",
  },
];

/* ================================
   추천 코디 데이터
   codi.html의 data-codi-id 값과 이름이 같아야 함
================================ */

const codiPresets = {
  casual: [
    {
      name: "자켓",
      category: "아우터",
      season: "봄/가을",
      image: "./images/clothes/codi/outerwear.png",
    },
    {
      name: "니트 스웨터",
      category: "상의",
      season: "가을/겨울",
      image: "./images/clothes/codi/top.png",
    },
    {
      name: "데님 팬츠",
      category: "하의",
      season: "모든 계절",
      image: "./images/clothes/codi/bottom.png",
    },
  ],

  minimal: [
    {
      name: "울 코트",
      category: "아우터",
      season: "봄/가을",
      image: "./images/clothes/08.png",
    },
    {
      name: "니트 스웨터",
      category: "상의",
      season: "가을/겨울",
      image: "./images/clothes/05.png",
    },
    {
      name: "슬랙스",
      category: "하의",
      season: "모든 계절",
      image: "./images/clothes/09.png",
    },
  ],

  trendy: [
    {
      name: "자켓",
      category: "아우터",
      season: "봄/가을",
      image: "./images/clothes/codi/outerwear.png",
    },
    {
      name: "니트 스웨터",
      category: "상의",
      season: "모든 계절",
      image: "./images/clothes/05.png",
    },
    {
      name: "슬랙스",
      category: "하의",
      season: "모든 계절",
      image: "./images/clothes/09.png",
    },
  ],
};

/* ================================
   옷 선택 바텀시트
================================ */

const openSelectSheet = () => {
  clothesSelectSheet.classList.add("active");
  clothesSelectSheet.setAttribute("aria-hidden", "false");
  renderSelectList();
};

const closeSelectSheet = () => {
  clothesSelectSheet.classList.remove("active");
  clothesSelectSheet.setAttribute("aria-hidden", "true");
};

const renderSelectList = () => {
  clothesSelectList.innerHTML = "";

  const filteredItems =
    currentSelectCategory === "전체"
      ? closetItems
      : closetItems.filter((item) => item.category === currentSelectCategory);

  filteredItems.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "select-clothes-item";

    button.innerHTML = `
      <div class="select-clothes-thumb">
        <img src="${item.image}" alt="${item.name}" />
      </div>

      <div class="select-clothes-info">
        <strong>${item.name}</strong>
        <span>${item.category} · ${item.season}</span>
      </div>
    `;

    button.addEventListener("click", () => {
      addClothesItem(item);
      updatePreviewLayer(item);
      closeSelectSheet();
    });

    clothesSelectList.appendChild(button);
  });
};

/* ================================
   옷 목록 추가 / 변경
================================ */

const addClothesItem = (item) => {
  const sameCategoryCard = clothesList.querySelector(
    `.codi-clothes-card[data-category="${item.category}"]`,
  );

  if (sameCategoryCard) {
    const img = sameCategoryCard.querySelector(".clothes-thumb img");
    const title = sameCategoryCard.querySelector("h3");

    img.src = item.image;
    img.alt = item.name;
    title.innerHTML = `${item.category}<span> · 1개</span>`;

    return;
  }

  const article = document.createElement("article");
  article.className = "codi-clothes-card";
  article.dataset.category = item.category;

  article.innerHTML = `
    <button type="button" class="clothes-delete-button" aria-label="${item.category} 삭제">
      <img src="./images/icons/my/close.png" alt="" />
    </button>

    <div class="clothes-thumb">
      <img src="${item.image}" alt="${item.name}" />
    </div>

    <h3>
      ${item.category}
      <span>· 1개</span>
    </h3>
  `;

  clothesList.insertBefore(article, codiAddButton);
};

const updatePreviewLayer = (item) => {
  const previewLayer = Array.from(previewLayers).find((layer) => {
    return layer.dataset.previewCategory === item.category;
  });

  if (!previewLayer) {
    return;
  }

  previewLayer.src = item.image;
  previewLayer.alt = item.name;
  previewLayer.classList.remove("is-hidden");
};

const deleteClothesItem = (card) => {
  const category = card.dataset.category;

  const previewLayer = Array.from(previewLayers).find((layer) => {
    return layer.dataset.previewCategory === category;
  });

  if (previewLayer) {
    previewLayer.classList.add("is-hidden");
  }

  card.remove();
};

/* ================================
   코디 저장 화면 초기화
================================ */

const clearCodiState = () => {
  const currentCards = document.querySelectorAll(".codi-clothes-card");

  currentCards.forEach((card) => {
    card.remove();
  });

  previewLayers.forEach((layer) => {
    layer.classList.add("is-hidden");
  });
};

const setCodiPreset = (presetItems) => {
  clearCodiState();

  presetItems.forEach((item) => {
    addClothesItem(item);
    updatePreviewLayer(item);
  });
};

const initCodiSavePage = () => {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const codiId = params.get("codi");

  if (mode === "save" && codiPresets[codiId]) {
    setCodiPreset(codiPresets[codiId]);
    return;
  }

  clearCodiState();
};

/* ================================
   이벤트
================================ */

editClothesButton.addEventListener("click", () => {
  isEditMode = !isEditMode;

  document.body.classList.toggle("edit-mode", isEditMode);

  editClothesButton.innerHTML = isEditMode
    ? "완료 <span>›</span>"
    : "수정하기 <span>›</span>";
});

clothesList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".clothes-delete-button");

  if (!deleteButton) return;

  const card = deleteButton.closest(".codi-clothes-card");

  if (!card) return;

  deleteClothesItem(card);
});

codiAddButton.addEventListener("click", () => {
  openSelectSheet();
});

clothesSelectClose.addEventListener("click", () => {
  closeSelectSheet();
});

clothesSelectSheet.addEventListener("click", (event) => {
  if (event.target === clothesSelectSheet) {
    closeSelectSheet();
  }
});

selectCategoryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    selectCategoryTabs.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });

    tab.classList.add("active");
    tab.setAttribute("aria-pressed", "true");
    currentSelectCategory = tab.dataset.category;

    renderSelectList();
  });
});

codiSaveButton.addEventListener("click", () => {
  alert("코디가 저장되었습니다.");
  window.location.href = "./codi.html";
});

/* ================================
   초기 실행
================================ */

initCodiSavePage();
