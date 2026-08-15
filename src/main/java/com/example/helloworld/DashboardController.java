package com.example.helloworld;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.ArrayList;
import java.util.List;

@RestController
public class DashboardController {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @GetMapping("/api/workers")
    public List<WorkerDataDTO> getDashboardData() {
        List<WorkerDataDTO> result = new ArrayList<>();
        List<Worker> workers = workerRepository.findAll();
        
        // Ensure WRK-001 always exists even right after a server restart
        if (workers.isEmpty() || workers.stream().noneMatch(w -> w.getId().equalsIgnoreCase("WRK-001"))) {
            Worker defaultWorker = new Worker("WRK-001", "Alex Johnson", "green");
            workerRepository.save(defaultWorker);
            workers = workerRepository.findAll();
        }

        for (Worker w : workers) {
            // Delete old mock workers (WRK-002, WRK-003, Sarah Smith, Michael Davis)
            if (!w.getId().equalsIgnoreCase("WRK-001")) {
                try { workerRepository.deleteById(w.getId()); } catch (Exception e) {}
                continue;
            }
            WorkerDataDTO dto = new WorkerDataDTO();
            dto.id = w.getId();
            dto.name = w.getName();
            dto.status = w.getStatus();
            
            SensorData data = sensorDataRepository.findFirstByWorkerIdOrderByTimestampDesc(w.getId());
            if (data != null) {
                dto.hr = data.getHeartRate();
                dto.spo2 = data.getSpo2();
                dto.temp = data.getTemp();
                dto.envTemp = data.getEnvTemp();
                dto.gas = data.getGas();
                dto.lat = (w.getLatitude() != null && w.getLatitude() != 0.0) ? w.getLatitude() : data.getLatitude();
                dto.lng = (w.getLongitude() != null && w.getLongitude() != 0.0) ? w.getLongitude() : data.getLongitude();
                dto.timestamp = data.getTimestamp();
                dto.secondsSinceUpdate = java.time.temporal.ChronoUnit.SECONDS.between(data.getTimestamp(), java.time.LocalDateTime.now());
            } else {
                dto.hr = 0; dto.spo2 = 0; dto.temp = 0.0f; dto.gas = 0.0f; 
                dto.lat = (w.getLatitude() != null) ? w.getLatitude() : 0.0; 
                dto.lng = (w.getLongitude() != null) ? w.getLongitude() : 0.0;
            }
            result.add(dto);
        }
        return result;
    }

    @DeleteMapping("/api/workers/{id}")
    public ResponseEntity<?> deleteWorker(@PathVariable String id) {
        if (workerRepository.existsById(id)) {
            workerRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
