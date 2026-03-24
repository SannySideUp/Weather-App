const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const geoButton = document.getElementById("geoButton");
const favoriteButton = document.getElementById("favoriteButton");
const celsiusBtn = document.getElementById("celsiusBtn");
const fahrenheitBtn = document.getElementById("fahrenheitBtn");

const locationName = document.getElementById("locationName");
const currentTemp = document.getElementById("currentTemp");
const currentCondition = document.getElementById("currentCondition");
const currentIcon = document.getElementById("currentIcon");
const todayHigh = document.getElementById("todayHigh");
const todayLow = document.getElementById("todayLow");
const currentWind = document.getElementById("currentWind");
const sceneLabel = document.getElementById("sceneLabel");

const hourlyForecast = document.getElementById("hourlyForecast");
const dailyForecast = document.getElementById("dailyForecast");

const scene = document.getElementById("scene");
const sceneEffects = document.getElementById("sceneEffects");
const outfitLayer = document.getElementById("outfitLayer");
const propLayer = document.getElementById("propLayer");
const sunOrMoon = document.getElementById("sunOrMoon");
const cloudLayer = document.getElementById("cloudLayer");

const recentCitiesEl = document.getElementById("recentCities");
const favoriteCityEl = document.getElementById("favoriteCity");

let latestWeatherData = null;
let latestCityName = "Malmö";
let tempUnit = localStorage.getItem("weatherTempUnit") || "c";

const weatherCodeMap = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "❄️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "❄️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌦️" },
  82: { label: "Heavy showers", icon: "⛈️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Snow showers", icon: "🌨️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
};

function getWeatherInfo(code) {
  return weatherCodeMap[code] || { label: "Unknown", icon: "🌍" };
}

function cToF(c) {
  return (c * 9) / 5 + 32;
}

function formatTemp(valueC) {
  const value = tempUnit === "f" ? cToF(valueC) : valueC;
  return `${Math.round(value)}°${tempUnit === "f" ? "F" : "C"}`;
}

function setUnitButtons() {
  if (celsiusBtn) celsiusBtn.classList.toggle("active", tempUnit === "c");
  if (fahrenheitBtn) fahrenheitBtn.classList.toggle("active", tempUnit === "f");
}

function getSeason(monthIndex) {
  if ([11, 0, 1].includes(monthIndex)) return "winter";
  if ([2, 3, 4].includes(monthIndex)) return "spring";
  if ([5, 6, 7].includes(monthIndex)) return "summer";
  return "autumn";
}

function isNightBySun(currentTimeStr, sunriseStr, sunsetStr) {
  const current = new Date(currentTimeStr);
  const sunrise = new Date(sunriseStr);
  const sunset = new Date(sunsetStr);
  return current < sunrise || current > sunset;
}

function getSceneState({ weatherCode, temperature, windSpeed, monthIndex, night }) {
  const season = getSeason(monthIndex);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weatherCode);
  const cloudy = [1, 2, 3, 45, 48].includes(weatherCode);
  const windy = windSpeed >= 20;

  let state = {
    sceneClass: season,
    outfitClass: `${season}-outfit`,
    label: `${season.charAt(0).toUpperCase() + season.slice(1)} teddy walk`,
    prop: season === "summer" ? "🍦" : season === "spring" ? "🍬" : season === "autumn" ? "🧶" : "🧥",
    effect: season === "winter" ? "snow" : season === "autumn" ? "leaves" : "sparkles",
    night,
    skyIcon: night ? "🌙" : "☀️",
    clouds: cloudy || isRain,
  };

  if (isSnow) {
    state = {
      sceneClass: "winter",
      outfitClass: "winter-outfit",
      label: "Winter snow walk",
      prop: "🧥",
      effect: "snow",
      night,
      skyIcon: night ? "🌙" : "❄️",
      clouds: true,
    };
  } else if (season === "autumn" && windy) {
    state = {
      sceneClass: "autumn",
      outfitClass: "autumn-outfit",
      label: "Windy autumn walk",
      prop: "🧶",
      effect: "leaves",
      night,
      skyIcon: night ? "🌙" : "🌤️",
      clouds: true,
    };
  } else if (isRain) {
    state = {
      sceneClass: "rainy",
      outfitClass: "rainy-outfit",
      label: "Rainy day walk",
      prop: "☔",
      effect: "rain",
      night,
      skyIcon: night ? "🌙" : "🌧️",
      clouds: true,
    };
  } else if (season === "spring") {
    state = {
      sceneClass: "spring",
      outfitClass: "spring-outfit",
      label: "Spring candy walk",
      prop: "🍬",
      effect: "sparkles",
      night,
      skyIcon: night ? "🌙" : "🌤️",
      clouds: cloudy,
    };
  } else if (season === "summer" && temperature >= 22) {
    state = {
      sceneClass: "summer",
      outfitClass: "summer-outfit",
      label: "Summer ice cream walk",
      prop: "🍦",
      effect: "sparkles",
      night,
      skyIcon: night ? "🌙" : "☀️",
      clouds: cloudy,
    };
  }

  return state;
}

function renderEffects(type) {
  if (!sceneEffects) return;

  sceneEffects.innerHTML = "";

  const createItem = (char, className, count) => {
    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = className;
      el.textContent = char;
      el.style.left = `${Math.random() * 100}%`;
      el.style.top = `${Math.random() * 20}%`;
      el.style.animationDuration = `${3 + Math.random() * 4}s`;
      el.style.animationDelay = `${Math.random() * 2}s`;
      sceneEffects.appendChild(el);
    }
  };

  if (type === "snow") createItem("❄️", "snowflake", 12);
  if (type === "leaves") createItem("🍂", "leaf", 10);
  if (type === "rain") createItem("💧", "raindrop", 16);
  if (type === "sparkles") createItem("✨", "sparkle", 8);
}

function renderClouds(showClouds) {
  if (!cloudLayer) return;

  cloudLayer.innerHTML = "";
  if (!showClouds) return;

  for (let i = 0; i < 3; i++) {
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    cloud.textContent = "☁️";
    cloud.style.left = `${15 + i * 25}%`;
    cloud.style.top = `${20 + (i % 2) * 18}px`;
    cloud.style.animationDuration = `${7 + i * 2}s`;
    cloudLayer.appendChild(cloud);
  }
}

function applyTeddyScene(sceneState) {
  if (scene) {
    scene.className = `scene ${sceneState.sceneClass}${sceneState.night ? " night" : ""}`;
  }
  if (outfitLayer) {
    outfitLayer.className = `outfit ${sceneState.outfitClass}`;
  }
  if (propLayer) {
    propLayer.textContent = sceneState.prop;
  }
  if (sceneLabel) {
    sceneLabel.textContent = sceneState.label + (sceneState.night ? " • Night" : " • Day");
  }
  if (sunOrMoon) {
    sunOrMoon.textContent = sceneState.skyIcon;
  }

  renderClouds(sceneState.clouds);
  renderEffects(sceneState.effect);
}

function formatHourLabel(timeString) {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDayLabel(timeString) {
  const date = new Date(timeString);
  return date.toLocaleDateString([], { weekday: "short" });
}

function getDailyIndexFromDate(dateStr) {
  if (!latestWeatherData) return 0;
  return latestWeatherData.daily.time.findIndex((d) => d === dateStr);
}

function previewHour(index) {
  if (!latestWeatherData) return;

  const time = latestWeatherData.hourly.time[index];
  const temp = latestWeatherData.hourly.temperature_2m[index];
  const code = latestWeatherData.hourly.weather_code[index];
  const wind = latestWeatherData.hourly.wind_speed_10m[index];
  const dayStr = time.split("T")[0];
  const dailyIndex = getDailyIndexFromDate(dayStr);
  const sunrise = latestWeatherData.daily.sunrise[dailyIndex];
  const sunset = latestWeatherData.daily.sunset[dailyIndex];
  const date = new Date(time);

  const sceneState = getSceneState({
    weatherCode: code,
    temperature: temp,
    windSpeed: wind,
    monthIndex: date.getMonth(),
    night: isNightBySun(time, sunrise, sunset),
  });

  applyTeddyScene(sceneState);
}

function previewDay(dayIndex) {
  if (!latestWeatherData) return;

  const dayTime = latestWeatherData.daily.time[dayIndex] + "T12:00";
  const code = latestWeatherData.daily.weather_code[dayIndex];
  const temp = latestWeatherData.daily.temperature_2m_max[dayIndex];
  const wind = latestWeatherData.daily.wind_speed_10m_max[dayIndex];
  const sunrise = latestWeatherData.daily.sunrise[dayIndex];
  const sunset = latestWeatherData.daily.sunset[dayIndex];
  const date = new Date(dayTime);

  const sceneState = getSceneState({
    weatherCode: code,
    temperature: temp,
    windSpeed: wind,
    monthIndex: date.getMonth(),
    night: isNightBySun(dayTime, sunrise, sunset),
  });

  applyTeddyScene(sceneState);
}

function renderHourly(data) {
  if (!hourlyForecast) return;

  hourlyForecast.innerHTML = "";
  const todayDate = data.hourly.time[0].split("T")[0];

  data.hourly.time.forEach((time, index) => {
    if (!time.startsWith(todayDate)) return;

    const temp = data.hourly.temperature_2m[index];
    const code = data.hourly.weather_code[index];
    const info = getWeatherInfo(code);

    const card = document.createElement("button");
    card.className = "hour-card";
    card.type = "button";
    card.innerHTML = `
      <p class="forecast-time">${formatHourLabel(time)}</p>
      <p class="forecast-icon">${info.icon}</p>
      <p>${info.label}</p>
      <p class="forecast-temp">${formatTemp(temp)}</p>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".hour-card").forEach((c) => c.classList.remove("active-hour"));
      card.classList.add("active-hour");
      previewHour(index);
    });

    hourlyForecast.appendChild(card);
  });

  const firstHourCard = hourlyForecast.querySelector(".hour-card");
  if (firstHourCard) firstHourCard.classList.add("active-hour");
}

function renderDaily(data) {
  if (!dailyForecast) return;

  dailyForecast.innerHTML = "";

  data.daily.time.forEach((day, index) => {
    const max = data.daily.temperature_2m_max[index];
    const min = data.daily.temperature_2m_min[index];
    const code = data.daily.weather_code[index];
    const info = getWeatherInfo(code);

    const card = document.createElement("button");
    card.className = "day-card";
    card.type = "button";
    card.innerHTML = `
      <p class="forecast-day">${formatDayLabel(day)}</p>
      <p class="forecast-icon">${info.icon}</p>
      <p>${info.label}</p>
      <p class="forecast-temp">${formatTemp(max)} / ${formatTemp(min)}</p>
    `;

    card.addEventListener("click", () => {
      document.querySelectorAll(".day-card").forEach((c) => c.classList.remove("active-day"));
      card.classList.add("active-day");
      previewDay(index);
    });

    dailyForecast.appendChild(card);
  });
}

function renderCurrent(data, cityName) {
  const currentIndex = 0;
  const code = data.hourly.weather_code[currentIndex];
  const temp = data.hourly.temperature_2m[currentIndex];
  const wind = data.hourly.wind_speed_10m[currentIndex];
  const time = data.hourly.time[currentIndex];
  const info = getWeatherInfo(code);
  const date = new Date(time);
  const sunrise = data.daily.sunrise[0];
  const sunset = data.daily.sunset[0];

  if (locationName) locationName.textContent = cityName;
  if (currentTemp) currentTemp.textContent = formatTemp(temp);
  if (currentCondition) currentCondition.textContent = info.label;
  if (currentIcon) currentIcon.textContent = info.icon;
  if (todayHigh) todayHigh.textContent = formatTemp(data.daily.temperature_2m_max[0]);
  if (todayLow) todayLow.textContent = formatTemp(data.daily.temperature_2m_min[0]);
  if (currentWind) currentWind.textContent = `${Math.round(wind)} km/h`;

  const sceneState = getSceneState({
    weatherCode: code,
    temperature: temp,
    windSpeed: wind,
    monthIndex: date.getMonth(),
    night: isNightBySun(time, sunrise, sunset),
  });

  applyTeddyScene(sceneState);
}

function setLoadingState() {
  if (locationName) locationName.textContent = "Loading...";
  if (currentCondition) currentCondition.textContent = "Fetching weather...";
  if (currentTemp) currentTemp.textContent = "--°";
  if (currentIcon) currentIcon.textContent = "⏳";
  if (todayHigh) todayHigh.textContent = "--";
  if (todayLow) todayLow.textContent = "--";
  if (currentWind) currentWind.textContent = "--";
  if (sceneLabel) sceneLabel.textContent = "Loading scene...";

  if (hourlyForecast) {
    hourlyForecast.innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;
  }

  if (dailyForecast) {
    dailyForecast.innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;
  }
}

function addRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentWeatherCities") || "[]");
  cities = cities.filter((c) => c !== city);
  cities.unshift(city);
  cities = cities.slice(0, 5);
  localStorage.setItem("recentWeatherCities", JSON.stringify(cities));
  renderRecentCities();
}

function renderRecentCities() {
  if (!recentCitiesEl) return;

  const cities = JSON.parse(localStorage.getItem("recentWeatherCities") || "[]");
  if (!cities.length) {
    recentCitiesEl.innerHTML = `<span class="empty-inline">No recent cities yet.</span>`;
    return;
  }

  recentCitiesEl.innerHTML = "";
  cities.forEach((city) => {
    const btn = document.createElement("button");
    btn.className = "city-chip";
    btn.textContent = city;
    btn.addEventListener("click", () => {
      if (cityInput) cityInput.value = city;
      loadWeather(city);
    });
    recentCitiesEl.appendChild(btn);
  });
}

function saveFavoriteCity(city) {
  localStorage.setItem("favoriteWeatherCity", city);
  renderFavoriteCity();
}

function renderFavoriteCity() {
  if (!favoriteCityEl) return;

  const city = localStorage.getItem("favoriteWeatherCity");
  if (!city) {
    favoriteCityEl.innerHTML = `<span class="empty-inline">No favorite saved yet.</span>`;
    return;
  }

  favoriteCityEl.innerHTML = "";
  const btn = document.createElement("button");
  btn.className = "city-chip";
  btn.textContent = city;
  btn.addEventListener("click", () => {
    if (cityInput) cityInput.value = city;
    loadWeather(city);
  });
  favoriteCityEl.appendChild(btn);
}

async function getCoordinates(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(geoUrl);
  const data = await response.json();

  if (!data.results || !data.results.length) {
    throw new Error("City not found.");
  }

  const place = data.results[0];
  return {
    latitude: place.latitude,
    longitude: place.longitude,
    name: `${place.name}${place.country ? `, ${place.country}` : ""}`,
  };
}

async function getWeather(lat, lon) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&hourly=temperature_2m,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,sunrise,sunset` +
    `&forecast_days=7&timezone=auto`;

  const response = await fetch(weatherUrl);
  return response.json();
}

async function loadWeather(city) {
  try {
    setLoadingState();

    const coords = await getCoordinates(city);
    const weatherData = await getWeather(coords.latitude, coords.longitude);

    latestWeatherData = weatherData;
    latestCityName = coords.name;

    addRecentCity(coords.name);
    localStorage.setItem("lastWeatherCity", city);

    renderCurrent(weatherData, coords.name);
    renderHourly(weatherData);
    renderDaily(weatherData);
  } catch (error) {
    if (locationName) locationName.textContent = "Error";
    if (currentCondition) currentCondition.textContent = error.message;
    if (currentIcon) currentIcon.textContent = "⚠️";
    if (hourlyForecast) hourlyForecast.innerHTML = `<div class="loading-box">${error.message}</div>`;
    if (dailyForecast) dailyForecast.innerHTML = "";
  }
}

async function loadWeatherByCoords(lat, lon, displayName = "Your Location") {
  try {
    setLoadingState();

    const weatherData = await getWeather(lat, lon);
    latestWeatherData = weatherData;
    latestCityName = displayName;

    addRecentCity(displayName);

    renderCurrent(weatherData, displayName);
    renderHourly(weatherData);
    renderDaily(weatherData);
  } catch (error) {
    if (locationName) locationName.textContent = "Error";
    if (currentCondition) currentCondition.textContent = error.message;
    if (currentIcon) currentIcon.textContent = "⚠️";
    if (hourlyForecast) hourlyForecast.innerHTML = `<div class="loading-box">${error.message}</div>`;
    if (dailyForecast) dailyForecast.innerHTML = "";
  }
}

function rerenderAll() {
  if (!latestWeatherData) return;
  renderCurrent(latestWeatherData, latestCityName);
  renderHourly(latestWeatherData);
  renderDaily(latestWeatherData);
}

if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = cityInput ? cityInput.value.trim() : "";
    if (city) loadWeather(city);
  });
}

if (geoButton) {
  geoButton.addEventListener("click", () => {
    if (!navigator.geolocation) {
      if (currentCondition) currentCondition.textContent = "Geolocation is not supported in this browser.";
      return;
    }

    if (currentCondition) currentCondition.textContent = "Getting your location...";

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        loadWeatherByCoords(latitude, longitude, "Your Location");
      },
      () => {
        if (currentCondition) currentCondition.textContent = "Unable to get your location.";
      }
    );
  });
}

if (favoriteButton) {
  favoriteButton.addEventListener("click", () => {
    if (latestCityName) saveFavoriteCity(latestCityName);
  });
}

if (celsiusBtn) {
  celsiusBtn.addEventListener("click", () => {
    tempUnit = "c";
    localStorage.setItem("weatherTempUnit", tempUnit);
    setUnitButtons();
    rerenderAll();
  });
}

if (fahrenheitBtn) {
  fahrenheitBtn.addEventListener("click", () => {
    tempUnit = "f";
    localStorage.setItem("weatherTempUnit", tempUnit);
    setUnitButtons();
    rerenderAll();
  });
}

setUnitButtons();
renderRecentCities();
renderFavoriteCity();

const savedCity = localStorage.getItem("lastWeatherCity") || "Malmö";
if (cityInput) cityInput.value = savedCity;
loadWeather(savedCity);
