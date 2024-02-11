document.addEventListener("DOMContentLoaded", async function () {
  const forecastContainer = document.getElementById("forecast-display");
  const weatherResults = document.getElementById("weatherResults");
  const toggleButton = document.getElementById("toggleUnitBtn");

  const weatherApiKey = "8b5197e33de4d2ab503208b076814a9e";
  let isCelsius = true; // Default temperature unit is Celsius
  let originalTemperature = null; // Variable to store the original temperature value

  function displayWeatherByLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          updateWeather(latitude, longitude);
          updateForecast(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          weatherResults.innerHTML =
            "<p>Geolocation denied for Weather info</p>";
        }
      );
    } else {
      weatherResults.innerHTML =
        "<p>Geolocation is not supported by this browser</p>";
    }
  }

  async function updateWeather(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Weather data not found");
      }

      const data = await response.json();

      // Store the original temperature value
      originalTemperature = data.main.temp;

      // Update current weather display
      updateWeatherDisplay(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
      weatherResults.innerHTML = "<p>Error fetching weather</p>";
    }
  }

  async function updateForecast(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error("Forecast data not found");
      }

      const data = await response.json();

      // Display 5-day forecast
      displayForecast(data.list);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      weatherResults.innerHTML = "<p>Error fetching forecast</p>";
    }
  }

  function updateWeatherDisplay(data) {
    const descriptionElement = document.getElementById("weather-description");
    const temperatureElement = document.getElementById("temperature");
    const locationElement = document.getElementById("location");

    descriptionElement.textContent = data.weather[0].description;
    temperatureElement.textContent = `Temperature: ${originalTemperature} °C`; // Display the original temperature
    locationElement.textContent = `Location: ${data.name}, ${data.sys.country}`;
  }

  function displayForecast(forecastData) {
    forecastContainer.innerHTML = "";

    forecastData.slice(0, 5).forEach((day) => {
      const forecastItem = document.createElement("div");
      forecastItem.classList.add("forecast-item");

      const date = new Date(day.dt * 1000);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });

      const dayName = document.createElement("div");
      dayName.textContent = dayOfWeek;
      forecastItem.appendChild(dayName);

      const icon = document.createElement("img");
      icon.src = `https://openweathermap.org/img/wn/${day.weather[0].icon}.png`;
      icon.alt = day.weather[0].description;
      forecastItem.appendChild(icon);

      const temp = document.createElement("div");
      temp.textContent = `Temperature: ${day.main.temp} °C`;
      forecastItem.appendChild(temp);

      forecastContainer.appendChild(forecastItem);
    });
  }

  function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    toggleButton.textContent = isCelsius
      ? "Toggle to Fahrenheit"
      : "Toggle to Celsius";

    const temperatureElement = document.getElementById("temperature");
    const currentTemperature = parseFloat(originalTemperature); // Convert the original temperature to a float

    if (isCelsius) {
      temperatureElement.textContent = `Temperature: ${currentTemperature} °C`;
    } else {
      const temperatureInFahrenheit = (currentTemperature * 9) / 5 + 32;
      temperatureElement.textContent = `Temperature: ${temperatureInFahrenheit.toFixed(
        2
      )} °F`;
    }

    const forecastTemperatures = document.querySelectorAll(
      ".forecast-item div:nth-child(3)"
    ); // Select all forecast temperature elements
    forecastTemperatures.forEach((tempElement) => {
      const tempText = tempElement.textContent.split(":")[1]; // Extract the temperature value
      const currentTemp = parseFloat(tempText); // Convert the temperature to a float

      if (isCelsius) {
        tempElement.textContent = `Temperature: ${currentTemp} °C`;
      } else {
        const tempInFahrenheit = (currentTemp * 9) / 5 + 32;
        tempElement.textContent = `Temperature: ${tempInFahrenheit.toFixed(
          2
        )} °F`;
      }
    });
  }

  toggleButton.addEventListener("click", toggleTemperatureUnit);

  displayWeatherByLocation();
});
