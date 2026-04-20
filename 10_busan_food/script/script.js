const CONFIG = {
  // 공공데이터포털 서비스키 입력
  DATA_SERVICE_KEY:
    "1730ef49346f6ce71ed87d557b391ee462b792aa403d91e832e56925999ab4fe",

  // 카카오맵 JavaScript 키 입력
  KAKAO_JAVASCRIPT_KEY: "3426f89206a177f340149da521e8a0ea",

  DATA_API_URL: "https://apis.data.go.kr/6260000/FoodService/getFoodKr",
  IMAGE_BASE_URL: "https://www.visitbusan.net",

  PAGE_SIZE: 100,
  DEFAULT_CENTER: { lat: 35.1796, lng: 129.0756 },
};

const STORAGE_KEY = "busan-food-favorites";
const INITIAL_VISIBLE_COUNT = 10;
const LOAD_MORE_STEP = 10;

const state = {
  restaurants: [],
  filtered: [],
  favorites: loadFavorites(),
  mode: "all",
  query: "",
  selectedId: null,
  kakaoLoaded: false,
  visibleCount: INITIAL_VISIBLE_COUNT,
};

const $ = (selector) => document.querySelector(selector);

const listView = $("#listView");
const detailView = $("#detailView");
const restaurantList = $("#restaurantList");
const countText = $("#countText");
const searchInput = $("#searchInput");
const messageBox = $("#messageBox");
const emptyState = $("#emptyState");
const refreshBtn = $("#refreshBtn");
const headerFavoriteBtn = $("#headerFavoriteBtn");
const tabAll = $("#tabAll");
const tabFavorites = $("#tabFavorites");
const backBtn = $("#backBtn");
const loadMoreWrap = $("#loadMoreWrap");
const loadMoreBtn = $("#loadMoreBtn");

const detailImage = $("#detailImage");
const detailImageEmpty = $("#detailImageEmpty");
const detailTitle = $("#detailTitle");
const detailAddress = $("#detailAddress");
const detailDesc = $("#detailDesc");
const detailMenu = $("#detailMenu");
const detailTel = $("#detailTel");
const detailTime = $("#detailTime");
const detailHomepage = $("#detailHomepage");
const detailMap = $("#detailMap");
const mapFallback = $("#mapFallback");
const menuSection = $("#menuSection");
const telSection = $("#telSection");
const timeSection = $("#timeSection");
const homepageSection = $("#homepageSection");

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  loadRestaurants();
});

function bindEvents() {
  refreshBtn.addEventListener("click", () => loadRestaurants(true));

  headerFavoriteBtn.addEventListener("click", () => {
    setMode(state.mode === "favorites" ? "all" : "favorites");
  });

  tabAll.addEventListener("click", () => setMode("all"));
  tabFavorites.addEventListener("click", () => setMode("favorites"));

  searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim();
    resetVisibleCount();
    applyFilters();
  });

  loadMoreBtn.addEventListener("click", () => {
    state.visibleCount += LOAD_MORE_STEP;
    renderList();
    syncLoadMoreButton();
  });

  backBtn.addEventListener("click", closeDetail);

  restaurantList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;

    const { action, id } = actionButton.dataset;
    if (!id) return;

    if (action === "detail") {
      openDetail(id);
      return;
    }

    if (action === "favorite") {
      toggleFavorite(id);
    }
  });
}

async function loadRestaurants(isRefresh = false) {
  if (!CONFIG.DATA_SERVICE_KEY || CONFIG.DATA_SERVICE_KEY.includes("여기에_")) {
    setMessage("script.js 상단의 DATA_SERVICE_KEY를 먼저 입력해 주세요.");
    state.restaurants = [];
    resetVisibleCount();
    applyFilters();
    return;
  }

  setMessage(
    isRefresh
      ? "맛집 정보를 새로 불러오는 중입니다."
      : "맛집 정보를 불러오는 중입니다.",
  );

  try {
    const firstPage = await requestFoodPage(1, CONFIG.PAGE_SIZE);
    const totalCount = firstPage.totalCount || firstPage.items.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / CONFIG.PAGE_SIZE));

    let rawItems = [...firstPage.items];

    for (let page = 2; page <= totalPages; page += 1) {
      const pageData = await requestFoodPage(page, CONFIG.PAGE_SIZE);
      rawItems = rawItems.concat(pageData.items);
    }

    const uniqueMap = new Map();

    rawItems.forEach((item) => {
      const normalized = normalizeRestaurant(item);
      if (!normalized.id) return;
      uniqueMap.set(normalized.id, normalized);
    });

    state.restaurants = Array.from(uniqueMap.values());
    resetVisibleCount();
    setMessage("");
    applyFilters();
  } catch (error) {
    console.error(error);
    setMessage(error.message || "데이터를 불러오지 못했습니다.");
    state.restaurants = [];
    resetVisibleCount();
    applyFilters();
  }
}

async function requestFoodPage(pageNo, numOfRows) {
  const url = new URL(CONFIG.DATA_API_URL);
  url.searchParams.set("serviceKey", CONFIG.DATA_SERVICE_KEY);
  url.searchParams.set("pageNo", String(pageNo));
  url.searchParams.set("numOfRows", String(numOfRows));
  url.searchParams.set("resultType", "json");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`API 호출에 실패했습니다. (HTTP ${response.status})`);
  }

  const text = await response.text();
  let raw;

  try {
    raw = JSON.parse(text);
  } catch (error) {
    console.error("응답 원문:", text);
    throw new Error(
      "JSON 응답을 받지 못했습니다. resultType 또는 엔드포인트를 확인해 주세요.",
    );
  }

  const parsed = extractApiPayload(raw);

  if (parsed.resultCode && parsed.resultCode !== "00") {
    throw new Error(
      parsed.resultMsg || `API 오류가 발생했습니다. (${parsed.resultCode})`,
    );
  }

  return parsed;
}

function extractApiPayload(raw) {
  const responseHeaderCode = raw?.response?.header?.resultCode;
  const responseHeaderMsg = raw?.response?.header?.resultMsg;

  const candidates = [raw?.getFoodKr, raw?.response?.body, raw?.body, raw];

  for (const candidate of candidates) {
    if (!candidate) continue;

    const maybeItems =
      candidate?.items?.item ?? candidate?.item ?? candidate?.items ?? [];

    if (Array.isArray(maybeItems)) {
      return {
        items: maybeItems,
        totalCount: Number(candidate.totalCount ?? maybeItems.length ?? 0),
        resultCode: String(candidate.resultCode ?? responseHeaderCode ?? "00"),
        resultMsg: String(candidate.resultMsg ?? responseHeaderMsg ?? "OK"),
      };
    }

    if (maybeItems && typeof maybeItems === "object") {
      return {
        items: [maybeItems],
        totalCount: Number(candidate.totalCount ?? 1),
        resultCode: String(candidate.resultCode ?? responseHeaderCode ?? "00"),
        resultMsg: String(candidate.resultMsg ?? responseHeaderMsg ?? "OK"),
      };
    }
  }

  return {
    items: [],
    totalCount: 0,
    resultCode: String(responseHeaderCode ?? raw?.resultCode ?? "99"),
    resultMsg: String(
      responseHeaderMsg ?? raw?.resultMsg ?? "응답 구조를 해석하지 못했습니다.",
    ),
  };
}

function normalizeRestaurant(item) {
  const id = String(item.UC_SEQ ?? "").trim();
  const title = cleanText(item.MAIN_TITLE || item.PLACE || item.TITLE);
  const address = [cleanText(item.ADDR1), cleanText(item.ADDR2)]
    .filter(Boolean)
    .join(" ");
  const description = cleanText(item.ITEMCNTNTS || item.TITLE || item.SUBTITLE);
  const menu = cleanText(item.RPRSNTV_MENU);
  const tel = cleanText(item.CNTCT_TEL);
  const usageTime = cleanText(item.USAGE_DAY_WEEK_AND_TIME);
  const homepage = cleanText(item.HOMEPAGE_URL);
  const image = normalizeImageUrl(item.MAIN_IMG_NORMAL || item.MAIN_IMG_THUMB);
  const lat = parseNumber(item.LAT);
  const lng = parseNumber(item.LNG);
  const district = cleanText(item.GUGUN_NM);

  return {
    id,
    title: title || "상호명 정보 없음",
    address: address || "주소 정보 없음",
    description: description || "소개 정보가 없습니다.",
    menu: menu || "대표 메뉴 정보 없음",
    tel: tel || "연락처 정보 없음",
    usageTime: usageTime || "운영시간 정보 없음",
    homepage,
    image,
    lat,
    lng,
    district,
    raw: item,
    searchText: [title, address, menu, description, district]
      .join(" ")
      .toLowerCase(),
  };
}

function applyFilters() {
  const query = state.query.toLowerCase();

  let result = [...state.restaurants];

  if (state.mode === "favorites") {
    result = result.filter((item) => state.favorites.includes(item.id));
  }

  if (query) {
    result = result.filter((item) => item.searchText.includes(query));
  }

  state.filtered = result;

  renderCount();
  renderList();
  syncTabState();
  syncLoadMoreButton();
}

function renderCount() {
  const label = state.mode === "favorites" ? "즐겨찾기" : "전체";
  countText.textContent = `${label}(${state.filtered.length}건)`;
}

function renderList() {
  restaurantList.innerHTML = "";

  if (state.filtered.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");

  const visibleItems = state.filtered.slice(0, state.visibleCount);
  const fragment = document.createDocumentFragment();

  visibleItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "restaurant-card";

    const isFavorite = state.favorites.includes(item.id);

    card.innerHTML = `
      <div class="card-head">
        <h3 class="card-title">${escapeHTML(item.title)}</h3>

        <div class="card-actions">
          <button
            type="button"
            class="icon-btn"
            data-action="detail"
            data-id="${escapeHTML(item.id)}"
            aria-label="상세보기"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M21 21l-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            class="icon-btn ${isFavorite ? "is-active" : ""}"
            data-action="favorite"
            data-id="${escapeHTML(item.id)}"
            aria-label="즐겨찾기"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 20.5s-7-4.35-7-10a4.25 4.25 0 0 1 7-3.1 4.25 4.25 0 0 1 7 3.1c0 5.65-7 10-7 10Z"
                fill="${isFavorite ? "currentColor" : "none"}"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <p class="card-text"><strong>주소:</strong> ${escapeHTML(item.address)}</p>
      <p class="card-text"><strong>메뉴:</strong> ${escapeHTML(item.menu)}</p>
    `;

    fragment.appendChild(card);
  });

  restaurantList.appendChild(fragment);
}

function syncLoadMoreButton() {
  if (
    state.filtered.length === 0 ||
    state.visibleCount >= state.filtered.length
  ) {
    loadMoreWrap.classList.add("hidden");
    return;
  }

  loadMoreWrap.classList.remove("hidden");
}

function resetVisibleCount() {
  state.visibleCount = INITIAL_VISIBLE_COUNT;
}

function setMode(mode) {
  state.mode = mode;
  resetVisibleCount();
  applyFilters();
}

function syncTabState() {
  const isFavorites = state.mode === "favorites";

  tabAll.classList.toggle("active", !isFavorites);
  tabFavorites.classList.toggle("active", isFavorites);
  headerFavoriteBtn.classList.toggle("is-active", isFavorites);
}

function toggleFavorite(id) {
  const index = state.favorites.indexOf(id);

  if (index > -1) {
    state.favorites.splice(index, 1);
  } else {
    state.favorites.push(id);
  }

  saveFavorites(state.favorites);
  applyFilters();
}

function openDetail(id) {
  const item = state.restaurants.find((restaurant) => restaurant.id === id);
  if (!item) return;

  state.selectedId = id;

  detailTitle.textContent = item.title;
  detailAddress.textContent = item.address;
  detailDesc.textContent = item.description;
  detailMenu.textContent = item.menu;
  detailTel.textContent = item.tel;
  detailTime.textContent = item.usageTime;

  toggleSection(menuSection, item.menu !== "대표 메뉴 정보 없음");
  toggleSection(telSection, item.tel !== "연락처 정보 없음");
  toggleSection(timeSection, item.usageTime !== "운영시간 정보 없음");

  if (item.homepage) {
    homepageSection.classList.remove("hidden");
    detailHomepage.href = item.homepage;
    detailHomepage.textContent = item.homepage;
  } else {
    homepageSection.classList.add("hidden");
    detailHomepage.removeAttribute("href");
    detailHomepage.textContent = "";
  }

  if (item.image) {
    detailImage.src = item.image;
    detailImage.classList.remove("hidden");
    detailImageEmpty.classList.add("hidden");
  } else {
    detailImage.removeAttribute("src");
    detailImage.classList.add("hidden");
    detailImageEmpty.classList.remove("hidden");
  }

  listView.classList.add("hidden");
  detailView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "auto" });

  renderMap(item);
}

function closeDetail() {
  state.selectedId = null;
  detailView.classList.add("hidden");
  listView.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "auto" });
}

async function renderMap(item) {
  detailMap.innerHTML = "";
  detailMap.classList.remove("hidden");
  mapFallback.classList.add("hidden");
  mapFallback.textContent = "";

  if (!isFinite(item.lat) || !isFinite(item.lng)) {
    showMapFallback("좌표 정보가 없어 지도를 표시할 수 없습니다.");
    return;
  }

  if (
    !CONFIG.KAKAO_JAVASCRIPT_KEY ||
    CONFIG.KAKAO_JAVASCRIPT_KEY.includes("여기에_")
  ) {
    showMapFallback(
      "script.js 상단의 KAKAO_JAVASCRIPT_KEY를 입력하면 지도가 표시됩니다.",
    );
    return;
  }

  try {
    await loadKakaoMaps();

    const position = new kakao.maps.LatLng(item.lat, item.lng);

    const map = new kakao.maps.Map(detailMap, {
      center: position,
      level: 3,
    });

    const marker = new kakao.maps.Marker({
      position,
    });

    marker.setMap(map);

    const infoWindow = new kakao.maps.InfoWindow({
      content: `
        <div style="padding:8px 12px;font-size:13px;line-height:1.4;white-space:nowrap;">
          ${escapeHTML(item.title)}
        </div>
      `,
    });

    infoWindow.open(map, marker);
  } catch (error) {
    console.error(error);
    showMapFallback(
      "카카오맵을 불러오지 못했습니다. 키 설정 또는 도메인 등록 여부를 확인해 주세요.",
    );
  }
}

function showMapFallback(message) {
  detailMap.classList.add("hidden");
  mapFallback.classList.remove("hidden");
  mapFallback.textContent = message;
}

function loadKakaoMaps() {
  if (window.kakao && window.kakao.maps) {
    return Promise.resolve(window.kakao);
  }

  return new Promise((resolve, reject) => {
    const existed = document.querySelector('script[data-kakao-map="true"]');

    if (existed) {
      existed.addEventListener("load", () => {
        if (!window.kakao || !window.kakao.maps) {
          reject(new Error("카카오맵 SDK가 로드되지 않았습니다."));
          return;
        }

        window.kakao.maps.load(() => resolve(window.kakao));
      });

      existed.addEventListener("error", () => {
        reject(new Error("카카오맵 SDK 로드에 실패했습니다."));
      });

      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${CONFIG.KAKAO_JAVASCRIPT_KEY}&autoload=false`;
    script.async = true;
    script.dataset.kakaoMap = "true";

    script.onload = () => {
      if (!window.kakao || !window.kakao.maps) {
        reject(new Error("카카오맵 SDK가 정상적으로 초기화되지 않았습니다."));
        return;
      }

      window.kakao.maps.load(() => resolve(window.kakao));
    };

    script.onerror = () => {
      reject(new Error("카카오맵 SDK 스크립트 로드에 실패했습니다."));
    };

    document.head.appendChild(script);
  });
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

function setMessage(message) {
  messageBox.textContent = message || "";
  messageBox.style.display = message ? "block" : "none";
}

function cleanText(value) {
  if (value == null) return "";
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeImageUrl(url) {
  const cleaned = cleanText(url);
  if (!cleaned) return "";

  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }

  const base = CONFIG.IMAGE_BASE_URL.replace(/\/$/, "");
  const path = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  return `${base}${path}`;
}

function parseNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

function toggleSection(element, isVisible) {
  element.classList.toggle("hidden", !isVisible);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
