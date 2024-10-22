const temp = document.getElementById("temp"),
date= document.getElementById("date-time")
currentLocation = document.getElementById("location");
condition = document.getElementById("condition"),
rain = document.getElementById("rain"),
mainIcon = document.getElementById("icon")
uvIndex = document.querySelector("uv-index"),
windSpeed = document.querySelector("uv-index"),
sunRise = document.querySelector("uv-index"),
sunSet = document.querySelector("uv-index"),
humidity = document.querySelector("uv-index"),
visibility = document.querySelector("uv-index"),
humiditystatus= document.querySelector("uv-index"),
airquality = document.querySelector("uv-index"),
airqualityStatus= document.querySelector("uv-index"),
visibilityStatus = document.querySelector("uv-index")

let currentCity="";
let CurrentUnit="c";
let hourlyorweek="Week";

function getDateTime(){
    let now = new Date();
    hour = now.getHours(),
    minute = now.getMinutes();
    let days = [
        "sunday",
        "monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    hour = hour % 12;
    if(hour < 10) {
        hour ="0"+hour;
} 
if(minute < 10){
    minute = "0"+minute;
}
let dayString = days[now.getDay()];
return`${dayString},${hour}:${minute}`;
}
date.innerText = getDateTime();
setInterval(()=>{
    date.innerText = getDateTime();
},1000);
function getPublishIp(){
    fetch("https://geolocation-db.com/json/",
    {
        method: "GET",
    })
    .then((response)=>response.json())
    .then((data)=>{
        console.log(date);
        currentCity = data.currentCity;
        getWeatherData(data.city,CurrentUnit,hourlyorweek)
    });
}
getPublishIp();
function getWeatherData(city, unit, hourlyorweek){
    fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/$%7Bcity%7D?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
    {
        method:"GET",
    }
)
.then((response)=> response.json())
.then((data)=>{
    let today = data.currentConditions;
   if(unit === "c"){
        temp.innerText = today.temp;
    } else{
        // console.log(celciusToFahrenheit(today.temp));
        temp.innerText== celciusToFahrenheit(today.temp);
    }
    currentLocation.innerText = data.resolvedAddress;
    condition.innerText = today.conditions;
    rain.innerText = "perc -"+today.precip +"%";
});
}
function  celciusToFahrenheit(temp){
    return ((temp*9) / 5+32).toFixed(1);
}