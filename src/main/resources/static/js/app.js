// Mock Data for Render Deployment
let mockWorkers = [
    { id: 'WRK-001', name: 'Manish Kumar', status: 'green', hr: 72, spo2: 98, temp: 36.5, gas: 0.01 },
    { id: 'WRK-002', name: 'Rohan Sharma', status: 'green', hr: 85, spo2: 96, temp: 37.1, gas: 0.02 }
];

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

function renderDashboard() {
    const grid = document.getElementById('workers-grid');
    grid.innerHTML = mockWorkers.map(generateCard).join('');
    
    document.getElementById('active-count').innerText = mockWorkers.length;
    document.getElementById('alert-count').innerText = mockWorkers.filter(w => w.status === 'red').length;
}

// Interactive Mock Feature
function simulateAlert() {
    M.toast({html: 'Simulating Emergency Alert on WRK-001!', classes: 'rounded red'});
    mockWorkers[0].status = 'red';
    mockWorkers[0].hr = 145;
    mockWorkers[0].temp = 39.5;
    renderDashboard();
    
    setTimeout(() => {
        M.toast({html: 'Worker status normalized.', classes: 'rounded green'});
        mockWorkers[0].status = 'green';
        mockWorkers[0].hr = 75;
        mockWorkers[0].temp = 36.6;
        renderDashboard();
    }, 5000);
}

// Init
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize components
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {});
    
    renderDashboard();
});
