/************** Get elements from DOM **************/
const pageBody = document.querySelector('.container');
const locationNow = document.querySelector('#location');
const date = document.querySelector('#current-date');

const temperature = document.querySelector('#temperature');
const description = document.querySelector('#description');
const feelsLike = document.querySelector('#feels-like');
const icon = document.querySelector('#icon');

const hours = document.querySelector('.hours');
const minutes = document.querySelector('.minutes');
const seconds = document.querySelector('.seconds');

const form = document.querySelector('.search');
const searchBox = document.querySelector('.location-search');

const weatherKey = config.WEATHER_KEY;
const timeKey = config.TIME_KEY;

// Initial data to show weather and time in Oslo, Norway
let rawOffset = 3600;
let dstOffset = 3600;
let city = 'Oslo';
let lng = '59.911491';
let lat = '10.757933';


/************** Temporary proxy for live server **************/
// const proxy = 'https://cors-anywhere.herokuapp.com/';


/************** Search-box that changes the data **************/
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newLocation = searchBox.value; // User's search input
    city = newLocation; 
    weatherData(); // Update weather AND time to local of searched place
    changeBackground();
    form.reset();
})

/*
// weatherData => 
=> timeData => 
=> workingTime => 
=> newTimeFunc

// Fetch weather first. If success, pass cocordinates =>
=> fetch local time. If success, pass offsets =>
=> set the date to current local =>
=> start local time.
*/


/******* Fetch the weather information and update it on the screen *******/
const weatherData = async () => {
    try {
        const units = 'metric';
        const apiKey = weatherKey;
        const url = 'https://api.openweathermap.org/data/2.5/weather?q=';
        const endpoint = `${city}&units=${units}&appid=${apiKey}`;

        const response = await fetch(url + endpoint); // proxy + url + endpoint
        if (response.ok) {
            const jsonResponse = await response.json();
            // console.log(jsonResponse);
            const iconImage = jsonResponse.weather[0].icon;
            lng = jsonResponse.coord.lon; // New longitute
            lat = jsonResponse.coord.lat; // New latitude

            temperature.innerText = Math.round(jsonResponse.main.temp);
            description.innerText = jsonResponse.weather[0].description;
            feelsLike.innerText = Math.round(jsonResponse.main.feels_like);
            icon.src = `https://openweathermap.org/img/wn/${iconImage}@2x.png`;
            locationNow.innerText = jsonResponse.name + ', ' + jsonResponse.sys.country;
            timeData(); // Change time to local
        } else {
            throw new Error('Weather request failed!');
        }
    } catch (error) {
        console.log(error);
    }
}

/************** Fetch local time information **************/
const timeData = async () => {
    try {
        const url = 'https://maps.googleapis.com/maps/api/timezone/json?location=';
        const apiKey = timeKey;
        const endpoint = `${lat},${lng}&timestamp=1625143866&key=${apiKey}`;

        const response = await fetch(url + endpoint); // proxy + url + endpoint
        if (response.ok) {
            const jsonResponse = await response.json();
            // console.log(jsonResponse);
            rawOffset = jsonResponse.rawOffset;
            dstOffset = jsonResponse.dstOffset;
            workingTime(); // Make the new time update every second
        } else {
            throw new Error('Time request failed');
        }
    } catch (error) {
        console.log(error);
    }
}


/************** Set the local date and start local clock **************/
const workingTime = () => {
    const currentDate = Date.now();
    const newMilliseconds = currentDate + (dstOffset * 1000) + (rawOffset * 1000);
    const newTime = new Date(newMilliseconds);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const dd = newTime.getUTCDate();
    const mm = newTime.getUTCMonth();
    
    date.innerText = `${months[mm]}, ${dd}`;

    setInterval(newTimeFunc, 1000); // Start the clock according to local time
}


/************* Convert the fetched time to the correct string *************/
const newTimeFunc = () => {
    const currentDate = Date.now(); // Current date in milliseconds
    const newMilliseconds = currentDate + (dstOffset * 1000) + (rawOffset * 1000); // Set the time to the searched city
    const newTime = new Date(newMilliseconds); // Convert to string

    // Get current local time.
    const hr = newTime.getUTCHours();
    const min = newTime.getUTCMinutes();
    const sec = newTime.getUTCSeconds();

    // Make the numbers show with "0" in front if the number one digit.
    hr > 9 ? hours.innerText = `${hr}` : hours.innerText = `0${hr}`;
    min > 9 ? minutes.innerText = `${min}` : minutes.innerText = `0${min}`;
    sec > 9 ? seconds.innerText = sec : seconds.innerText = `0${sec}`;
}


/************* Change background that represents new location *************/
const changeBackground = async () => {
    const response = await fetch(`https://source.unsplash.com/1920x1080/?${city}`);
    if (response.ok) {
        pageBody.style.background = `url('${response.url}') no-repeat center center fixed`;
    } else {
        throw new Error('Could not get wallpaper!');
    }
}


/************** Show the initial data when page has loaded **************/
window.addEventListener('load', weatherData);
window.addEventListener('load', workingTime);
window.addEventListener('load', changeBackground);
