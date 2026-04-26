const recommendCards = document.querySelectorAll(".recommend-card");
const weeklyItems = document.querySelectorAll(".weekly-item");
const weeklyList = document.querySelector(".weekly-list");

const communityBannerSwiper = new Swiper(".community-banner-swiper", {
  slidesPerView: 1,
  loop: true,
  speed: 600,
  autoplay: {
    delay: 2000,
    disableOnInteraction: false,
  },
});

// 오늘의 추천 코디 3가지 중 하나만 선택
recommendCards.forEach((card) => {
  card.addEventListener("click", () => {
    recommendCards.forEach((item) => {
      item.classList.remove("active");
    });

    card.classList.add("active");
  });
});

/* ================================
   현재 위치 + 실제 날씨 반영
================================ */

const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";
const KAKAO_LOCAL_BASE_URL = "https://dapi.kakao.com/v2/local";

// 여기에 본인의 OpenWeather API Key를 입력해주세요.
const OPEN_WEATHER_API_KEY = "0e3e4e2c7e37c56ded61e1f67330d84d";

// 여기에 본인의 Kakao REST API Key를 입력해주세요.
const KAKAO_REST_API_KEY = "82b621e9ea906eb8a5022a9f344beb2c";

// 주간 날씨 SVG 아이콘 경로
const WEATHER_ICON_PATH = "./images/home/weather/";

const weatherLocationText = document.querySelector(".weather-location-text");
const weatherTemp = document.querySelector(".weather-temp");
const weatherRange = document.querySelector(".weather-range");
const weatherMessageBox = document.querySelector(".weather-message");
const weatherMessageText = document.querySelector(".weather-message-text");

let weeklyForecastList = [];
let activeWeeklyIndex = 0;

// API Key 확인
const validateWeatherApiKey = () => {
  if (
    !OPEN_WEATHER_API_KEY ||
    OPEN_WEATHER_API_KEY === "YOUR_OPENWEATHER_API_KEY"
  ) {
    throw new Error("home.js의 OpenWeather API Key를 변경해주세요.");
  }

  if (!KAKAO_REST_API_KEY || KAKAO_REST_API_KEY === "YOUR_KAKAO_REST_API_KEY") {
    throw new Error("home.js의 Kakao REST API Key를 변경해주세요.");
  }
};

// fetch 공통 함수
const fetchJSON = async (url, options = {}, errorMessage) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message || data?.msg
        ? `API 오류: ${data.message || data.msg}`
        : errorMessage;

    throw new Error(message);
  }

  return data;
};

// 긴 날씨 문구가 있을 때만 자동으로 흐르게 처리
const setWeatherMessage = (message) => {
  if (!weatherMessageBox || !weatherMessageText) return;

  weatherMessageText.textContent = message;

  weatherMessageText.classList.remove("is-marquee");
  weatherMessageText.style.removeProperty("--marquee-distance");
  weatherMessageText.style.removeProperty("--marquee-duration");

  requestAnimationFrame(() => {
    const boxStyle = getComputedStyle(weatherMessageBox);
    const paddingLeft = parseFloat(boxStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(boxStyle.paddingRight) || 0;
    const availableWidth =
      weatherMessageBox.clientWidth - paddingLeft - paddingRight;

    const overflowWidth = weatherMessageText.scrollWidth - availableWidth;

    if (overflowWidth > 0) {
      weatherMessageText.style.setProperty(
        "--marquee-distance",
        `-${overflowWidth + 24}px`,
      );

      weatherMessageText.style.setProperty("--marquee-duration", "12s");
      weatherMessageText.classList.add("is-marquee");
    }
  });
};

// 온도에 따른 코디 추천 문구
const getWeatherMessage = (temp) => {
  if (temp <= 0) {
    return "오늘은 매우 추워요. 두꺼운 아우터와 목도리를 챙겨주세요.";
  }

  if (temp <= 5) {
    return "오늘은 꽤 쌀쌀해요. 코트나 패딩을 입는 게 좋아요.";
  }

  if (temp <= 11) {
    return "오늘은 쌀쌀해요. 니트와 가벼운 아우터를 챙겨주세요.";
  }

  if (temp <= 17) {
    return "오늘은 선선해요. 가벼운 자켓이나 가디건이 잘 어울려요.";
  }

  if (temp <= 23) {
    return "오늘은 활동하기 좋은 날씨예요. 얇은 긴팔이나 셔츠를 추천해요.";
  }

  if (temp <= 28) {
    return "오늘은 따뜻해요. 반팔이나 가벼운 셔츠가 좋아요.";
  }

  return "오늘은 더워요. 통풍이 잘 되는 시원한 옷차림을 추천해요.";
};

// OpenWeather 날씨 코드에 맞는 아이콘 이름 반환
const getWeatherIconName = (weatherId) => {
  // 천둥 / 번개
  if (weatherId >= 200 && weatherId < 300) {
    return "lightning";
  }

  // 이슬비 / 비
  if (weatherId >= 300 && weatherId < 600) {
    return "rain";
  }

  // 눈
  if (weatherId >= 600 && weatherId < 700) {
    return "snow";
  }

  // 안개 / 흐림 계열
  if (weatherId >= 700 && weatherId < 800) {
    return "blur";
  }

  // 맑음
  if (weatherId === 800) {
    return "lucidity";
  }

  // 구름
  return "blur";
};

// active 여부에 따라 일반 / active SVG 아이콘 반환
const getWeatherIconSrc = (weatherId, isActive) => {
  const iconName = getWeatherIconName(weatherId);
  const activeName = isActive ? "-active" : "";

  return `${WEATHER_ICON_PATH}${iconName}${activeName}.svg`;
};

// 요일 표시
const getDayLabel = (timestamp, timezoneOffset, index) => {
  if (index === 0) {
    return "오늘";
  }

  const date = new Date((timestamp + timezoneOffset) * 1000);
  const dayList = ["일", "월", "화", "수", "목", "금", "토"];

  return dayList[date.getUTCDay()];
};

// 시간 문자열 가져오기
const getLocalHour = (timestamp, timezoneOffset) => {
  const date = new Date((timestamp + timezoneOffset) * 1000);

  return date.getUTCHours();
};

// Kakao Local API로 동 단위 지역명 가져오기
const fetchKakaoRegionByCoords = async (lat, lon) => {
  const url = `${KAKAO_LOCAL_BASE_URL}/geo/coord2regioncode.json?x=${lon}&y=${lat}`;

  const data = await fetchJSON(
    url,
    {
      headers: {
        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
      },
    },
    "지역 정보를 가져오지 못했습니다.",
  );

  const region =
    data.documents?.find((item) => item.region_type === "H") ||
    data.documents?.[0];

  if (!region) {
    return "현재 위치";
  }

  return `${region.region_1depth_name} ${region.region_2depth_name} ${region.region_3depth_name}`;
};

// OpenWeather로 현재 날씨 가져오기
const fetchWeatherByCoords = async (lat, lon) => {
  const url =
    `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}` +
    `&appid=${OPEN_WEATHER_API_KEY}&units=metric&lang=kr`;

  return await fetchJSON(url, {}, "날씨 정보를 가져오지 못했습니다.");
};

// OpenWeather 5 day / 3 hour Forecast API로 예보 가져오기
const fetchForecastByCoords = async (lat, lon) => {
  const url =
    `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}` +
    `&appid=${OPEN_WEATHER_API_KEY}&units=metric&lang=kr`;

  return await fetchJSON(url, {}, "주간 날씨 정보를 가져오지 못했습니다.");
};

// 3시간 단위 예보 데이터를 날짜별 5일 예보로 정리
const createDailyForecastList = (forecastData) => {
  const forecastList = forecastData?.list || [];
  const timezoneOffset = forecastData?.city?.timezone || 0;
  const groupedData = {};

  forecastList.forEach((item) => {
    const localDate = new Date((item.dt + timezoneOffset) * 1000);
    const dateKey = localDate.toISOString().slice(0, 10);

    if (!groupedData[dateKey]) {
      groupedData[dateKey] = [];
    }

    groupedData[dateKey].push(item);
  });

  return Object.values(groupedData)
    .slice(0, 5)
    .map((items) => {
      const noonItem = items.reduce((closestItem, currentItem) => {
        const closestHour = getLocalHour(closestItem.dt, timezoneOffset);
        const currentHour = getLocalHour(currentItem.dt, timezoneOffset);

        const closestDiff = Math.abs(closestHour - 12);
        const currentDiff = Math.abs(currentHour - 12);

        return currentDiff < closestDiff ? currentItem : closestItem;
      });

      const tempValues = items.map((item) => item.main.temp);
      const minTemp = Math.min(...tempValues);
      const maxTemp = Math.max(...tempValues);

      return {
        dt: noonItem.dt,
        timezoneOffset,
        temp: noonItem.main.temp,
        minTemp,
        maxTemp,
        weatherId: noonItem.weather?.[0]?.id || 800,
        description: noonItem.weather?.[0]?.description || "날씨",
      };
    });
};

// 상단 현재 날씨 카드 출력
const renderWeather = (weatherData, locationName) => {
  const currentTemp = Math.round(weatherData?.main?.temp);
  const maxTemp = Math.round(weatherData?.main?.temp_max);
  const minTemp = Math.round(weatherData?.main?.temp_min);
  const weatherDescription =
    weatherData?.weather?.[0]?.description || "현재 날씨";

  weatherLocationText.textContent = locationName;
  weatherTemp.textContent = `${currentTemp}°`;
  weatherRange.textContent = `최고 ${maxTemp}° / 최저 ${minTemp}°`;

  setWeatherMessage(
    `현재 날씨는 ${weatherDescription}입니다. ${getWeatherMessage(
      currentTemp,
    )}`,
  );
};

// 예보 데이터의 오늘 최고/최저로 상단 카드 보정
const updateTodayRangeFromForecast = (todayForecast) => {
  if (!todayForecast) return;

  const maxTemp = Math.round(todayForecast.maxTemp);
  const minTemp = Math.round(todayForecast.minTemp);

  weatherRange.textContent = `최고 ${maxTemp}° / 최저 ${minTemp}°`;
};

// 5일 예보 출력
const renderWeeklyWeather = (forecastList, activeIndex = 0) => {
  weeklyForecastList = forecastList;
  activeWeeklyIndex = activeIndex;

  const displayCount = Math.min(forecastList.length, weeklyItems.length);

  if (weeklyList) {
    weeklyList.style.gridTemplateColumns = `repeat(${displayCount}, 1fr)`;
  }

  weeklyItems.forEach((item, index) => {
    const forecast = forecastList[index];

    if (!forecast) {
      item.style.display = "none";
      return;
    }

    const isActive = index === activeIndex;
    const dayLabel = getDayLabel(forecast.dt, forecast.timezoneOffset, index);
    const temp = Math.round(forecast.temp);

    item.style.display = "flex";
    item.classList.toggle("active", isActive);

    const dayEl = item.querySelector("strong");
    const iconEl = item.querySelector("img");
    const tempEl = item.querySelector("span");

    if (dayEl) {
      dayEl.textContent = dayLabel;
    }

    if (iconEl) {
      iconEl.src = getWeatherIconSrc(forecast.weatherId, isActive);
      iconEl.alt = forecast.description;
    }

    if (tempEl) {
      tempEl.textContent = `${temp}°`;
    }
  });
};

// 주간 날씨 카드 클릭 시 active 변경 + 아이콘 변경
weeklyItems.forEach((item, index) => {
  item.addEventListener("click", () => {
    if (weeklyForecastList.length === 0) return;

    renderWeeklyWeather(weeklyForecastList, index);
  });
});

// 현재 위치로 날씨 가져오기
const getCurrentWeather = () => {
  try {
    validateWeatherApiKey();
  } catch (error) {
    console.error(error.message);

    weatherLocationText.textContent = "API Key 필요";
    setWeatherMessage(error.message);
    return;
  }

  if (!navigator.geolocation) {
    weatherLocationText.textContent = "위치 기능 미지원";
    setWeatherMessage("현재 브라우저에서는 위치 기능을 사용할 수 없습니다.");
    return;
  }

  weatherLocationText.textContent = "현재 위치 확인 중";
  setWeatherMessage("현재 위치의 날씨 정보를 불러오는 중입니다.");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      try {
        const weatherData = await fetchWeatherByCoords(latitude, longitude);

        let locationName = "현재 위치";

        try {
          locationName = await fetchKakaoRegionByCoords(latitude, longitude);
        } catch (error) {
          console.error(error.message);
        }

        renderWeather(weatherData, locationName);

        try {
          const forecastData = await fetchForecastByCoords(latitude, longitude);
          const forecastList = createDailyForecastList(forecastData);

          if (forecastList.length > 0) {
            renderWeeklyWeather(forecastList, activeWeeklyIndex);
            updateTodayRangeFromForecast(forecastList[0]);
          }
        } catch (error) {
          console.error(error.message);
        }
      } catch (error) {
        console.error(error.message);

        weatherLocationText.textContent = "날씨 정보 확인 불가";
        setWeatherMessage("잠시 후 다시 날씨 정보를 확인해주세요.");
      }
    },
    (error) => {
      console.error(error);

      weatherLocationText.textContent = "위치 권한 필요";
      setWeatherMessage("현재 위치 날씨를 보려면 위치 권한을 허용해주세요.");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    },
  );
};

getCurrentWeather();
