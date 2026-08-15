package com.example.helloworld;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
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

        ThresholdSettings settings = settingsRepository.findById(1L).orElse(new ThresholdSettings());

        String status = "green";
        StringBuilder reason = new StringBuilder();
        boolean ignoreHrSpo2 = (data.getHeartRate() == 0 && data.getSpo2() == 0);

        if (data.getTemp() > settings.getMaxTemp() || data.getEnvTemp() > settings.getMaxEnvTemp() || data.getGas() > settings.getMaxGas()) {
            status = "red";
            if (data.getTemp() > settings.getMaxTemp()) reason.append("Body Temp High. ");
            if (data.getEnvTemp() > settings.getMaxEnvTemp()) reason.append("Env Temp High. ");
            if (data.getGas() > settings.getMaxGas()) reason.append("Toxic Gas High. ");
        } else if (data.getTemp() > settings.getMaxTemp() * 0.95 || data.getEnvTemp() > settings.getMaxEnvTemp() * 0.95 || data.getGas() > settings.getMaxGas() * 0.8) {
            status = "yellow";
            reason.append("Warning (Temp/Gas). ");
        }

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

        sensorDataRepository.save(data);

        Worker worker = workerRepository.findById(data.getWorkerId()).orElse(new Worker(data.getWorkerId(), "Worker " + data.getWorkerId(), "green"));
        worker.setStatus(status);
        if (data.getLatitude() != 0.0 && data.getLongitude() != 0.0) {
            worker.setLatitude(data.getLatitude());
            worker.setLongitude(data.getLongitude());
        }
        workerRepository.save(worker);

        return ResponseEntity.ok("{\"success\":true, \"status\":\"" + status + "\"}");
    }

    @PostMapping("/api/location/{workerId}")
    public ResponseEntity<?> updateLocation(@PathVariable String workerId, @RequestBody SensorData locationData) {
        Worker worker = workerRepository.findById(workerId).orElse(null);
        if (worker != null) {
            worker.setLatitude(locationData.getLatitude());
            worker.setLongitude(locationData.getLongitude());
            workerRepository.save(worker);
            return ResponseEntity.ok("{\"success\":true}");
        }
        return ResponseEntity.notFound().build();
    }
}
