const PUBLIC_API_BASE =
  "https://apis.data.go.kr/5050000/eatHtpService/getEatHtp";
const PUBLIC_DATA_API_KEY =
  "1730ef49346f6ce71ed87d557b391ee462b792aa403d91e832e56925999ab4fe";
const PAGE_SIZE = 10;
const MAX_PAGE_GUARD = 30;

const STORAGE_KEYS = {
  favorites: "gyeongju-food-favorites",
  reviews: "gyeongju-food-reviews",
};

const state = {
  allPlaces: [],
  currentTab: "all",
  visibleCount: PAGE_SIZE,
  selectedPlaceId: null,
  searchKeyword: "",
  map: null,
  mapMarker: null,
  mapOverlay: null,
  currentCoords: null,
};

const elements = {
  listScreen: document.getElementById("listScreen"),
  detailScreen: document.getElementById("detailScreen"),
  loadingBox: document.getElementById("loadingBox"),
  errorBox: document.getElementById("errorBox"),
  errorText: document.getElementById("errorText"),
  listContainer: document.getElementById("listContainer"),
  listCountText: document.getElementById("listCountText"),
  moreBtn: document.getElementById("moreBtn"),
  searchInput: document.getElementById("searchInput"),
  navButtons: Array.from(document.querySelectorAll(".nav-btn")),
  brandHomeBtn: document.getElementById("brandHomeBtn"),
  detailImage: document.getElementById("detailImage"),
  detailImageFallback: document.getElementById("detailImageFallback"),
  detailName: document.getElementById("detailName"),
  detailCategory: document.getElementById("detailCategory"),
  detailMetaList: document.getElementById("detailMetaList"),
  detailFavoriteBtn: document.getElementById("detailFavoriteBtn"),
  shareBtn: document.getElementById("shareBtn"),
  routeBtn: document.getElementById("routeBtn"),
  reviewSummary: document.getElementById("reviewSummary"),
  reviewForm: document.getElementById("reviewForm"),
  reviewNickname: document.getElementById("reviewNickname"),
  reviewPassword: document.getElementById("reviewPassword"),
  reviewText: document.getElementById("reviewText"),
  reviewList: document.getElementById("reviewList"),
  menuBtn: document.getElementById("menuBtn"),
  drawer: document.getElementById("drawer"),
  drawerClose: document.getElementById("drawerClose"),
  drawerBackdrop: document.getElementById("drawerBackdrop"),
  drawerLinks: Array.from(document.querySelectorAll("[data-drawer-action]")),
};

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  init();
});

async function init() {
  setLoading(true);
  hideError();

  try {
    const places = await fetchAllPlaces();

    if (!places.length) {
      throw new Error(
        "불러온 데이터가 없습니다. API 키, 승인 상태, 호출 URL을 확인해 주세요.",
      );
    }

    state.allPlaces = places;
    renderList();
  } catch (error) {
    console.error(error);
    showError(error.message || "데이터를 불러오지 못했습니다.");
  } finally {
    setLoading(false);
  }
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.searchKeyword = event.target.value.trim();
    state.visibleCount = PAGE_SIZE;
    renderList();
  });

  elements.moreBtn.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderList();
  });

  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextTab = button.dataset.tab;
      switchTab(nextTab);
    });
  });

  elements.brandHomeBtn.addEventListener("click", () => {
    showListScreen();
  });

  elements.shareBtn.addEventListener("click", async () => {
    const place = getSelectedPlace();
    if (!place) return;

    const shareText = `${place.name}\n${place.address || ""}`.trim();

    try {
      if (navigator.share) {
        await navigator.share({
          title: place.name,
          text: shareText,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        alert("가게 정보가 복사되었습니다.");
      } else {
        alert(shareText);
      }
    } catch (error) {
      console.error(error);
    }
  });

  elements.detailFavoriteBtn.addEventListener("click", () => {
    const place = getSelectedPlace();
    if (!place) return;
    toggleFavorite(place.id);
  });

  elements.routeBtn.addEventListener("click", () => {
    const place = getSelectedPlace();
    if (!place) return;
    openKakaoRoute(place);
  });

  elements.reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitReview();
  });

  elements.menuBtn.addEventListener("click", openDrawer);
  elements.drawerClose.addEventListener("click", closeDrawer);
  elements.drawerBackdrop.addEventListener("click", closeDrawer);

  elements.drawerLinks.forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.drawerAction;

      if (action === "all") {
        switchTab("all");
        showListScreen();
      }

      if (action === "favorites") {
        switchTab("favorites");
        showListScreen();
      }

      if (action === "reload") {
        closeDrawer();
        await init();
        return;
      }

      closeDrawer();
    });
  });

  elements.listContainer.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest("[data-favorite-id]");
    if (favoriteButton) {
      toggleFavorite(favoriteButton.dataset.favoriteId);
      return;
    }

    const detailButton = event.target.closest("[data-detail-id]");
    if (detailButton) {
      openDetail(detailButton.dataset.detailId);
    }
  });
}

async function fetchAllPlaces() {
  const merged = [];

  for (let pageNo = 1; pageNo <= MAX_PAGE_GUARD; pageNo += 1) {
    const pageItems = await fetchPlacesPage(pageNo, PAGE_SIZE);

    if (!pageItems.length) {
      break;
    }

    const normalized = pageItems.map(normalizePlace).filter(Boolean);
    merged.push(...normalized);

    if (pageItems.length < PAGE_SIZE) {
      break;
    }
  }

  const deduped = dedupePlaces(merged).filter((place) => place.name);
  return deduped;
}

async function fetchPlacesPage(pageNo, numOfRows) {
  const url = buildApiUrl(pageNo, numOfRows);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API 호출에 실패했습니다. (HTTP ${response.status})`);
  }

  const rawText = await response.text();
  let data;

  try {
    data = JSON.parse(rawText);
  } catch (error) {
    console.error(error);
    throw new Error(
      "API 응답이 JSON 형식이 아닙니다. serviceKey와 호출 파라미터를 확인해 주세요.",
    );
  }

  const items = extractItems(data);

  if (!Array.isArray(items)) {
    return [];
  }

  return items;
}

function buildApiUrl(pageNo, numOfRows) {
  const query = new URLSearchParams({
    pageNo: String(pageNo),
    numOfRows: String(numOfRows),
    resultType: "json",
    _type: "json",
  });

  const safeServiceKey = PUBLIC_DATA_API_KEY.includes("%")
    ? PUBLIC_DATA_API_KEY
    : encodeURIComponent(PUBLIC_DATA_API_KEY);

  return `${PUBLIC_API_BASE}?serviceKey=${safeServiceKey}&${query.toString()}`;
}

function extractItems(data) {
  const rawItems =
    data?.response?.body?.items?.item ??
    data?.response?.body?.items ??
    data?.body?.items?.item ??
    data?.body?.items ??
    data?.items?.item ??
    data?.items ??
    data?.data ??
    data?.list ??
    [];

  if (Array.isArray(rawItems)) {
    return rawItems;
  }

  if (rawItems && typeof rawItems === "object") {
    return [rawItems];
  }

  return [];
}

function normalizePlace(item) {
  if (!item || typeof item !== "object") return null;

  const name = pickValue(item, [
    "name",
    "title",
    "cntntsSj",
    "facltNm",
    "fcltyNm",
    "eateryNm",
    "restNm",
    "rstrntNm",
    "bsshNm",
    "entrpsNm",
  ]);

  const address = pickValue(item, [
    "address",
    "addr",
    "adres",
    "roadAddr",
    "rdnmadr",
    "lnmadr",
    "locplc",
    "adresDetail",
  ]);

  const menu = pickValue(item, [
    "menu",
    "menuNm",
    "mainMenu",
    "rprsntvMenu",
    "signatureMenu",
    "foodMenu",
  ]);

  const category = pickValue(item, [
    "category",
    "ctgryNm",
    "theme",
    "foodType",
    "type",
    "menuType",
  ]);

  const phone = pickValue(item, [
    "phone",
    "phoneNumber",
    "tel",
    "telno",
    "contact",
  ]);
  const hours = pickValue(item, [
    "hours",
    "useTime",
    "operTime",
    "businessHours",
    "runTime",
    "openTime",
  ]);
  const facilities = pickValue(item, [
    "facilities",
    "amenity",
    "serviceInfo",
    "featureInfo",
    "cnvnncFcltyYn",
  ]);
  const feature = pickValue(item, [
    "summary",
    "feature",
    "desc",
    "description",
    "intrcn",
    "overview",
  ]);
  const image = pickValue(item, [
    "image",
    "imageUrl",
    "imgUrl",
    "rprsntvImage",
    "mainImg",
    "thumbnail",
    "thumbnailUrl",
    "firstImage",
    "firstImage2",
    "photo",
  ]);
  const latitude = parseCoordinate(
    pickValue(item, ["latitude", "lat", "mapY", "y"]),
  );
  const longitude = parseCoordinate(
    pickValue(item, ["longitude", "lng", "mapX", "x"]),
  );
  const rating = pickValue(item, [
    "rating",
    "score",
    "star",
    "avgScore",
    "reviewScore",
  ]);
  const reviewCount = pickValue(item, [
    "reviewCount",
    "reviewCnt",
    "reviews",
    "reviewNum",
  ]);

  const rawId = pickValue(item, [
    "id",
    "seq",
    "idx",
    "contentid",
    "contsNo",
    "serialNo",
  ]);
  const id = rawId || createFallbackId(`${name}-${address}-${menu}`);

  return {
    id,
    name,
    address,
    menu,
    category: category || menu || "맛집",
    phone,
    hours,
    facilities,
    feature,
    image,
    latitude,
    longitude,
    rating,
    reviewCount,
  };
}

function dedupePlaces(places) {
  const map = new Map();

  places.forEach((place) => {
    if (!place) return;
    if (!map.has(place.id)) {
      map.set(place.id, place);
    }
  });

  return Array.from(map.values());
}

function renderList() {
  const items = getFilteredPlaces();
  const visibleItems = items.slice(0, state.visibleCount);

  elements.listContainer.innerHTML = "";
  elements.listCountText.textContent = `${state.currentTab === "favorites" ? "즐겨찾기" : "전체"} (${items.length}건)`;

  if (
    !state.allPlaces.length &&
    elements.loadingBox.classList.contains("hidden")
  ) {
    return;
  }

  if (!visibleItems.length) {
    const message =
      state.currentTab === "favorites"
        ? "즐겨찾기한 맛집이 없습니다."
        : "검색 결과가 없습니다.";

    elements.listContainer.innerHTML = `<div class="empty-box">${message}</div>`;
  } else {
    elements.listContainer.innerHTML = visibleItems
      .map(createPlaceCardHtml)
      .join("");
  }

  elements.moreBtn.classList.toggle(
    "hidden",
    items.length <= state.visibleCount,
  );
  updateNavButtons();
}

function createPlaceCardHtml(place) {
  const isFavorite = getFavorites().includes(place.id);

  const imageHtml = place.image
    ? `<img src="${escapeHtml(place.image)}" alt="${escapeHtml(place.name)} 이미지" loading="lazy" />`
    : `<div class="place-thumb-fallback"><i class="fa-solid fa-utensils"></i></div>`;

  return `
    <article class="place-card">
      <button
        type="button"
        class="place-thumb-btn"
        data-detail-id="${escapeHtml(place.id)}"
        aria-label="${escapeHtml(place.name)} 상세보기"
      >
        ${imageHtml}
      </button>

      <div class="place-body">
        <button
          type="button"
          class="place-main-btn"
          data-detail-id="${escapeHtml(place.id)}"
          aria-label="${escapeHtml(place.name)} 상세보기"
        >
          <div class="place-title">
            <strong>${escapeHtml(place.name || "이름 없음")}</strong>
            <span>| ${escapeHtml(place.category || "맛집")}</span>
          </div>

          <div class="place-line">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHtml(place.address || "주소 정보 없음")}</span>
          </div>

          <div class="place-line">
            <i class="fa-solid fa-star"></i>
            <span>${escapeHtml(getRatingText(place))}</span>
          </div>
        </button>
      </div>

      <button
        type="button"
        class="favorite-btn ${isFavorite ? "is-active" : ""}"
        data-favorite-id="${escapeHtml(place.id)}"
        aria-label="즐겨찾기"
      >
        <i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i>
      </button>
    </article>
  `;
}

function openDetail(placeId) {
  const place = state.allPlaces.find((item) => item.id === placeId);
  if (!place) return;

  state.selectedPlaceId = placeId;

  if (place.image) {
    elements.detailImage.src = place.image;
    elements.detailImage.alt = `${place.name} 대표 이미지`;
    elements.detailImage.classList.remove("hidden");
    elements.detailImageFallback.classList.add("hidden");
  } else {
    elements.detailImage.classList.add("hidden");
    elements.detailImageFallback.classList.remove("hidden");
  }

  elements.detailName.textContent = place.name || "맛집명";
  elements.detailCategory.textContent = place.category || "맛집";
  elements.detailMetaList.innerHTML = createDetailMetaHtml(place);

  const isFavorite = getFavorites().includes(place.id);
  elements.detailFavoriteBtn.classList.toggle("is-active", isFavorite);
  elements.detailFavoriteBtn.innerHTML = `<i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i>`;

  renderReviewSummary(place);
  renderReviews(place.id);
  showDetailScreen();
  renderMapForPlace(place);
}

function createDetailMetaHtml(place) {
  const metaItems = [
    { icon: "fa-location-dot", text: place.address || "주소 정보 없음" },
    { icon: "fa-utensils", text: place.menu || "메뉴 정보 없음" },
    { icon: "fa-clock", text: place.hours || "운영시간 정보 없음" },
    { icon: "fa-phone", text: place.phone || "전화번호 정보 없음" },
    {
      icon: "fa-square-parking",
      text: place.facilities || place.feature || "편의정보 없음",
    },
  ];

  return metaItems
    .map(
      (item) => `
        <li>
          <i class="fa-solid ${item.icon}"></i>
          <span>${escapeHtml(item.text)}</span>
        </li>
      `,
    )
    .join("");
}

function renderReviewSummary(place) {
  const localReviews = getReviews(place.id);
  let summaryText = getRatingText(place);

  if (!place.rating && localReviews.length) {
    summaryText = `리뷰 ${localReviews.length}건`;
  }

  elements.reviewSummary.innerHTML = `
    <i class="fa-solid fa-star"></i>
    <span>${escapeHtml(summaryText)}</span>
  `;
}

function renderReviews(placeId) {
  const reviews = getReviews(placeId);

  if (!reviews.length) {
    elements.reviewList.innerHTML = "";
    return;
  }

  elements.reviewList.innerHTML = reviews
    .slice()
    .reverse()
    .map(
      (review) => `
        <article class="review-card">
          <div class="review-card-head">
            <strong>${escapeHtml(review.nickname || "익명")}</strong>
            <span>${escapeHtml(review.createdAt)}</span>
          </div>
          <p>${escapeHtml(review.text)}</p>
        </article>
      `,
    )
    .join("");
}

function submitReview() {
  const place = getSelectedPlace();
  if (!place) return;

  const nickname = elements.reviewNickname.value.trim();
  const password = elements.reviewPassword.value.trim();
  const text = elements.reviewText.value.trim();

  if (!password) {
    alert("비밀번호를 입력해 주세요.");
    elements.reviewPassword.focus();
    return;
  }

  if (!text) {
    alert("리뷰를 입력해 주세요.");
    elements.reviewText.focus();
    return;
  }

  const reviewStore = getReviewStore();
  const nextReview = {
    nickname,
    password,
    text,
    createdAt: formatDate(new Date()),
  };

  const targetReviews = reviewStore[place.id] || [];
  targetReviews.push(nextReview);
  reviewStore[place.id] = targetReviews;

  localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviewStore));

  elements.reviewForm.reset();
  renderReviewSummary(place);
  renderReviews(place.id);
}

function renderMapForPlace(place) {
  if (typeof kakao === "undefined" || !window.kakao?.maps) {
    return;
  }

  const container = document.getElementById("map");

  if (!state.map) {
    state.map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(35.8561719, 129.2247477),
      level: 4,
    });
  }

  setTimeout(() => {
    state.map.relayout();

    if (isFinite(place.latitude) && isFinite(place.longitude)) {
      const coords = new kakao.maps.LatLng(place.latitude, place.longitude);
      state.currentCoords = { lat: place.latitude, lng: place.longitude };
      drawMarker(coords, place.name);
      return;
    }

    geocodeAddress(place.address, place.name);
  }, 0);
}

function geocodeAddress(address, placeName) {
  if (!address || !window.kakao?.maps?.services) {
    state.currentCoords = null;
    return;
  }

  const geocoder = new kakao.maps.services.Geocoder();

  geocoder.addressSearch(address, (result, status) => {
    if (status !== kakao.maps.services.Status.OK || !result?.length) {
      state.currentCoords = null;
      return;
    }

    const lat = Number(result[0].y);
    const lng = Number(result[0].x);

    state.currentCoords = { lat, lng };

    const coords = new kakao.maps.LatLng(lat, lng);
    drawMarker(coords, placeName);
  });
}

function drawMarker(coords, placeName) {
  state.map.setCenter(coords);

  if (!state.mapMarker) {
    state.mapMarker = new kakao.maps.Marker({
      position: coords,
    });
    state.mapMarker.setMap(state.map);
  } else {
    state.mapMarker.setPosition(coords);
    state.mapMarker.setMap(state.map);
  }

  if (state.mapOverlay) {
    state.mapOverlay.setMap(null);
  }

  state.mapOverlay = new kakao.maps.CustomOverlay({
    position: coords,
    yAnchor: 1.8,
    content: `<div class="kakao-map-overlay">${escapeHtml(placeName || "맛집")}</div>`,
  });

  state.mapOverlay.setMap(state.map);
}

function openKakaoRoute(place) {
  if (!state.currentCoords) {
    alert("지도 좌표를 찾는 중이거나 주소를 확인할 수 없습니다.");
    return;
  }

  const destination = `${encodeURIComponent(place.name)},${state.currentCoords.lat},${state.currentCoords.lng}`;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const from = `내위치,${position.coords.latitude},${position.coords.longitude}`;
        window.open(
          `https://map.kakao.com/link/from/${from}/to/${destination}`,
          "_blank",
        );
      },
      () => {
        window.open(`https://map.kakao.com/link/to/${destination}`, "_blank");
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
    return;
  }

  window.open(`https://map.kakao.com/link/to/${destination}`, "_blank");
}

function switchTab(tab) {
  state.currentTab = tab;
  state.visibleCount = PAGE_SIZE;
  renderList();
  showListScreen();
}

function showListScreen() {
  elements.listScreen.classList.add("active");
  elements.detailScreen.classList.remove("active");
}

function showDetailScreen() {
  elements.listScreen.classList.remove("active");
  elements.detailScreen.classList.add("active");
}

function updateNavButtons() {
  elements.navButtons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.tab === state.currentTab,
    );
  });
}

function getFilteredPlaces() {
  const keyword = state.searchKeyword.toLowerCase();
  let source = state.allPlaces;

  if (state.currentTab === "favorites") {
    const favorites = new Set(getFavorites());
    source = source.filter((place) => favorites.has(place.id));
  }

  if (!keyword) {
    return source;
  }

  return source.filter((place) => {
    const target = [
      place.name,
      place.address,
      place.menu,
      place.category,
      place.feature,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return target.includes(keyword);
  });
}

function toggleFavorite(placeId) {
  const favorites = getFavorites();

  const nextFavorites = favorites.includes(placeId)
    ? favorites.filter((id) => id !== placeId)
    : [...favorites, placeId];

  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(nextFavorites));
  renderList();

  const selected = getSelectedPlace();
  if (selected && selected.id === placeId) {
    const isFavorite = nextFavorites.includes(placeId);
    elements.detailFavoriteBtn.classList.toggle("is-active", isFavorite);
    elements.detailFavoriteBtn.innerHTML = `<i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i>`;
  }
}

function getFavorites() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.favorites) || "[]",
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function getReviewStore() {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.reviews) || "{}",
    );
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error(error);
    return {};
  }
}

function getReviews(placeId) {
  const store = getReviewStore();

  return Array.isArray(store[placeId])
    ? store[placeId].map(({ password, ...safeReview }) => safeReview)
    : [];
}

function getSelectedPlace() {
  return (
    state.allPlaces.find((place) => place.id === state.selectedPlaceId) || null
  );
}

function getRatingText(place) {
  if (place.rating && place.reviewCount) {
    return `${place.rating} (리뷰 ${place.reviewCount}건)`;
  }

  if (place.rating) {
    return `${place.rating}`;
  }

  if (place.reviewCount) {
    return `리뷰 ${place.reviewCount}건`;
  }

  return "평점 정보 없음";
}

function openDrawer() {
  elements.drawer.classList.add("is-open");
  elements.drawerBackdrop.classList.add("is-open");
}

function closeDrawer() {
  elements.drawer.classList.remove("is-open");
  elements.drawerBackdrop.classList.remove("is-open");
}

function setLoading(isLoading) {
  elements.loadingBox.classList.toggle("hidden", !isLoading);
}

function showError(message) {
  elements.errorText.textContent = message;
  elements.errorBox.classList.remove("hidden");
}

function hideError() {
  elements.errorBox.classList.add("hidden");
}

function pickValue(source, keys) {
  for (const key of keys) {
    const value = source?.[key];

    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return String(value).trim();
    }
  }

  return "";
}

function parseCoordinate(value) {
  if (value === "" || value === null || value === undefined) return null;

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function createFallbackId(text) {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "") || `place-${Date.now()}`
  );
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
