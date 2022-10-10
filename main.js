const api_key = "dcb866d560e18526c652ac895e1bf6aa";


const getHourlyForecast= async ({name:city})=>{
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${api_key}&units=metric`);
    const data = await response.json();
    return data.list.map(forecast=>{
        const {main:{temp,temp_max,temp_min},dt,dt_txt,weather:[{description, icon}]} = forecast;
        return {temp,temp_max,temp_min,dt,dt_txt,description,icon}
    })
    console.log(data);
}

const getCurrentWeatherData = async () =>{
    const city="pune";
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_key}&units=metric`);
    return response.json()
}


const formatTemprature = (temp) => `${temp?.toFixed(1)}°`;
const createIconUrl = (icon) => `http://openweathermap.org/img/wn/${icon}@2x.png`
const loadCurrentForecast = ({name, main: {temp , temp_max , temp_min } ,weather:[{description}]})=>{
    const currentForecastElement = document.querySelector('#current-forecast');
    currentForecastElement.querySelector(".name").textContent = name;
    currentForecastElement.querySelector(".temp").textContent = formatTemprature(temp);
    currentForecastElement.querySelector(".desc").textContent = description;
    currentForecastElement.querySelector(".min-max-val").textContent = `H:${formatTemprature(temp_max)} L:${formatTemprature(temp_min)}`;
}
const loadHourlyForecast = (hourlyForecast)=>{
    let dataFor12Hours = hourlyForecast.slice(1,13);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTMLString = ``;
    for(let {temp,icon,dt_txt} of dataFor12Hours){
        innerHTMLString +=` <article>
        <h3 class="time">${dt_txt.split(" ")[1]}</h3>
        <img class="icon" src="${createIconUrl(icon)}"/>icon
        <p class="hourly-temp">${formatTemprature(temp)}</p>
      </article>`
    }
    hourlyContainer.innerHTML = innerHTMLString;
}

const loadFeelsLike=({main:{feels_like}})=>{
    let container = document.querySelector("#feels-like");
    container.querySelector(".feels-like-temp").textContent = formatTemprature(feels_like);
}

const loadHumidity=({main:{humidity}})=>{
    let container = document.querySelector("#humidity");
    container.querySelector(".hum").textContent = humidity+" %";
}


document.addEventListener("DOMContentLoaded",async()=>{
    const currentWeather = await getCurrentWeatherData();
    loadCurrentForecast(currentWeather);

    const hourlyForecast = await getHourlyForecast(currentWeather);
    console.log(hourlyForecast);
    loadHourlyForecast(hourlyForecast);
    loadFeelsLike(currentWeather);
    loadHumidity(currentWeather);
})