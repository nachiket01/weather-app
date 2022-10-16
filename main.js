const api_key = "dcb866d560e18526c652ac895e1bf6aa";

const getCities = async (SearchText) => {
  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${SearchText}&limit=5&appid=${api_key}`
  );
  return response.json();
};

const getHourlyForecast = async ({ name: city }) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&units=metric`
  );
  const data = await response.json();
  return data.list.map((forecast) => {
    const {
      main: { temp, temp_max, temp_min },
      dt,
      dt_txt,
      weather: [{ description, icon }],
    } = forecast;
    return { temp, temp_max, temp_min, dt, dt_txt, description, icon };
  });
};

const getCurrentWeatherData = async () => {
  const city = "pune";
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric`
  );
  return response.json();
};

const formatTemprature = (temp) => `${temp?.toFixed(1)}°`;
const createIconUrl = (icon) =>
  `http://openweathermap.org/img/wn/${icon}@2x.png`;
const loadCurrentForecast = ({
  name,
  main: { temp, temp_max, temp_min },
  weather: [{ description }],
}) => {
  const currentForecastElement = document.querySelector("#current-forecast");
  currentForecastElement.querySelector(".name").textContent = name;
  currentForecastElement.querySelector(".temp").textContent =
    formatTemprature(temp);
  currentForecastElement.querySelector(".desc").textContent = description;
  currentForecastElement.querySelector(
    ".min-max-val"
  ).textContent = `H:${formatTemprature(temp_max)} L:${formatTemprature(
    temp_min
  )}`;
};
const loadHourlyForecast = (
  { main: { temp: tempNow }, weather: [{ icon: iconNow }] },
  hourlyForecast
) => {
  const timeFormatter = Intl.DateTimeFormat("en", {
    hour12: true,
    hour: "numeric",
  });
  let dataFor12Hours = hourlyForecast.slice(2, 14);
  const hourlyContainer = document.querySelector(".hourly-container");
  let innerHTMLString = ` <article>
  <h3 class="time">Now</h3>
  <img class="icon" src="${createIconUrl(iconNow)}"/>icon
  <p class="hourly-temp">${formatTemprature(tempNow)}</p>
</article>`;

  for (let { temp, icon, dt_txt } of dataFor12Hours) {
    innerHTMLString += ` <article>
        <h3 class="time">${timeFormatter.format(new Date(dt_txt))}</h3>
        <img class="icon" src="${createIconUrl(icon)}"/>icon
        <p class="hourly-temp">${formatTemprature(temp)}</p>
      </article>`;
  }
  hourlyContainer.innerHTML = innerHTMLString;
};
const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const calculateDayWiseForecast = (hourlyForecast) => {
  let dayWiseForecast = new Map();
  for (let forecast of hourlyForecast) {
    const [date] = forecast.dt_txt.split(" ");
    const dayOfTheWeek = days[new Date(date).getDay()];

    if (dayWiseForecast.has(dayOfTheWeek)) {
      let forecastForTheDay = dayWiseForecast.get(dayOfTheWeek);

      forecastForTheDay.push(forecast);
      dayWiseForecast.set(dayOfTheWeek, forecastForTheDay);
    } else {
      dayWiseForecast.set(dayOfTheWeek, [forecast]);
    }
  }

  for (let [key, value] of dayWiseForecast) {
    let temp_min = Math.min(...Array.from(value, (val) => val.temp_min));
    let temp_max = Math.max(...Array.from(value, (val) => val.temp_max));
    dayWiseForecast.set(key, {
      temp_min,
      temp_max,
      icon: value.find((v) => v.icon).icon,
    });
  }
  return dayWiseForecast;
};

const loadFiveDayForecast = (hourlyForecast) => {
  const dayWiseForecast = calculateDayWiseForecast(hourlyForecast);
  const container = document.querySelector(".five-day-forecast-container");
  let dayWiseInfo = "";
  Array.from(dayWiseForecast).map(
    ([day, { temp_max, temp_min, icon }], index) => {
      if (index < 5) {
        dayWiseInfo += `  <article class="day-wise-forecast">
        <h3 class="day">${index === 0 ? "today" : day} </h3>
        <img src="${createIconUrl(icon)}" alt="icon for the forecast" />
        <p class="min-temp">${formatTemprature(temp_min)}</p>
        <p class="max-temp">${formatTemprature(temp_max)}</p>
        </article>`;
      }
    }
  );
  container.innerHTML = dayWiseInfo;
};

const loadFeelsLike = ({ main: { feels_like } }) => {
  let container = document.querySelector("#feels-like");
  container.querySelector(".feels-like-temp").textContent =
    formatTemprature(feels_like);
};

const loadHumidity = ({ main: { humidity } }) => {
  let container = document.querySelector("#humidity");
  container.querySelector(".hum").textContent = humidity + " %";
};

function debounce(func) {
  let timer;
  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      func.apply(this, args);
    }, 500);
  };
}

const onSearchChange = async(event) => {
  let { value } = event.target;
  
  const listofCities =  await getCities(value);
  let options = "";
  for(let{lat,lon,name,state,country } of listofCities){
    options += `<option data-city-details =${JSON.stringify()} value="${name},${state},${country}"></option>`;
  }
  document.querySelector("#cities").innerHTML = options;
};

let selectedCityText;
let selectedCity;
const handleCitySelection =(event)=>{
selectedCity =event.target.value;
let options = document.querySelectorAll("#cities > option");
    
if(options?.length){
        let selectedOption = Array.from(options).find(opt => opt.value === selectedCityText);
        selectedCity = JSON.parse(selectedOption.getAttribute("data-city-details"));
        console.log(selectedCity);
    }
}

const debounceSearch = debounce((event) => onSearchChange(event));

document.addEventListener("DOMContentLoaded", async() => {
  const searchInput = document.querySelector("#search");
  searchInput.addEventListener("input", onSearchChange);
  searchInput.addEventListener("change",handleCitySelection);

  const currentWeather = await getCurrentWeatherData();
  loadCurrentForecast(currentWeather);

  const hourlyForecast = await getHourlyForecast(currentWeather);

  loadHourlyForecast(currentWeather, hourlyForecast);
  loadFeelsLike(currentWeather);
  loadHumidity(currentWeather);
  loadFiveDayForecast(hourlyForecast);
});
