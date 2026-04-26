const DEFAULT_LAT = 37.6517;
const DEFAULT_LON = 126.6773;

const RECENT_KEY = "auraRecentLocations";
const SELECTED_LOCATION_KEY = "auraSelectedLocation";

const searchPanel = document.getElementById("searchPanel");
const searchForm = document.getElementById("locationSearchForm");
const searchInput = document.getElementById("locationSearchInput");
const searchClearButton = document.getElementById("searchClearButton");
const recentList = document.getElementById("recentList");
const searchResultList = document.getElementById("searchResultList");
const findCurrentButton = document.getElementById("findCurrentButton");
const mapCurrentButton = document.getElementById("mapCurrentButton");

let map;
let marker = null;
let places;
let geocoder;
let recentLocations = [];
let searchTimer = null;

/* ================================
   초기 실행
================================ */

document.addEventListener("DOMContentLoaded", () => {
  recentLocations = getRecentLocations();

  initMap();
  renderRecentLocations();
  bindEvents();
});

/* ================================
   Kakao Map
================================ */

const initMap = () => {
  const mapContainer = document.getElementById("map");
  const center = new kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LON);

  map = new kakao.maps.Map(mapContainer, {
    center,
    level: 5,
  });

  places = new kakao.maps.services.Places();
  geocoder = new kakao.maps.services.Geocoder();

  // 처음에는 마커 없음
  // 지도 직접 클릭 시 마커 생성 + 주소 저장
  kakao.maps.event.addListener(map, "click", (mouseEvent) => {
    const latlng = mouseEvent.latLng;
    const lat = latlng.getLat();
    const lon = latlng.getLng();

    moveMap(lat, lon);
    getAddressByCoords(lat, lon);
  });
};

const moveMap = (lat, lon) => {
  const position = new kakao.maps.LatLng(lat, lon);

  map.setCenter(position);

  if (!marker) {
    marker = new kakao.maps.Marker({
      position,
      map,
    });

    return;
  }

  marker.setPosition(position);
};

/* ================================
   이벤트
================================ */

const bindEvents = () => {
  searchInput.addEventListener("focus", () => {
    openSearchPanel();
  });

  // 입력할 때 자동 검색
  searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.trim();
    const hasValue = keyword !== "";

    searchClearButton.classList.toggle("active", hasValue);

    clearTimeout(searchTimer);

    if (!hasValue) {
      searchResultList.innerHTML = "";
      searchResultList.classList.add("hidden");
      recentList.classList.remove("hidden");
      return;
    }

    searchTimer = setTimeout(() => {
      searchPlaces(keyword);
    }, 400);
  });

  // 엔터 / 모바일 검색키 눌렀을 때 검색
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const keyword = searchInput.value.trim();

    if (!keyword) {
      alert("검색어를 입력해주세요.");
      searchInput.focus();
      return;
    }

    searchPlaces(keyword);
  });

  searchClearButton.addEventListener("click", () => {
    searchInput.value = "";
    searchClearButton.classList.remove("active");

    searchResultList.innerHTML = "";
    searchResultList.classList.add("hidden");
    recentList.classList.remove("hidden");

    searchInput.focus();
  });

  findCurrentButton.addEventListener("click", () => {
    findCurrentLocation();
  });

  mapCurrentButton.addEventListener("click", () => {
    findCurrentLocation();
  });
};

const openSearchPanel = () => {
  searchPanel.classList.add("active");

  setTimeout(() => {
    map.relayout();
  }, 300);
};

/* ================================
   검색
================================ */

const searchPlaces = (keyword) => {
  places.keywordSearch(keyword, (data, status) => {
    if (status === kakao.maps.services.Status.OK) {
      renderSearchResults(data);
      return;
    }

    // 장소 검색 결과가 없으면 주소 검색으로 한 번 더 시도
    if (status === kakao.maps.services.Status.ZERO_RESULT) {
      searchAddress(keyword);
      return;
    }

    alert("검색 중 문제가 발생했습니다.");
  });
};

const searchAddress = (keyword) => {
  geocoder.addressSearch(keyword, (data, status) => {
    if (status === kakao.maps.services.Status.OK) {
      const addressResults = data.map((item) => {
        return {
          place_name: item.address_name,
          address_name: item.address_name,
          road_address_name: item.road_address?.address_name || "",
          x: item.x,
          y: item.y,
        };
      });

      renderSearchResults(addressResults);
      return;
    }

    alert("검색 결과가 없습니다.");
  });
};

const renderSearchResults = (placesData) => {
  recentList.classList.add("hidden");
  searchResultList.classList.remove("hidden");
  searchResultList.innerHTML = "";

  placesData.slice(0, 5).forEach((place) => {
    const li = document.createElement("li");
    li.className = "search-result-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "result-info";

    const address = place.road_address_name || place.address_name || "";
    const lat = Number(place.y);
    const lon = Number(place.x);

    button.innerHTML = `
      <strong>${place.place_name}</strong>
      <span>${address}</span>
    `;

    button.addEventListener("click", () => {
      const locationName = address || place.place_name;

      selectLocation({
        name: locationName,
        placeName: place.place_name,
        lat,
        lon,
      });
    });

    li.appendChild(button);
    searchResultList.appendChild(li);
  });
};

/* ================================
   현재 위치
================================ */

const findCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert("현재 브라우저에서는 위치 기능을 사용할 수 없습니다.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      moveMap(lat, lon);
      getAddressByCoords(lat, lon);
    },
    () => {
      alert("현재 위치를 가져오려면 위치 권한을 허용해주세요.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    },
  );
};

/* ================================
   좌표 → 주소 변환
================================ */

const getAddressByCoords = (lat, lon) => {
  geocoder.coord2RegionCode(lon, lat, (result, status) => {
    if (status !== kakao.maps.services.Status.OK || result.length === 0) {
      selectLocation({
        name: "현재 위치",
        lat,
        lon,
      });
      return;
    }

    const region = result.find((item) => item.region_type === "H") || result[0];

    const locationName = `${region.region_1depth_name} ${region.region_2depth_name} ${region.region_3depth_name}`;

    selectLocation({
      name: locationName,
      lat,
      lon,
    });
  });
};

/* ================================
   최근 검색어
================================ */

const getRecentLocations = () => {
  const saved = localStorage.getItem(RECENT_KEY);

  if (!saved) {
    return [
      "경기도 김포시 장기동",
      "서울시 마포구",
      "경기도 부천시 원미동",
      "인천시 연수구",
      "충청남도 천안시",
    ];
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    return [];
  }
};

const saveRecentLocations = () => {
  localStorage.setItem(RECENT_KEY, JSON.stringify(recentLocations));
};

const addRecentLocation = (name) => {
  recentLocations = recentLocations.filter((item) => item !== name);
  recentLocations.unshift(name);
  recentLocations = recentLocations.slice(0, 5);

  saveRecentLocations();
  renderRecentLocations();
};

const removeRecentLocation = (name) => {
  recentLocations = recentLocations.filter((item) => item !== name);

  saveRecentLocations();
  renderRecentLocations();
};

const renderRecentLocations = () => {
  recentList.innerHTML = "";

  recentLocations.forEach((name) => {
    const li = document.createElement("li");
    li.className = "recent-item";

    const nameButton = document.createElement("button");
    nameButton.type = "button";
    nameButton.className = "recent-name";
    nameButton.textContent = name;

    nameButton.addEventListener("click", () => {
      searchInput.value = name;
      searchClearButton.classList.add("active");
      searchPlaces(name);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "recent-delete-button";
    deleteButton.textContent = "×";

    deleteButton.addEventListener("click", () => {
      removeRecentLocation(name);
    });

    li.appendChild(nameButton);
    li.appendChild(deleteButton);
    recentList.appendChild(li);
  });
};

/* ================================
   위치 선택 저장
================================ */

const selectLocation = (location) => {
  addRecentLocation(location.name);
  moveMap(location.lat, location.lon);

  localStorage.setItem(SELECTED_LOCATION_KEY, JSON.stringify(location));

  alert(`${location.name} 위치로 설정되었습니다.`);
};
