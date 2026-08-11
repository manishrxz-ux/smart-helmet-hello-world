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

    @PostMapping("/api/telemetry")
    public ResponseEntity<?> receiveTelemetry(@RequestBody SensorData data) {
        if (data.getWorkerId() == null) {
            return ResponseEntity.badRequest().body("Missing worker_id");
        }

        // Determine status
        String status = "green";
        if (data.getHeartRate() > 120 || data.getTemp() > 38.5 || data.getSpo2() < 92 || data.getGas() > 0.5) {
            status = "red";
        } else if (data.getHeartRate() > 100 || data.getTemp() > 37.5 || data.getSpo2() < 95 || data.getGas() > 0.1) {
            status = "yellow";
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
