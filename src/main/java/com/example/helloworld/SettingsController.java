package com.example.helloworld;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private ThresholdSettingsRepository settingsRepository;

    @GetMapping
    public ThresholdSettings getSettings() {
        return settingsRepository.findById(1L).orElseGet(() -> {
            ThresholdSettings defaults = new ThresholdSettings();
            return settingsRepository.save(defaults);
        });
    }

    @PostMapping
    public ResponseEntity<?> updateSettings(@RequestBody ThresholdSettings newSettings) {
        newSettings.setId(1L);
        ThresholdSettings saved = settingsRepository.save(newSettings);
        return ResponseEntity.ok(saved);
    }
}
