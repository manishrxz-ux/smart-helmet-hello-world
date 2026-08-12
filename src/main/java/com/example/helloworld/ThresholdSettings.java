package com.example.helloworld;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "settings")
public class ThresholdSettings {

    @Id
    private Long id = 1L; // Only one row ever exists

    private float maxTemp = 38.0f; // Default 38C
    private float maxGas = 0.5f;   // Default 0.5 normalized (or PPM)
    private int minSpo2 = 90;      // Default 90%
    private int maxHr = 120;       // Default 120 BPM
    private int minHr = 50;        // Default 50 BPM

    public ThresholdSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public float getMaxTemp() { return maxTemp; }
    public void setMaxTemp(float maxTemp) { this.maxTemp = maxTemp; }
    public float getMaxGas() { return maxGas; }
    public void setMaxGas(float maxGas) { this.maxGas = maxGas; }
    public int getMinSpo2() { return minSpo2; }
    public void setMinSpo2(int minSpo2) { this.minSpo2 = minSpo2; }
    public int getMaxHr() { return maxHr; }
    public void setMaxHr(int maxHr) { this.maxHr = maxHr; }
    public int getMinHr() { return minHr; }
    public void setMinHr(int minHr) { this.minHr = minHr; }
}
