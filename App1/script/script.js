// OpenWeather API Key 입력
const OPEN_WEATHER_API_KEY = "0e3e4e2c7e37c56ded61e1f67330d84d";
// 예) const OPEN_WEATHER_API_KEY = "abc1234567890";

const APP_PROFILE = {
  userName: "김은서",
  completedCourse: 1,
  totalCourse: 10,
  rideDistanceKm: 15,
  fallbackCity: "Jeju",
};

const userNameEl = document.getElementById("userName");
const weatherStatusEl = document.getElementById("weatherStatus");
const weatherTempEl = document.getElementById("weatherTemp");
const weatherCityEl = document.getElementById("weatherCity");
const weatherVisualEl = document.getElementById("weatherVisual");
const completedCourseEl = document.getElementById("completedCourse");
const rideDistanceEl = document.getElementById("rideDistance");
const citySearchBtn = document.getElementById("citySearchBtn");
const locationRefreshBtn = document.getElementById("locationRefreshBtn");

let currentWeatherContext = {
  city: APP_PROFILE.fallbackCity,
};

initApp();

function initApp() {
  renderStaticProfile();
  initWeather();
  bindEvents();
}

function renderStaticProfile() {
  userNameEl.textContent = APP_PROFILE.userName;
  completedCourseEl.textContent = APP_PROFILE.completedCourse;
  rideDistanceEl.textContent = APP_PROFILE.rideDistanceKm;
}

function bindEvents() {
  citySearchBtn.addEventListener("click", async () => {
    const city = window.prompt(
      "날씨를 확인할 도시명을 입력해주세요.",
      currentWeatherContext.city || APP_PROFILE.fallbackCity,
    );

    if (!city || !city.trim()) return;

    await fetchWeatherByCity(city.trim());
  });

  locationRefreshBtn.addEventListener("click", async () => {
    if (!isApiKeyReady()) {
      alert("OpenWeather API Key를 먼저 입력해주세요.");
      return;
    }

    await fetchWeatherByCurrentLocation();
  });
}

function initWeather() {
  if (!isApiKeyReady()) {
    renderMockWeather();
    console.warn("OpenWeather API Key가 입력되지 않아 샘플 날씨로 표시됩니다.");
    return;
  }

  fetchWeatherByCurrentLocation();
}

function isApiKeyReady() {
  return (
    OPEN_WEATHER_API_KEY && OPEN_WEATHER_API_KEY !== "YOUR_OPENWEATHER_API_KEY"
  );
}

function renderMockWeather() {
  updateWeatherUI({
    temp: 20,
    city: "Jeju, KR",
    description: "Mostly Sunny",
    weatherId: 801,
    iconCode: "02d",
  });
}

async function fetchWeatherByCurrentLocation() {
  setLoadingState("현재 위치 확인 중...");

  if (!navigator.geolocation) {
    await fetchWeatherByCity(APP_PROFILE.fallbackCity);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      await fetchWeatherByCoords(latitude, longitude);
    },
    async () => {
      await fetchWeatherByCity(APP_PROFILE.fallbackCity);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    },
  );
}

async function fetchWeatherByCity(city) {
  try {
    setLoadingState("도시 좌표 확인 중...");

    const geoUrl =
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}` +
      `&limit=1&appid=${OPEN_WEATHER_API_KEY}`;

    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoRes.ok || !Array.isArray(geoData) || geoData.length === 0) {
      throw new Error("도시 정보를 찾을 수 없습니다.");
    }

    const { lat, lon, name, country } = geoData[0];
    currentWeatherContext.city = name;

    await fetchWeatherByCoords(lat, lon, `${name}, ${country}`);
  } catch (error) {
    console.error(error);
    weatherStatusEl.textContent = "도시 검색 실패";
    weatherCityEl.textContent = "다시 시도해주세요";
  }
}

async function fetchWeatherByCoords(lat, lon, manualCityLabel = "") {
  try {
    setLoadingState("날씨 정보 불러오는 중...");

    const weatherUrl =
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}` +
      `&appid=${OPEN_WEATHER_API_KEY}&units=metric&lang=kr`;

    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (!weatherRes.ok) {
      throw new Error(weatherData.message || "날씨 조회에 실패했습니다.");
    }

    const cityLabel =
      manualCityLabel ||
      `${weatherData.name}, ${weatherData.sys?.country || ""}`;

    currentWeatherContext.city = weatherData.name;

    updateWeatherUI({
      temp: Math.round(weatherData.main.temp),
      city: cityLabel,
      description: formatWeatherText(
        weatherData.weather?.[0]?.description || "현재 날씨",
      ),
      weatherId: weatherData.weather?.[0]?.id || 801,
      iconCode: weatherData.weather?.[0]?.icon || "02d",
    });
  } catch (error) {
    console.error(error);
    weatherStatusEl.textContent = "날씨 조회 실패";
    weatherCityEl.textContent = "잠시 후 다시 시도해주세요";
  }
}

function setLoadingState(message) {
  weatherStatusEl.textContent = message;
  weatherCityEl.textContent = "로딩 중...";
}

function updateWeatherUI({ temp, city, description, weatherId, iconCode }) {
  weatherStatusEl.textContent = description;
  weatherTempEl.textContent = `${temp}°`;
  weatherCityEl.textContent = city;
  weatherVisualEl.innerHTML = `<i class="${getWeatherIconClass(weatherId, iconCode)}"></i>`;
}

function formatWeatherText(text) {
  if (!text) return "현재 날씨";
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getWeatherIconClass(weatherId, iconCode) {
  if (weatherId >= 200 && weatherId < 300) {
    return "fa-solid fa-cloud-bolt";
  }

  if (weatherId >= 300 && weatherId < 600) {
    return iconCode.includes("n")
      ? "fa-solid fa-cloud-moon-rain"
      : "fa-solid fa-cloud-sun-rain";
  }

  if (weatherId >= 600 && weatherId < 700) {
    return "fa-regular fa-snowflake";
  }

  if (weatherId >= 700 && weatherId < 800) {
    return "fa-solid fa-cloud";
  }

  if (weatherId === 800) {
    return iconCode.includes("n") ? "fa-solid fa-moon" : "fa-solid fa-sun";
  }

  if (weatherId === 801 || weatherId === 802) {
    return iconCode.includes("n")
      ? "fa-solid fa-cloud-moon"
      : "fa-solid fa-cloud-sun";
  }

  return "fa-solid fa-cloud";
}

window.addEventListener("DOMContentLoaded", function () {
  if (
    typeof Swiper !== "undefined" &&
    document.querySelector(".guide-swiper")
  ) {
    new Swiper(".guide-swiper", {
      slidesPerView: 2.01,
      spaceBetween: 14,
      loop: true,
      speed: 800,
      autoplay: {
        delay: 2000,
        disableOnInteraction: false,
      },
      allowTouchMove: true,
    });
  }
});
