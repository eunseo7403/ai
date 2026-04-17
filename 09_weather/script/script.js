const API_KEY = "0e3e4e2c7e37c56ded61e1f67330d84d";

const GEO_BASE_URL = "https://api.openweathermap.org/geo/1.0";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("cityInput");
const searchForm = document.getElementById("searchForm");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityNameEl = document.getElementById("cityName");
const tempValueEl = document.getElementById("tempValue");
const statusTextEl = document.getElementById("statusText");
const windSpeedEl = document.getElementById("windSpeed");
const humidityEl = document.getElementById("humidity");
const feelsLikeEl = document.getElementById("feelsLike");
const ozoneEl = document.getElementById("ozone");

let isLoading = false;
let isSearched = false;

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  searchWeatherByCity("Seoul");
});

function bindEvents() {
  searchForm.addEventListener("submit", handleSearchSubmit);
  locationBtn.addEventListener("click", handleCurrentLocation);

  cityInput.addEventListener("click", resetFormOnInputClick);
  cityInput.addEventListener("focus", resetFormOnInputClick);
}

function resetFormOnInputClick() {
  if (!isSearched || isLoading) return;

  searchForm.reset();
  isSearched = false;
}

async function handleSearchSubmit(event) {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    alert("도시명을 입력해주세요.");
    cityInput.focus();
    return;
  }

  await searchWeatherByCity(city);
}

async function handleCurrentLocation() {
  if (isLoading) return;

  try {
    validateApiKey();
  } catch (error) {
    showError(error.message);
    return;
  }

  if (!navigator.geolocation) {
    alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
    return;
  }

  setLoading(true, "현재 위치를 불러오는 중입니다.");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const [weatherData, airData] = await Promise.all([
          fetchWeatherByCoords(latitude, longitude),
          fetchAirPollution(latitude, longitude),
        ]);

        renderWeather(weatherData, airData);
        isSearched = true;
      } catch (error) {
        showError(error.message);
      } finally {
        setLoading(false);
      }
    },
    (error) => {
      setLoading(false);
      alert(getGeolocationErrorMessage(error));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    },
  );
}

async function searchWeatherByCity(city) {
  if (isLoading) return;

  try {
    validateApiKey();
  } catch (error) {
    showError(error.message);
    return;
  }

  setLoading(true, "도시 정보를 찾는 중입니다.");

  try {
    const location = await fetchCoordinatesByCity(city);

    const [weatherData, airData] = await Promise.all([
      fetchWeatherByCoords(location.lat, location.lon),
      fetchAirPollution(location.lat, location.lon),
    ]);

    renderWeather(weatherData, airData, location);
    isSearched = true;
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
}

function validateApiKey() {
  if (!API_KEY || API_KEY === "YOUR_OPENWEATHER_API_KEY") {
    throw new Error(
      "script.js 상단의 API_KEY를 본인 OpenWeather 키로 변경해주세요.",
    );
  }
}

async function fetchCoordinatesByCity(city) {
  const url = `${GEO_BASE_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`;
  const data = await fetchJSON(url, "도시 좌표를 가져오지 못했습니다.");

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      "입력한 도시를 찾을 수 없습니다. 예: Seoul, Tokyo 또는 London,GB",
    );
  }

  return data[0];
}

async function fetchWeatherByCoords(lat, lon) {
  const url =
    `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}` +
    `&appid=${API_KEY}&units=metric&lang=kr`;

  return await fetchJSON(url, "날씨 정보를 가져오지 못했습니다.");
}

async function fetchAirPollution(lat, lon) {
  const url = `${WEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  const data = await fetchJSON(url, "대기질 정보를 가져오지 못했습니다.");

  return data?.list?.[0] ?? null;
}

async function fetchJSON(url, defaultMessage) {
  const response = await fetch(url);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message
      ? `API 오류: ${data.message}`
      : defaultMessage;
    throw new Error(message);
  }

  return data;
}

function renderWeather(weatherData, airData, locationData) {
  const displayName =
    locationData?.local_names?.ko ||
    weatherData?.name ||
    locationData?.name ||
    "도시명";

  cityNameEl.textContent = displayName;
  tempValueEl.textContent = formatNumber(weatherData?.main?.temp, 0, "-");
  windSpeedEl.textContent = formatUnit(weatherData?.wind?.speed, "m/s", 2);
  humidityEl.textContent = formatUnit(weatherData?.main?.humidity, "%", 0);
  feelsLikeEl.textContent = formatUnit(weatherData?.main?.feels_like, "°C", 0);

  if (airData?.components?.o3 != null) {
    ozoneEl.textContent = `${Math.round(airData.components.o3)} μg/m³`;
  } else {
    ozoneEl.textContent = "-";
  }

  const description =
    weatherData?.weather?.[0]?.description || "현재 날씨 정보";
  statusTextEl.textContent = description;
}

function formatUnit(value, unit, decimals = 0) {
  if (!Number.isFinite(value)) return "-";

  const formatted =
    decimals > 0 ? Number(value).toFixed(decimals) : Math.round(Number(value));

  return `${formatted} ${unit}`;
}

function formatNumber(value, decimals = 0, fallback = "-") {
  if (!Number.isFinite(value)) return fallback;

  return decimals > 0
    ? Number(value).toFixed(decimals)
    : String(Math.round(Number(value)));
}

function setLoading(loading, message = "") {
  isLoading = loading;

  searchBtn.disabled = loading;
  locationBtn.disabled = loading;
  cityInput.disabled = loading;

  if (message) {
    statusTextEl.textContent = message;
  }
}

function showError(message) {
  console.error(message);
  statusTextEl.textContent = message;
  alert(message);
}

function getGeolocationErrorMessage(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "위치 정보 사용이 거부되었습니다.";
    case error.POSITION_UNAVAILABLE:
      return "현재 위치 정보를 가져올 수 없습니다.";
    case error.TIMEOUT:
      return "위치 정보를 가져오는 시간이 초과되었습니다.";
    default:
      return "위치 정보를 가져오는 중 문제가 발생했습니다.";
  }
}
