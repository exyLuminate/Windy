const GEOCODING_API_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
let currentUnit = 'C';
let currentCityData = null;
let updateInterval;

const els = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    suggestionsList: document.getElementById('suggestionsList'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    currentWeatherCard: document.getElementById('currentWeatherCard'),
    cityName: document.getElementById('cityName'),
    currentDate: document.getElementById('currentDate'),
    saveFavoriteBtn: document.getElementById('saveFavoriteBtn'),
    currentTemp: document.getElementById('currentTemp'),
    weatherIcon: document.getElementById('weatherIcon'),
    weatherDesc: document.getElementById('weatherDesc'),
    humidity: document.getElementById('humidity'),
    windSpeed: document.getElementById('windSpeed'),
    forecastContainer: document.getElementById('forecastContainer'),
    favoritesList: document.getElementById('favoritesList'),
    themeToggle: document.getElementById('themeToggle'),
    refreshBtn: document.getElementById('refreshBtn'),
    unitToggle: document.getElementById('unitToggle'),
    locateBtn: document.getElementById('locateBtn'),    
};

function getWeatherInfo(code) {
    const codes = {
        0: { desc: "Cerah", icon: "fa-sun", color: "text-yellow-500" },
        1: { desc: "Cerah Berawan", icon: "fa-cloud-sun", color: "text-yellow-400" },
        2: { desc: "Berawan", icon: "fa-cloud", color: "text-gray-400" },
        3: { desc: "Mendung", icon: "fa-cloud", color: "text-gray-600" },
        45: { desc: "Berkabut", icon: "fa-smog", color: "text-gray-400" },
        48: { desc: "Berkabut Tebal", icon: "fa-smog", color: "text-gray-500" },
        51: { desc: "Gerimis Ringan", icon: "fa-cloud-rain", color: "text-blue-300" },
        53: { desc: "Gerimis", icon: "fa-cloud-rain", color: "text-blue-400" },
        55: { desc: "Gerimis Lebat", icon: "fa-cloud-showers-heavy", color: "text-blue-500" },
        61: { desc: "Hujan Ringan", icon: "fa-cloud-showers-heavy", color: "text-blue-400" },
        63: { desc: "Hujan Sedang", icon: "fa-cloud-showers-heavy", color: "text-blue-500" },
        65: { desc: "Hujan Lebat", icon: "fa-cloud-showers-water", color: "text-blue-700" },
        80: { desc: "Hujan Lokal", icon: "fa-cloud-sun-rain", color: "text-blue-500" },
        95: { desc: "Badai Petir", icon: "fa-bolt", color: "text-yellow-600" },
    };
    return codes[code] || { desc: "Unknown", icon: "fa-question", color: "text-gray-400" };
}

async function searchCity(query) {
    if (!query) return;
    
    showLoading(true);
    try {
        const response = await fetch(`${GEOCODING_API_URL}?name=${query}&count=5&language=id&format=json`);
        const data = await response.json();
        
        if (!data.results) {
            alert("Kota tidak ditemukan!");
            return;
        }

        const firstCity = data.results[0];
        getWeatherData(firstCity.latitude, firstCity.longitude, firstCity.name, firstCity.country);
        
        renderSuggestions(data.results);
    } catch (error) {
        console.error("Error fetching city:", error);
        alert("Gagal mencari kota. Cek koneksi internet.");
    } finally {
        showLoading(false);
    }
}

async function getWeatherData(lat, lon, name, country) {
    showLoading(true);
    els.suggestionsList.classList.add('hidden');

    try {
        const url = `${WEATHER_API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
        
        const response = await fetch(url);
        
        if (!response.ok) throw new Error("Gagal mengambil data cuaca");

        const data = await response.json();

        currentCityData = { lat, lon, name, country };

        const currentDataFormatted = {
            temperature: data.current.temperature_2m,
            weathercode: data.current.weather_code,
            windspeed: data.current.wind_speed_10m,
            humidity: data.current.relative_humidity_2m,
            time: data.current.time
        };

        updateCurrentUI(currentDataFormatted, name, data.daily);
        updateForecastUI(data.daily);
        
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(() => getWeatherData(lat, lon, name, country), 300000); 

    } catch (error) {
        console.error("Error fetching weather:", error);
        alert("Gagal mengambil data cuaca. Cek console untuk detail.");
    } finally {
        showLoading(false);
    }
}

function getUserLocation() {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    // KITA PAKAI API BIGDATACLOUD
                    // Ini lebih cepat dan jarang error untuk project localhost
                    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`;
                    
                    const response = await fetch(url);
                    const data = await response.json();
                    
                    let cityName = "Lokasi Anda";
                    let countryName = "Indonesia";

                    // Logika pengambilan nama yang lebih pintar
                    // Dia otomatis cari nama kota/kabupaten/kecamatan yang paling relevan
                    if (data.city) {
                        cityName = data.city;
                    } else if (data.locality) {
                        cityName = data.locality;
                    } else if (data.principalSubdivision) {
                        cityName = data.principalSubdivision;
                    }
                    
                    // Bersihkan kata-kata administratif biar rapi di UI
                    cityName = cityName
                        .replace("Kota ", "")
                        .replace("Kabupaten ", "")
                        .replace("Kecamatan ", "");

                    if (data.countryName) countryName = data.countryName;
                    
                    // Isi kolom pencarian
                    els.searchInput.value = cityName;

                    // Panggil data cuaca
                    getWeatherData(lat, lon, cityName, countryName);
                    
                } catch (error) {
                    console.error("Reverse geocoding failed:", error);
                    getWeatherData(lat, lon, "Lokasi Terdeteksi", "");
                }
            },
            (error) => {
                showLoading(false);
                let msg = "Gagal mendeteksi lokasi.";
                if(error.code === 1) msg = "Izin lokasi ditolak. Mohon izinkan akses lokasi di browser.";
                alert(msg);
            }
        );
    } else {
        alert("Browser Anda tidak mendukung Geolocation.");
    }
}

function updateCurrentUI(current, cityName, daily) {
    els.currentWeatherCard.classList.remove('hidden');
    
    els.cityName.innerText = cityName;
    els.currentDate.innerHTML = `<i class="fa-regular fa-clock"></i> ${new Date().toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
    
    let temp = current.temperature;
    if (currentUnit === 'F') {
        temp = (temp * 9/5) + 32;
    }
    els.currentTemp.innerText = Math.round(temp);

    const info = getWeatherInfo(current.weathercode);
    els.weatherIcon.innerHTML = `<i class="fa-solid ${info.icon} ${info.color}"></i>`;
    els.weatherDesc.innerText = info.desc;

    els.windSpeed.innerText = current.windspeed;
    els.humidity.innerText = current.humidity;
}

function updateForecastUI(daily) {
    els.forecastContainer.innerHTML = ''; 

    for (let i = 1; i <= 5; i++) {
        if (!daily.time || !daily.time[i]) break; 

        const date = new Date(daily.time[i]).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        
        const code = daily.weather_code[i]; 
        const info = getWeatherInfo(code);
        
        let min = daily.temperature_2m_min[i];
        let max = daily.temperature_2m_max[i];

        if (currentUnit === 'F') {
            min = (min * 9/5) + 32;
            max = (max * 9/5) + 32;
        }

        const html = `
            <div class="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg flex flex-col items-center shadow-sm hover:shadow-md transition">
                <p class="text-sm text-gray-500 dark:text-gray-300 font-semibold">${date}</p>
                <div class="text-3xl my-2 ${info.color}">
                    <i class="fa-solid ${info.icon}"></i>
                </div>
                <p class="text-xs text-center mb-2 font-medium">${info.desc}</p>
                <div class="flex gap-2 text-sm font-bold">
                    <span class="text-blue-500">${Math.round(min)}°</span>
                    <span class="text-red-500">${Math.round(max)}°</span>
                </div>
            </div>
        `;
        els.forecastContainer.innerHTML += html;
    }
}

function renderSuggestions(results) {
    els.suggestionsList.innerHTML = '';
    if (results.length > 0) {
        els.suggestionsList.classList.remove('hidden');
        results.forEach(city => {
            const li = document.createElement('li');
            li.className = "p-3 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer border-b dark:border-slate-700 last:border-0";
            li.innerHTML = `
                <div class="font-bold text-gray-800 dark:text-gray-200">${city.name}</div>
                <div class="text-xs text-gray-500">${city.admin1 || ''}, ${city.country}</div>
            `;
            li.addEventListener('click', () => {
                getWeatherData(city.latitude, city.longitude, city.name, city.country);
                els.searchInput.value = city.name;
            });
            els.suggestionsList.appendChild(li);
        });
    } else {
        els.suggestionsList.classList.add('hidden');
    }
}

async function loadFavorites() {
    try {
        const response = await fetch('api.php');
        const result = await response.json();
        
        els.favoritesList.innerHTML = '';
        if (result.data && result.data.length > 0) {
            result.data.forEach(city => {
                const li = document.createElement('li');
                li.className = "flex justify-between items-center bg-gray-50 dark:bg-slate-700 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition cursor-pointer";
                li.innerHTML = `
                    <span onclick="getWeatherData(${city.lat}, ${city.lon}, '${city.name}', '${city.country}')" class="flex-grow font-medium">${city.name}</span>
                    <button onclick="deleteFavorite('${city.id}')" class="text-red-400 hover:text-red-600 ml-2">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                `;
                els.favoritesList.appendChild(li);
            });
        } else {
            els.favoritesList.innerHTML = '<li class="text-center text-gray-500 text-sm italic py-4">Belum ada kota favorit.</li>';
        }
    } catch (error) {
        console.error("Error loading favorites:", error);
    }
}

async function saveFavorite() {
    if (!currentCityData) return alert("Cari kota terlebih dahulu!");

    try {
        const response = await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentCityData)
        });
        const result = await response.json();
        
        if (result.status === 'success') {
            alert(`Berhasil menyimpan ${result.data.name}`);
            loadFavorites(); 
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error saving favorite:", error);
    }
}

window.deleteFavorite = async function(id) {
    if(!confirm("Hapus dari favorit?")) return;
    try {
        const response = await fetch(`api.php?id=${id}`, { method: 'DELETE' });
        const result = await response.json();
        if(result.status === 'success') loadFavorites();
    } catch (error) {
        console.error("Error deleting:", error);
    }
};

els.searchBtn.addEventListener('click', () => {
    searchCity(els.searchInput.value);
});

let timeoutId;
els.searchInput.addEventListener('input', (e) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
        if(e.target.value.length > 2) searchCity(e.target.value);
    }, 500);
});

els.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        clearTimeout(timeoutId);
        searchCity(els.searchInput.value);
    }
});

els.themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    els.themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
});

els.unitToggle.addEventListener('click', () => {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    els.unitToggle.innerText = `°${currentUnit}`;
    if (currentCityData) {
        getWeatherData(currentCityData.lat, currentCityData.lon, currentCityData.name, currentCityData.country);
    }
});

els.refreshBtn.addEventListener('click', () => {
    if (currentCityData) {
        getWeatherData(currentCityData.lat, currentCityData.lon, currentCityData.name, currentCityData.country);
    }
});

els.saveFavoriteBtn.addEventListener('click', saveFavorite);

function showLoading(show) {
    if (show) els.loadingIndicator.classList.remove('hidden');
    else els.loadingIndicator.classList.add('hidden');
}

els.locateBtn.addEventListener('click', getUserLocation);

loadFavorites();