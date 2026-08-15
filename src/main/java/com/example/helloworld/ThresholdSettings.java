package com.example.helloworld;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "threshold_settings")
public class ThresholdSettings {

    @Id
    private Long id = 1L;

    private float maxTemp = 38.0f;
    private float maxEnvTemp = 45.0f;
    private float maxGas = 700.0f;
    private int minSpo2 = 90;
    private int maxHr = 120;
    private int minHr = 50;
    private boolean checkHrSpo2 = true;

    public ThresholdSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public float getMaxTemp() { return maxTemp; }
    public void setMaxTemp(float maxTemp) { this.maxTemp = maxTemp; }

    public float getMaxEnvTemp() { return maxEnvTemp; }
    public void setMaxEnvTemp(float maxEnvTemp) { this.maxEnvTemp = maxEnvTemp; }

    public float getMaxGas() { return maxGas; }
    public void setMaxGas(float maxGas) { this.maxGas = maxGas; }

    public int getMinSpo2() { return minSpo2; }
    public void setMinSpo2(int minSpo2) { this.minSpo2 = minSpo2; }

    public int getMaxHr() { return maxHr; }
    public void setMaxHr(int maxHr) { this.maxHr = maxHr; }

    public int getMinHr() { return minHr; }
    public void setMinHr(int minHr) { this.minHr = minHr; }

    public boolean isCheckHrSpo2() { return checkHrSpo2; }
    public void setCheckHrSpo2(boolean checkHrSpo2) { this.checkHrSpo2 = checkHrSpo2; }
}
