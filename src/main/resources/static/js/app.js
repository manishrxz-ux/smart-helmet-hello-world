function generateCard(worker) {
    let statusColor = "green";
    let icon = "check_circle";
    
    if (worker.status === "red") {
        statusColor = "red";
        icon = "error";
    } else if (worker.status === "yellow") {
        statusColor = "orange";
        icon = "warning";
    }

    // Convert gas back to PPM to match OLED logic: (gasRaw / 4095) * 9600 + 400
    let ppm = Math.round((worker.gas * 9600) + 400);

    // Highlighting logic
    let tempClass = worker.temp > currentSettings.maxTemp ? "red-text bold" : "";
    let gasClass = worker.gas > currentSettings.maxGas ? "red-text bold" : "";
    let spo2Class = (worker.spo2 < currentSettings.minSpo2 && worker.spo2 > 0) ? "red-text bold" : "";
    let hrClass = (worker.hr > currentSettings.maxHr && worker.hr > 0) ? "red-text bold" : "";

    return `
        <div class="col s12 m6 l4">
            <div class="card hoverable worker-card">
                <div class="card-content">
                    <span class="card-title truncate">
                        <i class="material-icons ${statusColor}-text status-icon">${icon}</i>
                        ${worker.name}
                    </span>
                    <div class="divider" style="margin: 10px 0;"></div>
                    <div class="row" style="margin-bottom: 0;">
                        <div class="col s6 metric-box">
                            <i class="material-icons tiny grey-text">favorite</i>
                            <span class="${hrClass}">${worker.hr} bpm</span>
                            <div class="metric-label">Heart Rate</div>
                        </div>
                        <div class="col s6 metric-box">
                            <i class="material-icons tiny grey-text">opacity</i>
                            <span class="${spo2Class}">${worker.spo2}%</span>
                            <div class="metric-label">SpO2 Level</div>
                        </div>
                        <div class="col s6 metric-box" style="margin-top: 15px;">
                            <i class="material-icons tiny grey-text">thermostat</i>
                            <span class="${tempClass}">${worker.temp.toFixed(1)}&deg;C</span>
                            <div class="metric-label">Body Temp</div>
                        </div>
                        <div class="col s6 metric-box" style="margin-top: 15px;">
                            <i class="material-icons tiny grey-text">air</i>
                            <span class="${gasClass}">${ppm} ppm</span>
                            <div class="metric-label">Toxic Gas</div>
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
    setInterval(renderDashboard, 2000);
});
