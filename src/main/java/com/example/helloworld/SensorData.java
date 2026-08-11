package com.example.helloworld;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "SensorData")
public class SensorData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String workerId;
    private int heartRate;
    private int spo2;
    private float temp;
    private float gas;
    private double latitude;
    private double longitude;
    private LocalDateTime timestamp = LocalDateTime.now();

    public SensorData() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getWorkerId() { return workerId; }
    public void setWorkerId(String workerId) { this.workerId = workerId; }
    public int getHeartRate() { return heartRate; }
    public void setHeartRate(int heartRate) { this.heartRate = heartRate; }
    public int getSpo2() { return spo2; }
    public void setSpo2(int spo2) { this.spo2 = spo2; }
    public float getTemp() { return temp; }
    public void setTemp(float temp) { this.temp = temp; }
    public float getGas() { return gas; }
    public void setGas(float gas) { this.gas = gas; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
