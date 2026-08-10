// Smart Helmet 2027 - Frontend Dashboard Logic

// Simulated API Call to our future Cloudflare backend
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

function createWorkerCard(worker) {
    // Determine specific metric classes based on thresholds
    const hrClass = worker.heartRate > 120 ? 'critical' : (worker.heartRate > 100 ? 'warning' : '');
    const tempClass = worker.temp > 38.5 ? 'critical' : (worker.temp > 37.5 ? 'warning' : '');
    const spo2Class = worker.spo2 < 92 ? 'critical' : (worker.spo2 < 95 ? 'warning' : '');
    const gasClass = worker.gas > 0.5 ? 'critical' : (worker.gas > 0.1 ? 'warning' : '');

    return `
        <div class="worker-card status-${worker.status}" id="${worker.id}">
            <div class="card-header">
                <div>
                    <h2 class="worker-name">${worker.name}</h2>
                    <span class="worker-id">${worker.id}</span>
                </div>
                <div class="status-indicator">${worker.status.toUpperCase()}</div>
            </div>
            
            <div class="metrics-grid">
                <div class="metric ${hrClass}">
                    <span class="metric-label">Heart Rate</span>
                    <div class="metric-value">${worker.heartRate} <span class="metric-unit">BPM</span></div>
                </div>
                <div class="metric ${tempClass}">
                    <span class="metric-label">Body Temp</span>
                    <div class="metric-value">${worker.temp} <span class="metric-unit">°C</span></div>
                </div>
                <div class="metric ${spo2Class}">
                    <span class="metric-label">Oxygen (SpO2)</span>
                    <div class="metric-value">${worker.spo2} <span class="metric-unit">%</span></div>
                </div>
                <div class="metric ${gasClass}">
                    <span class="metric-label">Toxic Gas</span>
                    <div class="metric-value">${worker.gas} <span class="metric-unit">ppm</span></div>
                </div>
            </div>
        </div>
    `;
}

async function updateDashboard() {
    const workers = await fetchWorkersData();
    const grid = document.getElementById('workers-grid');
    
    // Update Stats
    document.getElementById('active-count').innerText = workers.length;
    const criticalCount = workers.filter(w => w.status === 'red').length;
    document.getElementById('alert-count').innerText = criticalCount;

    // Build Cards
    grid.innerHTML = workers.map(createWorkerCard).join('');
}

// Initial Load
updateDashboard();

// Poll every 5 seconds (simulated real-time)
setInterval(updateDashboard, 5000);
