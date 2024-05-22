// Initialize the map
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch data from GFW API
const apiUrl = 'https://gateway.api.globalfishingwatch.org/v2/events';
const apiKey = 'https://gateway.api.globalfishingwatch.org/v2/datasets/public-eez-areas/user-context-layers';

fetch(apiUrl, {
    headers: {
        'Authorization': `Bearer ${apiKey}`
    }
})
.then(response => response.json())
.then(data => {
    // Process and display the data on the map
    data.forEach(event => {
        L.marker([event.latitude, event.longitude])
        .addTo(map)
        .bindPopup(`<b>Vessel:</b> ${event.vessel.name}<br><b>Event:</b> ${event.type}`);
    });
})
.catch(error => console.error('Error fetching data:', error));

async function fetchData(apiUrl, apiKey) {
    const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    return response.json();
}

async function initMap() {
    const map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const apiKey = 'https://gateway.api.globalfishingwatch.org/v2/datasets/public-eez-areas/user-context-layers';
    const vesselData = await fetchData('https://gateway.api.globalfishingwatch.org/v2/vessels', apiKey);
    const fishingData = await fetchData('https://gateway.api.globalfishingwatch.org/v2/events', apiKey);

    vesselData.forEach(vessel => {
        L.marker([vessel.latitude, vessel.longitude]).addTo(map)
            .bindPopup(`<b>Vessel:</b> ${vessel.name}`);
    });

    fishingData.forEach(event => {
        L.circle([event.latitude, event.longitude], { color: 'red', radius: 5000 }).addTo(map)
            .bindPopup(`<b>Event:</b> ${event.type}`);
    });
}

initMap().catch(error => console.error('Error initializing map:', error));
