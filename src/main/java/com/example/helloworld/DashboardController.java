package com.example.helloworld;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
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
        
        for (Worker w : workers) {
            WorkerDataDTO dto = new WorkerDataDTO();
            dto.id = w.getId();
            dto.name = w.getName();
            dto.status = w.getStatus();
            
            SensorData data = sensorDataRepository.findFirstByWorkerIdOrderByTimestampDesc(w.getId());
            if (data != null) {
                dto.hr = data.getHeartRate();
                dto.spo2 = data.getSpo2();
                dto.temp = data.getTemp();
                dto.gas = data.getGas();
                dto.timestamp = data.getTimestamp();
            } else {
                dto.hr = 0; dto.spo2 = 0; dto.temp = 0.0f; dto.gas = 0.0f;
            }
            result.add(dto);
        }
        return result;
    }
}
