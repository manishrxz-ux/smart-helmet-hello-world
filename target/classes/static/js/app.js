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
}

// Initial fetch and set polling
renderDashboard();
setInterval(renderDashboard, 5000);

// Init
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {});
});
