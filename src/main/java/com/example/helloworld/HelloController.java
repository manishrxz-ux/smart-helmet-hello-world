package com.example.helloworld;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

    @GetMapping("/workers")
    public List<Map<String, Object>> getWorkers() {
        // Mock data to feed the UI until MySQL is connected
        return List.of(
            Map.of("id", "WRK-001", "name", "Alex Johnson", "status", "green", "heartRate", 75, "spo2", 98, "temp", 36.5, "gas", 0.01),
            Map.of("id", "WRK-002", "name", "Sarah Smith", "status", "yellow", "heartRate", 110, "spo2", 96, "temp", 37.8, "gas", 0.05),
            Map.of("id", "WRK-003", "name", "Michael Davis", "status", "red", "heartRate", 145, "spo2", 91, "temp", 39.2, "gas", 0.1)
        );
    }
}
