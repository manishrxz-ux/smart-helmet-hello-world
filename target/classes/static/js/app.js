function updateCardDOM(worker) {
    let card = document.getElementById('worker-card-' + worker.id);
    let isNew = false;
    
    if (!card) {
        card = document.createElement('div');
        card.id = 'worker-card-' + worker.id;
        card.className = "col s12"; // Giant Card! Takes full width
        document.getElementById('workers-grid').appendChild(card);
        isNew = true;
    }

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

    // Online/Offline Logic
    let isOffline = false;
    if (worker.secondsSinceUpdate !== undefined) {
        if (worker.secondsSinceUpdate > 15) { // Offline if no data for 15s
            isOffline = true;
            statusColor = "grey";
            icon = "cloud_off";
        }
    }
    let offlineBadge = isOffline ? '<span class="new badge grey" data-badge-caption="Offline"></span>' : '<span class="new badge green" data-badge-caption="Live"></span>';

    // Highlighting logic
    let tempClass = worker.temp > currentSettings.maxTemp ? "red-text bold" : (worker.temp > currentSettings.maxTemp * 0.95 ? "orange-text" : "");
    let gasClass = worker.gas > currentSettings.maxGas ? "red-text bold" : (worker.gas > currentSettings.maxGas * 0.8 ? "orange-text" : "");
    let spo2Class = (worker.spo2 < currentSettings.minSpo2 && worker.spo2 > 0) ? "red-text bold" : ((worker.spo2 < currentSettings.minSpo2 + 2 && worker.spo2 > 0) ? "orange-text" : "");
    let hrClass = (worker.hr > currentSettings.maxHr && worker.hr > 0) ? "red-text bold" : ((worker.hr > currentSettings.maxHr * 0.9 && worker.hr > 0) ? "orange-text" : "");

    let html = `
        <div class="card hoverable worker-card" style="padding: 20px;">
            <div class="card-content">
                <span class="card-title truncate" style="font-size: 2.5rem; font-weight: 500; margin-bottom: 20px;">
                    <i class="material-icons ${statusColor}-text status-icon" style="font-size: 3rem; vertical-align: middle;">${icon}</i>
                    ${worker.name} ${offlineBadge}
                </span>
                <div class="divider" style="margin: 20px 0;"></div>
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; text-align: center;">
                    
                    <div style="flex: 1; min-width: 150px; margin: 10px;">
                        <i class="material-icons grey-text" style="font-size: 2.5rem;">favorite</i>
                        <div class="${hrClass}" style="font-size: 3rem; font-weight: bold; line-height: 1.2;">${worker.hr} <span style="font-size: 1.5rem;">bpm</span></div>
                        <div style="font-size: 1.5rem; color: #757575;">Heart Rate</div>
                    </div>
                    
                    <div style="flex: 1; min-width: 150px; margin: 10px;">
                        <i class="material-icons grey-text" style="font-size: 2.5rem;">opacity</i>
                        <div class="${spo2Class}" style="font-size: 3rem; font-weight: bold; line-height: 1.2;">${worker.spo2}<span style="font-size: 1.5rem;">%</span></div>
                        <div style="font-size: 1.5rem; color: #757575;">SpO2 Level</div>
                    </div>
                    
                    <div style="flex: 1; min-width: 150px; margin: 10px;">
                        <i class="material-icons grey-text" style="font-size: 2.5rem;">thermostat</i>
                        <div class="${tempClass}" style="font-size: 3rem; font-weight: bold; line-height: 1.2;">${worker.temp ? worker.temp.toFixed(1) : "0.0"}<span style="font-size: 1.5rem;">&deg;C</span></div>
                        <div style="font-size: 1.5rem; color: #757575;">Body Temp</div>
                    </div>
                    
                    <div style="flex: 1; min-width: 150px; margin: 10px;">
                        <i class="material-icons grey-text" style="font-size: 2.5rem;">ac_unit</i>
                        <div style="font-size: 3rem; font-weight: bold; line-height: 1.2;">${worker.envTemp ? worker.envTemp.toFixed(1) : "0.0"}<span style="font-size: 1.5rem;">&deg;C</span></div>
                        <div style="font-size: 1.5rem; color: #757575;">Env Temp</div>
                    </div>
                    
                    <div style="flex: 1; min-width: 150px; margin: 10px;">
                        <i class="material-icons grey-text" style="font-size: 2.5rem;">air</i>
                        <div class="${gasClass}" style="font-size: 3rem; font-weight: bold; line-height: 1.2;">${ppm} <span style="font-size: 1.5rem;">ppm</span></div>
                        <div style="font-size: 1.5rem; color: #757575;">Toxic Gas</div>
                    </div>
                    
                </div>
            </div>
        </div>
    `;
    
    // Smooth DOM replacement
    card.innerHTML = html;
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

function updateMapMarker(id, name, lat, lng, status) {
    let color = 'blue';
    if (status === 'red') color = 'red';
    else if (status === 'yellow') color = 'orange';
    else if (status === 'green') color = 'green';
    
    if (markers[id]) {
        markers[id].setLatLng([lat, lng]);
        markers[id].bindPopup(`<b>${name}</b><br>Status: ${status}`);
    } else {
        markers[id] = L.marker([lat, lng]).addTo(map)
            .bindPopup(`<b>${name}</b><br>Status: ${status}`);
    }
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
    
    document.getElementById('active-count').innerText = workers.length;
    document.getElementById('alert-count').innerText = workers.filter(w => w.status === 'red').length;
    
    let currentIds = workers.map(w => w.id);
    
    workers.forEach(worker => {
        updateCardDOM(worker);
        if(worker.lat && worker.lng) {
            updateMapMarker(worker.id, worker.name, worker.lat, worker.lng, worker.status);
        }
    });

    // Clean up DOM for deleted workers
    Array.from(document.getElementById('workers-grid').children).forEach(child => {
        let id = child.id.replace('worker-card-', '');
        if (!currentIds.includes(id)) {
            child.remove();
        }
    });
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
