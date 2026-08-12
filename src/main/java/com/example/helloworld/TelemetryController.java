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

        // Determine status and reason
        String status = "green";
        StringBuilder reason = new StringBuilder();
        boolean ignoreHrSpo2 = (data.getHeartRate() == 0 && data.getSpo2() == 0);

        // Check Temp & Gas
        if (data.getTemp() > settings.getMaxTemp() || data.getEnvTemp() > settings.getMaxEnvTemp() || data.getGas() > settings.getMaxGas()) {
            status = "red";
            if (data.getTemp() > settings.getMaxTemp()) reason.append("Body Temp High. ");
            if (data.getEnvTemp() > settings.getMaxEnvTemp()) reason.append("Env Temp High. ");
            if (data.getGas() > settings.getMaxGas()) reason.append("Toxic Gas High. ");
        } else if (data.getTemp() > settings.getMaxTemp() * 0.95 || data.getEnvTemp() > settings.getMaxEnvTemp() * 0.95 || data.getGas() > settings.getMaxGas() * 0.8) {
            status = "yellow";
            reason.append("Warning (Temp/Gas). ");
        }

        // Check Heart Rate & SpO2 only if they are enabled and not reading 0
        if (settings.isCheckHrSpo2() && !ignoreHrSpo2) {
            if (data.getHeartRate() > settings.getMaxHr() || data.getHeartRate() < settings.getMinHr() || data.getSpo2() < settings.getMinSpo2()) {
                status = "red";
                if (data.getHeartRate() > settings.getMaxHr()) reason.append("HR High. ");
                if (data.getHeartRate() < settings.getMinHr()) reason.append("HR Low. ");
                if (data.getSpo2() < settings.getMinSpo2()) reason.append("SpO2 Low. ");
            } else if (data.getHeartRate() > settings.getMaxHr() * 0.9 || data.getSpo2() < settings.getMinSpo2() + 2) {
                if (!status.equals("red")) {
                    status = "yellow";
                    reason.append("Warning (Medical). ");
                }
            }
        }
        
        if (reason.length() == 0) {
            reason.append("Normal");
        }
        
        data.setStatus(status);
        data.setReason(reason.toString().trim());

        // Save sensor data
        sensorDataRepository.save(data);

        // Update or create worker status
        Worker worker = workerRepository.findById(data.getWorkerId()).orElse(new Worker(data.getWorkerId(), "Worker " + data.getWorkerId(), "green"));
        worker.setStatus(status);
        workerRepository.save(worker);

        return ResponseEntity.ok("{\"success\":true, \"status\":\"" + status + "\"}");
    }
}
