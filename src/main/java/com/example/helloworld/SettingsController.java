package com.example.helloworld;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private ThresholdSettingsRepository repo;

    @GetMapping
    public ThresholdSettings getSettings() {
        return repo.findById(1L).orElseGet(() -> {
            ThresholdSettings defaults = new ThresholdSettings();
            repo.save(defaults);
            return defaults;
        });
    }

    @PostMapping
    public ThresholdSettings updateSettings(@RequestBody ThresholdSettings newSettings) {
        newSettings.setId(1L); // Force it to update the single row
        return repo.save(newSettings);
    }
}
