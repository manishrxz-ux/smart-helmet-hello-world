package com.example.helloworld;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
public class TelemetryController {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @Autowired
    private ThresholdSettingsRepository settingsRepository;

    @PostMapping("/api/telemetry")
    public ResponseEntity<?> receiveTelemetry(@RequestBody SensorData data) {
        if (data.getWorkerId() == null) {
            return ResponseEntity.badRequest().body("Missing worker_id");
        }

        // Fetch live thresholds from DB
        ThresholdSettings settings = settingsRepository.findById(1L).orElse(new ThresholdSettings());

        // Determine status
        String status = "green";
        boolean ignoreHrSpo2 = (data.getHeartRate() == 0 && data.getSpo2() == 0);

        // Check Temp & Gas
        if (data.getTemp() > settings.getMaxTemp() || data.getGas() > settings.getMaxGas()) {
            status = "red";
        }

        // Check Heart Rate & SpO2 only if they are not reading 0
        if (!ignoreHrSpo2) {
            if (data.getHeartRate() > settings.getMaxHr() || data.getHeartRate() < settings.getMinHr() || data.getSpo2() < settings.getMinSpo2()) {
                status = "red";
            }
        }

        // Save sensor data
        sensorDataRepository.save(data);

        // Update or create worker status
        Worker worker = workerRepository.findById(data.getWorkerId()).orElse(new Worker(data.getWorkerId(), "Worker " + data.getWorkerId(), "green"));
        worker.setStatus(status);
        workerRepository.save(worker);

        return ResponseEntity.ok("{\"success\":true, \"status\":\"" + status + "\"}");
    }
}
