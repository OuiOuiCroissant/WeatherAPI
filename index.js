const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const fs = require('fs');
const city_list = require('./city_list.json');
require('dotenv').config()

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const content = JSON.parse(fs.readFileSync('city_list.json'));

let countries = ['Choose country'];
let cities = ['Choose city'];
let icon = "01d";
let cloudiness = String();
let temperature = String();
let humidity = String();
let wind_speed = String();
let sunrise = String();
let sunset = String();

function getCountryList () {
  for (let key of Object.keys(content)) {
    countries.push(content[key].country);
  }
  countries = new Set(countries);
  return Array.from(countries.values());
}
getCountryList ();

function getSunriseSunsetTime (unix_timestamp) {
  let date = new Date (unix_timestamp*1000);
  let hours = date.getHours();
  let minutes = date.getMinutes();

  return time = `${hours}:${minutes}`;
}

app.get('/', function (req, res) {
  res.render('index', {
    countries: countries,
    cities: cities,
    icon: icon,
    cloudiness: cloudiness,
    temperature: temperature,
    humidity: humidity,
    wind_speed: wind_speed,
    sunrise: sunrise,
    sunset: sunset
  });
});

app.post('/country', function (req, res) {
  res.redirect('/');

  function getCityList () {
    cities.length = 1;
    for (let key of Object.keys(content)) {
      if (content[key].country == req.body.country)
        cities.push(content[key].name);
    }
    return cities;
  }

  getCityList();
});

app.post('/city', function (req, res) {

  function getCityId () {
    for (let key of Object.keys(content)) {
      if (content[key].name == req.body.city)
      return url = `http://api.openweathermap.org/data/2.5/weather?id=${content[key].id}&APPID=${process.env.WEATHER_API}`;
    }
  }

  getCityId();

  request(url, function (err, response, body) {
    if (err) {
      throw err
    } else {
      let weather = JSON.parse(body);

      icon = weather.weather[0].icon;
      cloudiness = weather.weather[0].description;
      temperature = `${(weather.main.temp-273.15).toFixed(1)}\xB0`;
      humidity = `${weather.main.humidity}%`;
      wind_speed = `${weather.wind.speed}m/s`;
      sunrise = getSunriseSunsetTime(weather.sys.sunrise);
      sunset = getSunriseSunsetTime(weather.sys.sunset);
    }
    res.redirect('/');
  });
});

app.listen(3000);
