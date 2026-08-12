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
    // Initialize map centered at Amravati, Maharashtra
    map = L.map('map').setView([20.9320, 77.7523], 13);
    
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
// Settings Logic
let currentSettings = {};

async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        currentSettings = await response.json();
        
        document.getElementById('set-temp').value = currentSettings.maxTemp;
        document.getElementById('val-temp').innerText = currentSettings.maxTemp;
        
        // Convert normalized gas back to PPM for UI roughly
        let gasPpm = Math.round(currentSettings.maxGas * 10000);
        document.getElementById('set-gas').value = gasPpm;
        document.getElementById('val-gas').innerText = gasPpm;
        
        document.getElementById('set-spo2').value = currentSettings.minSpo2;
        document.getElementById('val-spo2').innerText = currentSettings.minSpo2;
        
        document.getElementById('set-maxhr').value = currentSettings.maxHr;
        document.getElementById('val-maxhr').innerText = currentSettings.maxHr;
    } catch (e) { console.error("Failed to load settings", e); }
}

async function saveSettings() {
    currentSettings.maxTemp = parseFloat(document.getElementById('set-temp').value);
    currentSettings.minSpo2 = parseInt(document.getElementById('set-spo2').value);
    currentSettings.maxHr = parseInt(document.getElementById('set-maxhr').value);
    
    // Convert UI PPM back to normalized 0-1 for backend
    let gasPpm = parseInt(document.getElementById('set-gas').value);
    currentSettings.maxGas = gasPpm / 10000.0;

    await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings)
    });
    
    M.toast({html: 'Alert Thresholds Updated!'});
}

// Update labels when sliders move
document.querySelectorAll('input[type=range]').forEach(input => {
    input.addEventListener('input', function() {
        document.getElementById('val-' + this.id.split('-')[1]).innerText = this.value;
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    var elems = document.querySelectorAll('.fixed-action-btn');
    M.FloatingActionButton.init(elems, {});
    
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals, {});
    
    loadSettings();
    initMap();
    renderDashboard();
    setInterval(renderDashboard, 5000);
});
