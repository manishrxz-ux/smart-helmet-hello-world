function generateCard(worker) {
    const badgeColor = worker.status === 'green' ? 'bg-green' : (worker.status === 'yellow' ? 'bg-yellow' : 'bg-red');
    
    return `
        <div class="col s12 m6 l4">
            <div class="card worker-card hoverable">
                <div class="card-content">
                    <span class="status-badge ${badgeColor}">${worker.status}</span>
                    <span class="card-title">${worker.name}</span>
                    <p class="grey-text">${worker.id}</p>
                    
                    <div class="sensor-grid">
                        <div class="sensor-item">
                            <i class="material-icons">favorite</i>
                            <div>
                                <span class="sensor-value">${worker.hr} bpm</span>
                                <span class="sensor-label">Heart Rate</span>
                            </div>
                        </div>
                        <div class="sensor-item">
                            <i class="material-icons">thermostat</i>
                            <div>
                                <span class="sensor-value">${worker.temp} °C</span>
                                <span class="sensor-label">Body Temp</span>
                            </div>
                        </div>
                        <div class="sensor-item">
                            <i class="material-icons">air</i>
                            <div>
                                <span class="sensor-value">${worker.spo2} %</span>
                                <span class="sensor-label">SpO2 (Oxygen)</span>
                            </div>
                        </div>
                        <div class="sensor-item">
                            <i class="material-icons">warning</i>
                            <div>
                                <span class="sensor-value">${worker.gas} ppm</span>
                                <span class="sensor-label">Toxic Gas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Global Map and Marker Variables
let map;
let markers = {};

function initMap() {
    // Initialize map centered at a default location (e.g. India)
    map = L.map('map').setView([20.5937, 78.9629], 4);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Live Data Fetching
async function fetchWorkersData() {
    try {
        const response = await fetch('/api/workers');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch worker data:", error);
        return [];
    }
}

async function renderDashboard() {
    const workers = await fetchWorkersData();
    const grid = document.getElementById('workers-grid');
    grid.innerHTML = workers.map(generateCard).join('');
    
    document.getElementById('active-count').innerText = workers.length;
    document.getElementById('alert-count').innerText = workers.filter(w => w.status === 'red').length;

    // Update Map Markers
    if (map) {
        workers.forEach(w => {
            if (w.lat && w.lng) {
                // Determine marker color based on status
                let color = 'blue';
                if (w.status === 'red') color = 'red';
                else if (w.status === 'yellow') color = 'orange';
                else if (w.status === 'green') color = 'green';
                
                if (markers[w.id]) {
                    // Update existing marker
                    markers[w.id].setLatLng([w.lat, w.lng]);
                    // If we want to change color dynamically in leaflet easily, we can bind a popup instead or use custom icons.
                    markers[w.id].bindPopup(`<b>${w.name}</b><br>Status: ${w.status}`);
                } else {
                    // Create new marker
                    markers[w.id] = L.marker([w.lat, w.lng]).addTo(map)
                        .bindPopup(`<b>${w.name}</b><br>Status: ${w.status}`);
                }
            }
        });
    }
}

// Initial fetch and set polling
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {});
    
    initMap();
    renderDashboard();
    setInterval(renderDashboard, 5000);
});
