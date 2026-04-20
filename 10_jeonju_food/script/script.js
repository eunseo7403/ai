/* ./script/script.js */

const CONFIG = {
  publicDataAuthApiKey:
    "1730ef49346f6ce71ed87d557b391ee462b792aa403d91e832e56925999ab4fe",
  kakaoJavascriptKey: "3426f89206a177f340149da521e8a0ea",

  // 문서 기준 서비스 URL은 http 입니다.
  apiBase: "http://openapi.jeonju.go.kr/rest/jeonjufood",

  // https 배포에서 막히면 프록시로 우회해야 할 수 있습니다.
  useProxy: false,
  proxyBase: "",

  // 이미지 URL을 강제로 https로 바꿔볼지 여부
  // 서버가 https를 지원하는지 문서만으로는 확정할 수 없으므로 기본 false
  forceHttpsImageUrl: false,

  apiPageSize: 200,
  listPageSize: 10,

  endpoints: {
    image: "getFoodImgList",
    whiteRice: "getWhiteRiceList",
    bibimbap: "getMimbapList",
    kongnamul: "getGongBapList",
    koreanFood: "getKoreanFoodList",
    koreaWine: "getKoreaWineList",
    hanokFood: "getHanOkFoodList",
  },
};

const STORAGE_KEYS = {
  favorites: "jeonju-food-favorites",
  reviews: "jeonju-food-reviews",
};

const FALLBACK_RESTAURANTS = [];

const state = {
  restaurants: [],
  filteredRestaurants: [],
  visibleCount: CONFIG.listPageSize,
  currentTab: "all",
  selectedRestaurantId: null,
  favorites: loadFavorites(),
  reviewsByRestaurant: loadReviews(),
  map: null,
  marker: null,
};

const dom = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheDom();
  bindEvents();

  try {
    await loadKakaoScript();
  } catch (error) {
    console.warn("Kakao map load error:", error);
  }

  async function loadRestaurantData() {
    try {
      const categories = Object.keys(CATEGORY_META);
      const results = await Promise.allSettled(
        categories.map((key) => loadCategoryList(key)),
      );

      const merged = [];

      for (const result of results) {
        if (result.status === "fulfilled") {
          merged.push(...result.value);
        } else {
          console.error("카테고리 로드 실패:", result.reason);
        }
      }

      const deduped = dedupeRestaurants(merged);

      if (!deduped.length) {
        state.restaurants = [];
        showToast("실데이터를 불러오지 못했습니다. 콘솔 오류를 확인해 주세요.");
        return;
      }

      state.restaurants = deduped;
    } catch (error) {
      console.error("Jeonju API load failed:", error);
      state.restaurants = [];
      showToast("실데이터 연결 실패. 콘솔 오류를 확인해 주세요.");
    }
  }
  applyFilterAndRender();
}

function cacheDom() {
  dom.app = document.querySelector(".app");
  dom.listView = document.getElementById("listView");
  dom.detailView = document.getElementById("detailView");
  dom.restaurantList = document.getElementById("restaurantList");
  dom.resultText = document.getElementById("resultText");
  dom.listEmpty = document.getElementById("listEmpty");
  dom.loadMoreBtn = document.getElementById("loadMoreBtn");
  dom.searchInput = document.getElementById("searchInput");
  dom.clearSearchBtn = document.getElementById("clearSearchBtn");
  dom.menuOpenBtn = document.getElementById("menuOpenBtn");
  dom.detailMenuOpenBtn = document.getElementById("detailMenuOpenBtn");
  dom.menuCloseBtn = document.getElementById("menuCloseBtn");
  dom.menuBackdrop = document.getElementById("menuBackdrop");
  dom.menuSheet = document.getElementById("menuSheet");
  dom.menuAllBtn = document.getElementById("menuAllBtn");
  dom.menuFavBtn = document.getElementById("menuFavBtn");
  dom.menuHomeBtn = document.getElementById("menuHomeBtn");
  dom.brandHomeBtn = document.getElementById("brandHomeBtn");
  dom.detailBrandHomeBtn = document.getElementById("detailBrandHomeBtn");
  dom.bottomNavButtons = document.querySelectorAll(".nav-btn");
  dom.toast = document.getElementById("toast");

  dom.detailImage = document.getElementById("detailImage");
  dom.detailName = document.getElementById("detailName");
  dom.detailCategory = document.getElementById("detailCategory");
  dom.detailAddress = document.getElementById("detailAddress");
  dom.detailMenu = document.getElementById("detailMenu");
  dom.detailHours = document.getElementById("detailHours");
  dom.detailPhone = document.getElementById("detailPhone");
  dom.detailOptions = document.getElementById("detailOptions");
  dom.detailFavoriteBtn = document.getElementById("detailFavoriteBtn");
  dom.shareBtn = document.getElementById("shareBtn");
  dom.routeBtn = document.getElementById("routeBtn");
  dom.detailRatingText = document.getElementById("detailRatingText");
  dom.detailReviewCountText = document.getElementById("detailReviewCountText");
  dom.reviewForm = document.getElementById("reviewForm");
  dom.reviewNickname = document.getElementById("reviewNickname");
  dom.reviewPassword = document.getElementById("reviewPassword");
  dom.reviewContent = document.getElementById("reviewContent");
  dom.reviewList = document.getElementById("reviewList");
  dom.emptyReview = document.getElementById("emptyReview");
  dom.map = document.getElementById("map");

  dom.addressRow = document.getElementById("addressRow");
  dom.menuRow = document.getElementById("menuRow");
  dom.hoursRow = document.getElementById("hoursRow");
  dom.phoneRow = document.getElementById("phoneRow");
  dom.optionRow = document.getElementById("optionRow");
}

function bindEvents() {
  dom.searchInput.addEventListener("input", handleSearchInput);
  dom.clearSearchBtn.addEventListener("click", clearSearch);
  dom.loadMoreBtn.addEventListener("click", showMoreItems);
  dom.restaurantList.addEventListener("click", handleListClick);

  dom.bottomNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.currentTab = button.dataset.tab;
      updateBottomNav();
      state.visibleCount = CONFIG.listPageSize;
      applyFilterAndRender();
      goToListView();
      closeMenu();
    });
  });

  dom.menuOpenBtn.addEventListener("click", openMenu);
  dom.detailMenuOpenBtn.addEventListener("click", openMenu);
  dom.menuCloseBtn.addEventListener("click", closeMenu);
  dom.menuBackdrop.addEventListener("click", closeMenu);

  dom.menuAllBtn.addEventListener("click", () => {
    state.currentTab = "all";
    updateBottomNav();
    state.visibleCount = CONFIG.listPageSize;
    applyFilterAndRender();
    goToListView();
    closeMenu();
  });

  dom.menuFavBtn.addEventListener("click", () => {
    state.currentTab = "favorites";
    updateBottomNav();
    state.visibleCount = CONFIG.listPageSize;
    applyFilterAndRender();
    goToListView();
    closeMenu();
  });

  dom.menuHomeBtn.addEventListener("click", () => {
    goToListView();
    closeMenu();
  });

  dom.brandHomeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    goToListView();
  });

  dom.detailBrandHomeBtn.addEventListener("click", (event) => {
    event.preventDefault();
    goToListView();
  });

  dom.detailFavoriteBtn.addEventListener("click", toggleCurrentFavorite);
  dom.shareBtn.addEventListener("click", shareCurrentRestaurant);
  dom.routeBtn.addEventListener("click", openRouteToCurrentRestaurant);
  dom.reviewForm.addEventListener("submit", handleReviewSubmit);
}

async function loadRestaurantData() {
  try {
    const categories = Object.keys(CATEGORY_META);
    const results = await Promise.allSettled(
      categories.map((key) => loadCategoryList(key)),
    );

    const merged = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        merged.push(...result.value);
      } else {
        console.warn(result.reason);
      }
    }

    const deduped = dedupeRestaurants(merged);

    if (!deduped.length) {
      throw new Error("실데이터 목록이 비어 있습니다.");
    }

    state.restaurants = deduped;
  } catch (error) {
    console.warn("Jeonju API load failed:", error);
    state.restaurants = [...FALLBACK_RESTAURANTS];
    showToast("실데이터 연결 실패로 샘플 데이터를 표시합니다.");
  }
}

async function loadCategoryList(categoryKey) {
  const endpoint = CONFIG.endpoints[categoryKey];

  const payload = await requestApi(endpoint, {
    startPage: 1,
    pageSize: CONFIG.apiPageSize,
  });

  const items = extractItems(payload);

  return items.map((item) => normalizeRestaurant(item, categoryKey));
}

async function loadRestaurantImages(foodUid) {
  const payload = await requestApi(CONFIG.endpoints.image, {
    foodUid,
  });

  const items = extractItems(payload);

  return items.map((item) => ({
    foodUid: stringValue(item.foodUid),
    siteUid: stringValue(item.siteUid),
    fileMask: stringValue(item.fileMask),
    fileName: stringValue(item.fileName),
    privewUrl: sanitizeUrl(item.privewUrl || item.previewUrl || ""),
    thumbUrl: sanitizeUrl(item.thumbUrl || ""),
  }));
}

async function requestApi(endpoint, params = {}) {
  if (!CONFIG.serviceKey || CONFIG.serviceKey === "YOUR_SERVICE_KEY") {
    throw new Error("serviceKey가 설정되지 않았습니다.");
  }

  const url = buildApiUrl(endpoint, params);
  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`HTTP 오류: ${response.status}`);
  }

  return parseApiResponse(text);
}

function buildApiUrl(endpoint, params = {}) {
  if (CONFIG.useProxy && CONFIG.proxyBase) {
    const proxyUrl = new URL(
      `${CONFIG.proxyBase.replace(/\/$/, "")}/${endpoint}`,
      window.location.origin,
    );

    proxyUrl.searchParams.set("serviceKey", CONFIG.serviceKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        proxyUrl.searchParams.set(key, value);
      }
    });

    return proxyUrl.toString();
  }

  const url = new URL(`${CONFIG.apiBase}/${endpoint}`);
  url.searchParams.set("serviceKey", CONFIG.serviceKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

function parseApiResponse(text) {
  const trimmed = String(text || "").trim();

  if (!trimmed) {
    throw new Error("빈 응답입니다.");
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    validateResult(parsed);
    return parsed;
  }

  const xml = new DOMParser().parseFromString(trimmed, "application/xml");

  if (xml.querySelector("parsererror")) {
    throw new Error("XML 파싱 실패");
  }

  const parsed = xmlNodeToObject(xml.documentElement);
  validateResult(parsed);

  return parsed;
}

function validateResult(payload) {
  const resultCode = payload?.header?.resultCode ?? payload?.resultCode ?? "";

  const resultMsg = payload?.header?.resultMsg ?? payload?.resultMsg ?? "";

  if (
    String(resultCode) &&
    String(resultCode) !== "00" &&
    String(resultCode) !== "0"
  ) {
    throw new Error(`OpenAPI 오류: ${resultCode} / ${resultMsg}`);
  }
}

function xmlNodeToObject(node) {
  const children = [...node.children];

  if (!children.length) {
    return node.textContent?.trim() ?? "";
  }

  const result = {};
  const grouped = {};

  children.forEach((child) => {
    if (!grouped[child.nodeName]) {
      grouped[child.nodeName] = [];
    }
    grouped[child.nodeName].push(xmlNodeToObject(child));
  });

  Object.entries(grouped).forEach(([key, values]) => {
    result[key] = values.length === 1 ? values[0] : values;
  });

  return result;
}

function extractItems(payload) {
  if (!payload) return [];

  if (Array.isArray(payload)) return payload;

  const body = payload.body || {};
  const data = body.data || payload.data || {};
  const list = data.list || payload.list || [];

  if (Array.isArray(list)) return list;
  if (list && typeof list === "object") return [list];

  return [];
}

function normalizeRestaurant(raw, categoryKey) {
  const openTime = stringValue(raw.openTime);
  const closeTime = stringValue(raw.closeTime);

  const isReserve = stringValue(raw.isReserve);
  const isPaking = stringValue(raw.isPaking);
  const holiday = stringValue(raw.holiday);
  const parkingDetail = stringValue(raw.parkingDetail);

  return {
    id:
      stringValue(raw.foodUid) ||
      `${categoryKey}-${Math.random().toString(36).slice(2)}`,
    foodUid: stringValue(raw.foodUid),
    name: stringValue(raw.storeNm),
    category: CATEGORY_META[categoryKey] || "맛집",
    address: stringValue(raw.newAddr),
    menu: stringValue(raw.mainMenu),
    image: sanitizeUrl(raw.mainImgUrl),
    phone: normalizePhone(stringValue(raw.tel)),
    hours: formatHours(openTime, closeTime),
    holiday,
    isReserve,
    isPaking,
    parkingDetail,
    lat: toNumber(raw.posy),
    lng: toNumber(raw.posx),
    options: buildOptionsText({
      holiday,
      isReserve,
      isPaking,
      parkingDetail,
    }),
    seedRating: seedRatingFromCategory(categoryKey),
    seedReviewCount: seedReviewCountFromCategory(categoryKey),
  };
}

function stringValue(value) {
  return String(value ?? "").trim();
}

function normalizePhone(value) {
  const text = stringValue(value);
  if (!text || text === "--") return "전화번호 정보 없음";
  return text;
}

function formatHours(openTime, closeTime) {
  if (openTime && closeTime) return `${openTime} ~ ${closeTime}`;
  if (openTime) return `${openTime} ~`;
  if (closeTime) return `~ ${closeTime}`;
  return "영업시간 정보 없음";
}

function buildOptionsText({ holiday, isReserve, isPaking, parkingDetail }) {
  const parts = [];

  if (holiday) {
    parts.push(`휴무일 ${holiday}`);
  }

  if (isReserve === "1") {
    parts.push("예약가능");
  } else if (isReserve === "0") {
    parts.push("예약불가");
  }

  if (isPaking === "1") {
    parts.push(parkingDetail ? `주차가능(${parkingDetail})` : "주차가능");
  } else if (isPaking === "0") {
    parts.push("주차불가");
  }

  return parts.length ? parts.join(", ") : "부가 정보 없음";
}

function sanitizeUrl(url) {
  let value = String(url || "")
    .replace(/\s+/g, "")
    .trim();

  if (!value) return "";

  if (CONFIG.forceHttpsImageUrl && value.startsWith("http://")) {
    value = value.replace("http://", "https://");
  }

  return value;
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function dedupeRestaurants(list) {
  const map = new Map();

  list.forEach((item) => {
    const key = item.foodUid || `${item.name}__${item.address}`;

    if (!map.has(key)) {
      map.set(key, { ...item });
      return;
    }

    const prev = map.get(key);

    map.set(key, {
      ...prev,
      ...item,
      image: item.image || prev.image,
      phone: item.phone !== "전화번호 정보 없음" ? item.phone : prev.phone,
      options: item.options !== "부가 정보 없음" ? item.options : prev.options,
      hours: item.hours !== "영업시간 정보 없음" ? item.hours : prev.hours,
    });
  });

  return [...map.values()];
}

function seedRatingFromCategory(categoryKey) {
  const map = {
    whiteRice: 4.5,
    bibimbap: 4.6,
    kongnamul: 4.7,
    koreanFood: 4.5,
    koreaWine: 4.4,
    hanokFood: 4.5,
  };
  return map[categoryKey] || 4.5;
}

function seedReviewCountFromCategory(categoryKey) {
  const map = {
    whiteRice: 8,
    bibimbap: 12,
    kongnamul: 10,
    koreanFood: 6,
    koreaWine: 7,
    hanokFood: 9,
  };
  return map[categoryKey] || 5;
}

function handleSearchInput() {
  dom.clearSearchBtn.classList.toggle(
    "is-visible",
    dom.searchInput.value.trim().length > 0,
  );
  state.visibleCount = CONFIG.listPageSize;
  applyFilterAndRender();
}

function clearSearch() {
  dom.searchInput.value = "";
  dom.clearSearchBtn.classList.remove("is-visible");
  state.visibleCount = CONFIG.listPageSize;
  applyFilterAndRender();
}

function applyFilterAndRender() {
  const query = dom.searchInput.value.trim().toLowerCase();

  let items = [...state.restaurants];

  if (state.currentTab === "favorites") {
    items = items.filter((item) => state.favorites.has(item.id));
  }

  if (query) {
    items = items.filter((item) => {
      const target = [item.name, item.address, item.menu, item.category]
        .join(" ")
        .toLowerCase();

      return target.includes(query);
    });
  }

  state.filteredRestaurants = items;
  renderList();
  updateResultText();
}

function renderList() {
  const visibleItems = state.filteredRestaurants.slice(0, state.visibleCount);

  dom.restaurantList.innerHTML = visibleItems
    .map((item) => {
      const ratingInfo = getRatingInfo(
        item.id,
        item.seedRating,
        item.seedReviewCount,
      );
      const thumb = item.image
        ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" />`
        : `<div class="thumb-placeholder"><i class="fa-solid fa-utensils"></i></div>`;

      return `
        <li class="restaurant-item">
          <button type="button" class="restaurant-card" data-action="open" data-id="${escapeHtml(item.id)}">
            <div class="card-thumb">${thumb}</div>

            <div class="card-body">
              <h3 class="card-title">
                <strong>${escapeHtml(item.name || "이름 없음")}</strong>
                <span>| ${escapeHtml(item.category || "맛집")}</span>
              </h3>

              <p class="card-meta">
                <i class="fa-solid fa-location-dot"></i>
                <span>${escapeHtml(item.address || "주소 정보 없음")}</span>
              </p>

              <p class="card-rating">
                <i class="fa-solid fa-star"></i>
                <span>${ratingInfo.rating.toFixed(1)} (리뷰 ${ratingInfo.count}건)</span>
              </p>
            </div>
          </button>

          <button
            type="button"
            class="favorite-btn ${state.favorites.has(item.id) ? "is-favorite" : ""}"
            data-action="favorite"
            data-id="${escapeHtml(item.id)}"
            aria-label="즐겨찾기"
          >
            <i class="${state.favorites.has(item.id) ? "fa-solid" : "fa-regular"} fa-heart"></i>
          </button>
        </li>
      `;
    })
    .join("");

  dom.listEmpty.hidden = visibleItems.length > 0;
  dom.loadMoreBtn.hidden =
    state.visibleCount >= state.filteredRestaurants.length ||
    !state.filteredRestaurants.length;
}

function updateResultText() {
  const label = state.currentTab === "favorites" ? "즐겨찾기" : "전체";
  dom.resultText.textContent = `${label} (${state.filteredRestaurants.length}건)`;
}

function showMoreItems() {
  state.visibleCount += CONFIG.listPageSize;
  renderList();
}

async function handleListClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const { action, id } = target.dataset;
  if (!id) return;

  if (action === "favorite") {
    toggleFavorite(id);
    return;
  }

  if (action === "open") {
    await openDetail(id);
  }
}

async function openDetail(id) {
  const restaurant = getRestaurantById(id);
  if (!restaurant) return;

  state.selectedRestaurantId = id;

  if (!restaurant.image && restaurant.foodUid) {
    try {
      const images = await loadRestaurantImages(restaurant.foodUid);
      if (images.length) {
        restaurant.image = images[0].privewUrl || images[0].thumbUrl || "";
      }
    } catch (error) {
      console.warn("image load error:", error);
    }
  }

  renderDetail(restaurant);
  showDetailView();
}

function renderDetail(restaurant) {
  const ratingInfo = getRatingInfo(
    restaurant.id,
    restaurant.seedRating,
    restaurant.seedReviewCount,
  );

  dom.detailImage.src = restaurant.image || "./images/symbol.jpg";
  dom.detailImage.alt = restaurant.name || "맛집 대표 이미지";
  dom.detailName.textContent = restaurant.name || "이름 없음";
  dom.detailCategory.textContent = restaurant.category || "맛집";

  setRow(
    dom.addressRow,
    dom.detailAddress,
    restaurant.address,
    "주소 정보 없음",
  );
  setRow(dom.menuRow, dom.detailMenu, restaurant.menu, "대표 메뉴 정보 없음");
  setRow(dom.hoursRow, dom.detailHours, restaurant.hours, "영업시간 정보 없음");
  setRow(dom.phoneRow, dom.detailPhone, restaurant.phone, "전화번호 정보 없음");
  setRow(
    dom.optionRow,
    dom.detailOptions,
    restaurant.options,
    "부가 정보 없음",
  );

  dom.detailRatingText.textContent = ratingInfo.rating.toFixed(1);
  dom.detailReviewCountText.textContent = `(리뷰 ${ratingInfo.count}건)`;

  syncDetailFavoriteButton();
  renderReviews(restaurant.id);
  renderMap(restaurant);
}

function setRow(rowElement, textElement, value, fallbackText) {
  textElement.textContent = value || fallbackText;
  rowElement.classList.toggle("hidden", false);
}

function renderReviews(restaurantId) {
  const reviews = getReviews(restaurantId);

  dom.emptyReview.style.display = reviews.length ? "none" : "block";

  dom.reviewList.innerHTML = reviews
    .slice()
    .reverse()
    .map((review) => {
      return `
        <li class="review-item">
          <div class="review-item-head">
            <strong>${escapeHtml(review.nickname || "익명")}</strong>
            <span>${escapeHtml(review.createdAt)}</span>
          </div>
          <p>${escapeHtml(review.content)}</p>
        </li>
      `;
    })
    .join("");
}

function renderMap(restaurant) {
  dom.map.innerHTML = `<div class="map-fallback-text">지도를 불러오는 중입니다.</div>`;

  if (!restaurant.lat || !restaurant.lng) {
    dom.map.innerHTML = `<div class="map-fallback-text">좌표 정보가 없어 지도를 표시할 수 없습니다.</div>`;
    return;
  }

  if (!(window.kakao && window.kakao.maps)) {
    dom.map.innerHTML = `<div class="map-fallback-text">카카오맵 키를 설정하면 지도가 표시됩니다.</div>`;
    return;
  }

  const position = new kakao.maps.LatLng(restaurant.lat, restaurant.lng);

  state.map = new kakao.maps.Map(dom.map, {
    center: position,
    level: 4,
  });

  state.marker = new kakao.maps.Marker({
    map: state.map,
    position,
  });
}

function getRestaurantById(id) {
  return state.restaurants.find((item) => item.id === id);
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    showToast("즐겨찾기에서 삭제되었습니다.");
  } else {
    state.favorites.add(id);
    showToast("즐겨찾기에 추가되었습니다.");
  }

  saveFavorites();
  updateBottomNav();

  if (state.selectedRestaurantId === id) {
    syncDetailFavoriteButton();
  }

  applyFilterAndRender();
}

function toggleCurrentFavorite() {
  if (!state.selectedRestaurantId) return;
  toggleFavorite(state.selectedRestaurantId);
}

function syncDetailFavoriteButton() {
  if (!state.selectedRestaurantId) return;

  const isFavorite = state.favorites.has(state.selectedRestaurantId);
  dom.detailFavoriteBtn.classList.toggle("is-favorite", isFavorite);
  dom.detailFavoriteBtn.innerHTML = `<i class="${isFavorite ? "fa-solid" : "fa-regular"} fa-heart"></i>`;
}

function updateBottomNav() {
  dom.bottomNavButtons.forEach((button) => {
    button.classList.toggle(
      "is-active",
      button.dataset.tab === state.currentTab,
    );
  });
}

function showDetailView() {
  dom.listView.classList.remove("is-active");
  dom.detailView.classList.add("is-active");
  dom.detailView.setAttribute("aria-hidden", "false");
  dom.listView.setAttribute("aria-hidden", "true");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToListView() {
  dom.detailView.classList.remove("is-active");
  dom.listView.classList.add("is-active");
  dom.detailView.setAttribute("aria-hidden", "true");
  dom.listView.setAttribute("aria-hidden", "false");
  closeMenu();
}

function openMenu() {
  dom.app.classList.add("is-menu-open");
  dom.menuSheet.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  dom.app.classList.remove("is-menu-open");
  dom.menuSheet.setAttribute("aria-hidden", "true");
}

async function shareCurrentRestaurant() {
  const restaurant = getRestaurantById(state.selectedRestaurantId);
  if (!restaurant) return;

  const text = `${restaurant.name}\n${restaurant.address || ""}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: restaurant.name,
        text,
      });
      return;
    }

    await navigator.clipboard.writeText(text);
    showToast("가게 정보가 복사되었습니다.");
  } catch (error) {
    console.warn(error);
    showToast("공유에 실패했습니다.");
  }
}

function openRouteToCurrentRestaurant() {
  const restaurant = getRestaurantById(state.selectedRestaurantId);
  if (!restaurant) return;

  if (!restaurant.lat || !restaurant.lng) {
    showToast("길찾기 좌표 정보가 없습니다.");
    return;
  }

  const url = `https://map.kakao.com/link/to/${encodeURIComponent(
    restaurant.name,
  )},${restaurant.lat},${restaurant.lng}`;
  window.open(url, "_blank");
}

function handleReviewSubmit(event) {
  event.preventDefault();

  const restaurantId = state.selectedRestaurantId;
  if (!restaurantId) return;

  const nickname = dom.reviewNickname.value.trim();
  const password = dom.reviewPassword.value.trim();
  const content = dom.reviewContent.value.trim();

  if (!password) {
    showToast("비밀번호를 입력해 주세요.");
    return;
  }

  if (!content) {
    showToast("리뷰 내용을 입력해 주세요.");
    return;
  }

  const review = {
    nickname,
    password,
    content,
    createdAt: formatDate(new Date()),
  };

  if (!state.reviewsByRestaurant[restaurantId]) {
    state.reviewsByRestaurant[restaurantId] = [];
  }

  state.reviewsByRestaurant[restaurantId].push(review);
  saveReviews();

  dom.reviewForm.reset();
  renderReviews(restaurantId);

  const restaurant = getRestaurantById(restaurantId);
  if (restaurant) {
    const ratingInfo = getRatingInfo(
      restaurant.id,
      restaurant.seedRating,
      restaurant.seedReviewCount,
    );
    dom.detailRatingText.textContent = ratingInfo.rating.toFixed(1);
    dom.detailReviewCountText.textContent = `(리뷰 ${ratingInfo.count}건)`;
  }

  applyFilterAndRender();
  showToast("리뷰가 등록되었습니다.");
}

function getRatingInfo(restaurantId, seedRating = 0, seedReviewCount = 0) {
  const reviewCount = getReviews(restaurantId).length;

  if (reviewCount === 0) {
    return {
      rating: seedRating || 0.0,
      count: seedReviewCount || 0,
    };
  }

  const totalCount = (seedReviewCount || 0) + reviewCount;
  const rating = seedRating
    ? Math.min(5, seedRating + Math.min(0.2, reviewCount * 0.02))
    : 4.5;

  return {
    rating,
    count: totalCount,
  };
}

function getReviews(restaurantId) {
  return state.reviewsByRestaurant[restaurantId] || [];
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.favorites);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch (error) {
    return new Set();
  }
}

function saveFavorites() {
  localStorage.setItem(
    STORAGE_KEYS.favorites,
    JSON.stringify([...state.favorites]),
  );
}

function loadReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.reviews);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

function saveReviews() {
  localStorage.setItem(
    STORAGE_KEYS.reviews,
    JSON.stringify(state.reviewsByRestaurant),
  );
}

async function loadKakaoScript() {
  if (window.kakao && window.kakao.maps) {
    return;
  }

  if (
    !CONFIG.kakaoJavascriptKey ||
    CONFIG.kakaoJavascriptKey === "YOUR_KAKAO_JAVASCRIPT_KEY"
  ) {
    return;
  }

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${CONFIG.kakaoJavascriptKey}&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(resolve);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

let toastTimer = null;

function showToast(message) {
  if (!dom.toast) return;

  dom.toast.textContent = message;
  dom.toast.classList.add("is-show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    dom.toast.classList.remove("is-show");
  }, 1800);
}
