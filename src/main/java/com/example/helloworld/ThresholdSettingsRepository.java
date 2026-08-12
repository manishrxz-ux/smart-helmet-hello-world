package com.example.helloworld;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ThresholdSettingsRepository extends JpaRepository<ThresholdSettings, Long> {
}
