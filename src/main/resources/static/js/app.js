function updateCardDOM(worker) {
    let card = document.getElementById('worker-card-' + worker.id);
    let isNew = false;
    
    if (!card) {
        card = document.createElement('div');
        card.id = 'worker-card-' + worker.id;
        card.className = "col s12";
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

    let ppm = Math.round(worker.gas);

    let isOffline = false;
    if (worker.secondsSinceUpdate !== undefined) {
        if (worker.secondsSinceUpdate > 15) {
            isOffline = true;
            statusColor = "grey";
            icon = "cloud_off";
        }
    }
    let offlineBadge = isOffline ? '<span class="new badge grey" data-badge-caption="Offline"></span>' : '<span class="new badge green" data-badge-caption="Live"></span>';

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
    card.innerHTML = html;
}

let map;
let markers = {};

function initMap() {
    map = L.map('map').setView([20.9320, 77.7523], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
}

function updateMapMarker(id, name, lat, lng, status) {
    if (markers[id]) {
        markers[id].setLatLng([lat, lng]);
        markers[id].bindPopup(`<b>${name}</b><br>Status: ${status}`);
    } else {
        markers[id] = L.marker([lat, lng]).addTo(map)
            .bindPopup(`<b>${name}</b><br>Status: ${status}`);
    }
}

async function fetchWorkersData() {
    try {
        const response = await fetch('/api/workers');
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
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

    Array.from(document.getElementById('workers-grid').children).forEach(child => {
        let id = child.id.replace('worker-card-', '');
        if (!currentIds.includes(id)) {
            child.remove();
        }
    });
}

let currentSettings = {};

async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        currentSettings = await response.json();
        
        document.getElementById('set-temp').value = currentSettings.maxTemp;
        document.getElementById('val-temp').innerText = currentSettings.maxTemp;
        
        let gasPpm = Math.round(currentSettings.maxGas);
        document.getElementById('set-gas').value = gasPpm;
        document.getElementById('val-gas').innerText = gasPpm;
        
        if (currentSettings.maxHr !== undefined) {
            document.getElementById('hrRange').value = currentSettings.maxHr;
            document.getElementById('hrVal').innerText = currentSettings.maxHr;
            document.getElementById('spo2Range').value = currentSettings.minSpo2;
            document.getElementById('spo2Val').innerText = currentSettings.minSpo2;
        }
        
        if (currentSettings.maxEnvTemp !== undefined) {
            document.getElementById('envTempRange').value = currentSettings.maxEnvTemp;
            document.getElementById('envTempVal').innerText = currentSettings.maxEnvTemp;
            document.getElementById('checkHrSpo2Toggle').checked = currentSettings.checkHrSpo2;
        }
    } catch (e) { console.error("Failed to load settings", e); }
}

async function saveSettings() {
    currentSettings.maxTemp = parseFloat(document.getElementById('set-temp').value);
    currentSettings.minSpo2 = parseInt(document.getElementById('spo2Range').value);
    currentSettings.maxHr = parseInt(document.getElementById('hrRange').value);
    currentSettings.minHr = 50;
    currentSettings.maxEnvTemp = parseFloat(document.getElementById('envTempRange').value);
    currentSettings.checkHrSpo2 = document.getElementById('checkHrSpo2Toggle').checked;
    
    let gasPpm = parseInt(document.getElementById('set-gas').value);
    currentSettings.maxGas = gasPpm;

    await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings)
    });
    
    M.toast({html: 'Alert Thresholds Saved to MySQL Database!'});
}

let alertData = [];

async function fetchAlerts() {
    try {
        const response = await fetch('/api/alerts');
        if (response.ok) {
            alertData = await response.json();
            let tbody = document.getElementById('alerts-table-body');
            tbody.innerHTML = '';
            
            alertData.forEach(alert => {
                let localTime = new Date(alert.timestamp + 'Z').toLocaleString();
                let row = `<tr>
                    <td>${localTime}</td>
                    <td>${alert.workerId}</td>
                    <td><span class="new badge ${alert.status === 'red' ? 'red' : 'orange'}" data-badge-caption="${alert.status.toUpperCase()}"></span></td>
                    <td>${alert.reason}</td>
                    <td><a href="https://maps.google.com/?q=${alert.latitude},${alert.longitude}" target="_blank">${alert.latitude.toFixed(4)}, ${alert.longitude.toFixed(4)}</a></td>
                </tr>`;
                tbody.innerHTML += row;
            });
            
            document.getElementById('alert-count').innerText = alertData.length;
        }
    } catch (e) { console.error("Failed to fetch alerts", e); }
}

function downloadCSV() {
    if (alertData.length === 0) {
        M.toast({html: 'No alerts to download!'});
        return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Worker ID,Status,Reason,Latitude,Longitude,SpO2,HR,Body Temp,Env Temp,Gas\n";
    
    alertData.forEach(function(alert) {
        let localTime = new Date(alert.timestamp + 'Z').toLocaleString();
        let row = [
            `"${localTime}"`,
            alert.workerId,
            alert.status,
            `"${alert.reason}"`,
            alert.latitude,
            alert.longitude,
            alert.spo2,
            alert.heartRate,
            alert.temp,
            alert.envTemp,
            alert.gas
        ].join(",");
        csvContent += row + "\n";
    });
    
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "alert_history_mysql.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.fixed-action-btn');
    M.FloatingActionButton.init(elems, {});
    
    var modals = document.querySelectorAll('.modal');
    M.Modal.init(modals, {
        onOpenStart: function(modal, trigger) {
            if (modal.id === 'alerts-modal') {
                fetchAlerts();
            }
        }
    });
    
    fetchAlerts();
    loadSettings();
    initMap();
    renderDashboard();
    setInterval(renderDashboard, 3000);

    // Instant 0ms Firebase Realtime Sync
    const firebaseConfig = {
        apiKey: "AIzaSyDBtdNRaMjA215gENN7cOOnY_q1oXGVNv8",
        databaseURL: "https://helmet-ee4de-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "helmet-ee4de",
        storageBucket: "helmet-ee4de.firebasestorage.app"
    };

    if (typeof firebase !== 'undefined') {
        try {
            firebase.initializeApp(firebaseConfig);
            const dbRef = firebase.database().ref('workers');
            dbRef.on('value', (snapshot) => {
                const val = snapshot.val();
                if (val) {
                    Object.keys(val).forEach(key => {
                        const worker = { id: key, ...val[key] };
                        if (!worker.name || worker.name.startsWith("Worker WRK")) {
                            worker.name = "Alex Johnson";
                        }
                        
                        if (worker.timestamp) {
                            worker.secondsSinceUpdate = (Date.now() - worker.timestamp) / 1000;
                            if (worker.secondsSinceUpdate > 10) worker.status = "offline";
                        }
                        
                        updateCardDOM(worker);
                        if (worker.lat && worker.lng) {
                            updateMapMarker(worker.id, worker.name || worker.id, worker.lat, worker.lng, worker.status || 'green');
                        }
                    });
                }
            });
        } catch (e) { console.error("Firebase web init error:", e); }
    }
});
