const temp = document.getElementById("temp"),
    date = document.getElementById("date-time"),
    currentLocation = document.getElementById("location"),
    condition = document.getElementById("condition"),
    rain = document.getElementById("rain"),
    mainIcon = document.getElementById("icon"),
    uvIndex = document.querySelector(".uv-index"),
    uvText = document.querySelector(".uv-text"),
    windSpeed = document.querySelector(".wind-speed"),
    sunRise = document.getElementById("sun-rise"),
    sunSet = document.getElementById("sun-set"),
    humidity = document.getElementById("humidity"),
    visibility = document.getElementById("visibility"),
    humidityStatus = document.getElementById("humidity-status"),
    airQuality = document.getElementById("air-quality"),
    airQualityStatus = document.getElementById("air-quality-status"),
    visibilityStatus = document.getElementById("visibility-status"),
    weatherCards = document.getElementById("weather-cards"),
    celciusBtn = document.querySelector(".celcius"),
    fahrenheitBtn = document.querySelector(".fahrenheit"),
    hourlyBtn = document.querySelector(".hourly"),
    weekBtn = document.querySelector(".week"),
    tempUnit = document.querySelectorAll(".temp-unit"),
    searchForm = document.querySelector("#search"),
    search = document.querySelector("#query");

let currentCity = "";
let currentUnit = "c";
let hourlyOrWeek = "week";

function getDateTime() {
    let now = new Date(),
        hour = now.getHours(),
        minute = now.getMinutes();
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    hour = hour % 12 || 12;
    hour = hour < 10 ? "0" + hour : hour;
    minute = minute < 10 ? "0" + minute : minute;
    let dayString = days[now.getDay()];
    return `${dayString}, ${hour}:${minute}`;
}

date.innerText = getDateTime();
setInterval(() => {
    date.innerText = getDateTime();
}, 1000);

function getPublishIp() {
    fetch(`https://geolocation-db.com/json/`, { method: "GET" })
        .then((response) => response.json())
        .then((data) => {
            currentCity = data.city;
          getWeatherData(currentCity, currentUnit, hourlyOrWeek);
        })
        .catch((error) => {
            console.log("Error fetching IP location:", error);
        });
}
getPublishIp();

function getWeatherData(city, unit, hourlyOrWeek) {
    fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`, { method: "GET" })
        .then((response) => response.json())
        .then((data) => {
            let today = data.currentConditions || {};
            temp.innerText = unit === "c" ? today.temp || 0 : celciusToFahrenheit(today.temp || 0);
            currentLocation.innerText = data.resolvedAddress || "Unknown location";
            condition.innerText = today.conditions || "N/A";
            rain.innerText = `perc - ${today.precip || 0}%`;
            uvIndex.innerText = today.uvindex || 0;
            windSpeed.innerText = today.windspeed || 0;
            humidity.innerText = `${today.humidity || 0}%`;
            visibility.innerText = today.visibility || "N/A";
            airQuality.innerText = today.winddir;
            measureUvIndex(today.uvindex || 0);
            updateHumidityStatus(today.humidity || 0);
            updateVisibilityStatus(today.visibility || 0);
            updateAirQualityStatus(today.winddir || 0); 
            sunRise.innerText = convertTimeTo12HourFormat(today.sunrise || "00:00");
            sunSet.innerText = convertTimeTo12HourFormat(today.sunset || "00:00");
            mainIcon.src = getIcon(today.icon || "partly-cloudy-day");
            changeBackground(today.icon || "partly-cloudy-day");
            updateForecast(hourlyOrWeek === "hourly" ? data.days[0].hours : data.days, unit, hourlyOrWeek);
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
        });
}

function celciusToFahrenheit(temp) {
    return ((temp * 9) / 5 + 32).toFixed(1);
}

function measureUvIndex(uvIndex) {
    uvText.innerText = uvIndex <= 2 ? "Low" : uvIndex <= 5 ? "Moderate" : uvIndex <= 7 ? "High" : uvIndex <= 10 ? "Very High" : "Extreme";
}

function updateHumidityStatus(humidity) {
    humidityStatus.innerText = humidity <= 30 ? "Low" : humidity <= 60 ? "Moderate" : "High";
}

function updateVisibilityStatus(visibility) {
    visibilityStatus.innerText = visibility <= 0.03 ? "Dense Fog" : visibility <= 0.16 ? "Moderate Fog" : visibility <= 0.35 ? "Light Fog" : visibility <= 1.13 ? "Very Light Fog" : visibility <= 2.16 ? "Light Mist" : visibility <= 5.4 ? "Very Light Mist" : visibility <= 10.8 ? "Clear Air" : "Very Clear Air";
}

function updateAirQualityStatus(airQuality) {
    airQualityStatus.innerText = airQuality <= 50 ? "Good👌" : airQuality <= 100 ? "Moderate😐" : airQuality <= 150 ? "Unhealthy for Sensitive Groups😷" : airQuality <= 200 ? "Unhealthy😷" : airQuality <= 250 ? "Very Unhealthy😨" : "Hazardous😱";
}

function convertTimeTo12HourFormat(time) {
    let [hour, minute] = time.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute < 10 ? "0" + minute : minute} ${ampm}`;
}

function getIcon(condition) {
    if (condition == "partly-cloudy-day") {
        return "https://i.ibb.co/PZQXH8V/27.png";
    } else if (condition == "partly-cloudy-night") {
        return "https://i.ibb.co/Kzkk59k/15.png";
    } else if (condition == "rain") {
        return "https://i.ibb.co/kBd2NTS/39.png";
    } else if (condition == "clear-day") {
        return "https://i.ibb.co/rb4rrJL/26.png";
    } else if (condition == "clear-night") {
        return "https://i.ibb.co/1nxNGHL/10.png";
    }
    return "https://i.ibb.co/PZQXH8V/27.png";
}

function updateForecast(data, unit, type) {
    weatherCards.innerHTML = ""; 

    let numCards = type === "hourly" ? 24 : 7; 
    for (let i = 0; i < numCards; i++) {
        let card = document.createElement("div");
        card.classList.add("card");
        let dayName = type === "week" ? getDayName(data[i].datetime) : getHour(data[i].datetime);
        let dayTemp = data[i].temp;
        if (unit === "f") {
            dayTemp = celciusToFahrenheit(data[i].temp);
        }
        let iconCondition = data[i].icon;
        let iconSrc = getIcon(iconCondition);
        let tempUnit = unit === "f" ? "°F" : "°C";
        card.innerHTML = `
        <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
                <img src="${iconSrc}" alt=""/>
            </div>
            <div class="day-temp">
                <h2 class="temp">${dayTemp}</h2>
                <span class="temp-unit">${tempUnit}</span>
            </div>`;
        weatherCards.appendChild(card);
    }
}

function changeBackground(condition) {
    const body = document.querySelector("body");
    let bg = "";
    if (condition == "partly-cloudy-day") {
        bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
    } else if (condition == "partly-cloudy-night") {
        bg = "https://i.ibb.co/RDfPqXz/pcn.jpg";
    } else if (condition == "rain") {
        bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
    } else if (condition == "clear-day") {
        bg = "https://i.ibb.co/WGry01m/cd.jpg";
    } else if (condition == "clear-night") {
        bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
    } else {
        bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
    }
    body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)), url(${bg})`;
}

fahrenheitBtn.addEventListener("click", () => changeUnit("f"));
celciusBtn.addEventListener("click", () => changeUnit("c"));
function changeUnit(unit) {
    if (currentUnit !== unit) {
        currentUnit = unit;
        tempUnit.forEach((ele) => (ele.innerText = `°${unit.toUpperCase()}`));
        celciusBtn.classList.toggle("active", unit === "c");
        fahrenheitBtn.classList.toggle("active", unit === "f");
        getWeatherData(currentCity, currentUnit, hourlyOrWeek);
    }
}

hourlyBtn.addEventListener("click", () => changeTimeSpan("hourly"));
weekBtn.addEventListener("click", () => changeTimeSpan("week"));
function changeTimeSpan(unit) {
    if (hourlyOrWeek !== unit) {
        hourlyOrWeek = unit;
        hourlyBtn.classList.toggle("active", unit === "hourly");
        weekBtn.classList.toggle("active", unit === "week");
        getWeatherData(currentCity, currentUnit, hourlyOrWeek);
    }
}


function getHour(time) {
    let [hour, minute] = time.split(":");
    let ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
}
function getDayName(date) {
    let day = new Date(date);
    let days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    return days[day.getDay()];
}
search.addEventListener("keydown", function (e) {
    if (e.keyCode === 13) {
        getWeatherData(search.value, currentUnit, hourlyOrWeek);
    }
});
searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    currentCity = search.value; 
    getWeatherData(currentCity, currentUnit, hourlyOrWeek);
    search.value = "";
});

// searchForm.addEventListener("submit", (e)=>{
//     e.preventDefault();
//     let location = search.value;
//     if(location){
//         currentCity = location;
//         getWeatherData(currentCity,currentUnit,hourlyOrWeek);
//     }
// })
// cities = [
//     "Banglore",
//     "gowibidanur",
//     "lahore",
//     "islamaba",
//     "chikkabalapur",
//     "hindupur",
// ];
// var currentFocus;
search.addEventListener("input",function (e){
    removeSuggestions();
    var a, 
        b,
        i,
      val = this.value;
      if(!val){
        return false;
      }
      currentFocus = -1;
      
      a= document.createElement("ul");
      a.setAttribute("id","suggestions");
       this.parentNode.appendChild(a);
      for(i = 0;i< cities.length; i++){
        if(cities[i].substr(0, val.length).toUpperCase()== val.toUpperCase()){
            b = document.createElement("li");
            b.innerHTML="<strong>" + cities[i].substr(0,val.length)+ "</strong>"
            b.innerHTML += cities[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" +cities[i]+"'>";
            b.addEventListener("click",function (e){
              search.value = this.getElementsByTagName("input")[0].value;  
              removeSuggestions();
            });
            a.appendChild(b);
        }
      }
    });
function removeSuggestions(){
    var x = document.getElementById("suggestions");
    if(x) x.parentNode.removeChild(x);
}
search.addEventListener("keydown",function (e){
    var x = document.getElementById("suggestions");
    if (x) x = x.getElementsByTagName("li");
    if (e.keyCode == 40){
        currentFocus++;
        addActive(x);
    } else if (e.keyCode == 38){
        currentFocus--;
        addActive(x);
    }
    if (e.keyCode == 13){
        e.preventDefault();
        if (currentFocus > -1){
        if (x) x[currentFocus].click();
    }
}
});
function addActive(x){
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus =0;
    if (currentFocus < 0) currentFocus = x.length-1;
    x[currentFocus].classList.add("active");
}
function removeActive(x){
    for (var i = 0; i < x.length; i++){
        x[i].classList.remove("active");
    }
}
