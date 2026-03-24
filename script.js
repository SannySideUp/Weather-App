const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");

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

function getSeason(monthIndex) {
  if ([11, 0, 1].includes(monthIndex)) return "winter";
  if ([2, 3, 4].includes(monthIndex)) return "spring";
  if ([5, 6, 7].includes(monthIndex)) return "summer";
  return "autumn";
}

function getSceneState({ weatherCode, temperature, windSpeed, monthIndex }) {
  const season = getSeason(monthIndex);
  const isSnow = [71, 73, 75, 77, 85, 86].includes(weatherCode);
  const isRain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weatherCode);
  const windy = windSpeed >= 20;

  if (isSnow) {
    return {
      sceneClass: "winter",
      outfitClass: "winter-outfit",
      label: "Winter snow walk",
      prop: "🧥",
      effect: "snow",
    };
  }

  if (season === "autumn" && windy) {
    return {
      sceneClass: "autumn",
      outfitClass: "autumn-outfit",
      label: "Windy autumn walk",
      prop: "🧶",
      effect: "leaves",
    };
  }

  if (isRain) {
    return {
      sceneClass: "rainy",
      outfitClass: "rainy-outfit",
      label: "Rainy day walk",
      prop: "☔",
      effect: "rain",
    };
  }

  if (season === "spring") {
    return {
      sceneClass: "spring",
      outfitClass: "spring-outfit",
      label: "Spring candy walk",
      prop: "🍬",
      effect: "sparkles",
    };
  }

  if (season === "summer" && temperature >= 22) {
    return {
      sceneClass: "summer",
      outfitClass: "summer-outfit",
      label: "Summer ice cream walk",
      prop: "🍦",
      effect: "sparkles",
    };
  }

  const defaults = {
    winter: { outfitClass: "winter-outfit", prop: "🧥", effect: "snow" },
    spring: { outfitClass: "spring-outfit", prop: "🍬", effect: "sparkles" },
    summer: { outfitClass: "summer-outfit", prop: "🍦", effect: "sparkles" },
    autumn: { outfitClass: "autumn-outfit", prop: "🧶", effect: "leaves" },
  };

  return {
    sceneClass: season,
    outfitClass: defaults[season].outfitClass,
    label: `${season.charAt(0).toUpperCase() + season.slice(1)} teddy walk`,
    prop: defaults[season].prop,
    effect: defaults[season].effect,
  };
}

function renderEffects(type) {
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

function formatHourLabel(timeString) {
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDayLabel(timeString) {
  const date = new Date(timeString);
  return date.toLocaleDateString([], { weekday: "short" });
}

function renderHourly(data) {
  hourlyForecast.innerHTML = "";
  const todayDate = data.hourly.time[0].split("T")[0];

  data.hourly.time.forEach((time, index) => {
    if (!time.startsWith(todayDate)) return;

    const temp = data.hourly.temperature_2m[index];
    const code = data.hourly.weather_code[index];
    const info = getWeatherInfo(code);

    const card = document.createElement("div");
    card.className = "hour-card";
    card.innerHTML = `
      <p class="forecast-time">${formatHourLabel(time)}</p>
      <p class="forecast-icon">${info.icon}</p>
      <p>${info.label}</p>
      <p class="forecast-temp">${Math.round(temp)}°C</p>
    `;
    hourlyForecast.appendChild(card);
  });
}

function renderDaily(data) {
  dailyForecast.innerHTML = "";

  data.daily.time.forEach((day, index) => {
    const max = data.daily.temperature_2m_max[index];
    const min = data.daily.temperature_2m_min[index];
    const code = data.daily.weather_code[index];
    const info = getWeatherInfo(code);

    const card = document.createElement("div");
    card.className = "day-card";
    card.innerHTML = `
      <p class="forecast-day">${formatDayLabel(day)}</p>
      <p class="forecast-icon">${info.icon}</p>
      <p>${info.label}</p>
      <p class="forecast-temp">${Math.round(max)}° / ${Math.round(min)}°</p>
    `;
    dailyForecast.appendChild(card);
  });
}

function renderCurrent(data, cityName) {
  const currentIndex = 0;
  const code = data.hourly.weather_code[currentIndex];
  const temp = data.hourly.temperature_2m[currentIndex];
  const wind = data.hourly.wind_speed_10m[currentIndex];
  const info = getWeatherInfo(code);

  locationName.textContent = cityName;
  currentTemp.textContent = `${Math.round(temp)}°C`;
  currentCondition.textContent = info.label;
  currentIcon.textContent = info.icon;
  todayHigh.textContent = `${Math.round(data.daily.temperature_2m_max[0])}°C`;
  todayLow.textContent = `${Math.round(data.daily.temperature_2m_min[0])}°C`;
  currentWind.textContent = `${Math.round(wind)} km/h`;

  const teddyState = getSceneState({
    weatherCode: code,
    temperature: temp,
    windSpeed: wind,
    monthIndex: new Date().getMonth(),
  });

  scene.className = `scene ${teddyState.sceneClass}`;
  outfitLayer.className = `outfit ${teddyState.outfitClass}`;
  propLayer.textContent = teddyState.prop;
  sceneLabel.textContent = teddyState.label;
  renderEffects(teddyState.effect);
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
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&forecast_days=7&timezone=auto`;

  const response = await fetch(weatherUrl);
  return response.json();
}

async function loadWeather(city) {
  try {
    locationName.textContent = "Loading...";
    currentCondition.textContent = "Loading...";
    const coords = await getCoordinates(city);
    const weatherData = await getWeather(coords.latitude, coords.longitude);

    renderCurrent(weatherData, coords.name);
    renderHourly(weatherData);
    renderDaily(weatherData);
  } catch (error) {
    locationName.textContent = "Error";
    currentCondition.textContent = error.message;
    hourlyForecast.innerHTML = `<p>${error.message}</p>`;
    dailyForecast.innerHTML = "";
  }
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) loadWeather(city);
});

loadWeather("Malmö");
