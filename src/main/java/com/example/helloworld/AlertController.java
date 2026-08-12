package com.example.helloworld;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @GetMapping
    public List<SensorData> getAlertHistory() {
        // Return latest 500 alerts that are red or yellow
        return sensorDataRepository.findTop500ByStatusInOrderByTimestampDesc(Arrays.asList("red", "yellow"));
    }
}
