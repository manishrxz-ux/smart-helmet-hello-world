package com.example.helloworld;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    SensorData findFirstByWorkerIdOrderByTimestampDesc(String workerId);
}
