// Function to fetch CSV data
async function fetchCityCoordinates() {
    const response = await fetch('path/to/citycoordinates.csv');
    const data = await response.text();
    return Papa.parse(data, { header: true }).data; // Using PapaParse for CSV parsing
}


// Function to populate location dropdown
async function populateLocationDropdown() {
    const cityCoordinates = await fetchCityCoordinates();
    const locationSelect = document.getElementById('location');

    // Clear existing options
    locationSelect.innerHTML = '';

    // Add new options based on CSV data
    cityCoordinates.forEach(city => {
        const option = document.createElement('option');
        option.value = `${city.Latitude},${city.Longitude}`;
        option.textContent = `${city.City}, ${city.Country}`;
        locationSelect.appendChild(option);
    });
}

// Call the function to populate location dropdown when the page loads
document.addEventListener('DOMContentLoaded', () => {
    populateLocationDropdown();
});

// Function to get weather data
function getWeather() {
    const locationSelect = document.getElementById('location');
    const selectedLocation = locationSelect.value;

    // Check if the selectedLocation is not empty
    if (selectedLocation.trim() === '') {
        alert('Please select a location.');
        return;
    }

    // Show loading indicator
    showLoadingIndicator();

    // Split the selectedLocation into latitude and longitude
    const [latitude, longitude] = selectedLocation.split(',');

    // Perform API request using latitude and longitude
    fetchWeatherData(latitude, longitude)
        .then((forecastData) => {
            // Display the 7-day weather forecast
            displayWeatherResults(forecastData);
        })
        .catch((error) => {
            // Handle API errors
            displayErrorMessage('Failed to fetch weather data. Please try again.');
        })
        .finally(() => {
            // Hide loading indicator regardless of success or failure
            hideLoadingIndicator();
        });
}

// Function to fetch weather data from 7Timer API
function fetchWeatherData(latitude, longitude) {
    const apiUrl = `https://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civillight&output=json`;

    return fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Extract the required data from the API response
            const forecastData = data.dataseries.slice(0, 7); // Extract data for the next 7 days

            // Map the forecast data to the required format
            const forecast = forecastData.map(day => ({
                date: new Date(`${day.date}`.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')),
                condition: day.weather,
                maxTemperature: day.temp2m.max,
                minTemperature: day.temp2m.min,
            }));

            return forecast;
        });
}

// Function to display weather results on the webpage
function displayWeatherResults(forecast) {

    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Get the selected location from the dropdown
    const locationSelect = document.getElementById('location');
    const selectedLocationName = locationSelect.options[locationSelect.selectedIndex].text;

    // Display the location name
    const locationNameElement = document.getElementById('locationName');
    locationNameElement.textContent = `Weather Forecast:  ${selectedLocationName}`;

    // Loop through the forecast data and display for each day
    forecast.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('weather-day');

        // Convert the date to a readable format
        const formattedDate = day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        // Create an image element for the weather condition icon
        const iconElement = document.createElement('img');
        iconElement.src = getIconPath(day.condition);
        iconElement.alt = day.condition;

        dayElement.innerHTML = `
            <h3>${formattedDate}</h3>
            ${iconElement.outerHTML}
            <p> ${day.condition}</p>
            <p>H: ${day.maxTemperature}°C</p>
            <p>L: ${day.minTemperature}°C</p>
        `;

        forecastContainer.appendChild(dayElement);
    });

    // Show the forecast container
    forecastContainer.classList.remove('hidden');
}

// Function to get the path of the weather condition icon
function getIconPath(condition) {
    // Assuming your icon files are named as the lowercase condition with a .png extension
    return `images/${condition.toLowerCase()}.png`;
}

// Function to show the loading indicator
function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.classList.remove('hidden');
}

// Function to hide the loading indicator
function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.classList.add('hidden');
}

// Function to handle API errors and display error message
function displayErrorMessage(message) {
    const resultsContainer = document.getElementById('weatherResults');
    resultsContainer.innerHTML = `<p class="error-message">${message}</p>`;
    resultsContainer.classList.remove('hidden');
}
