package com.example.helloworld;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    SensorData findFirstByWorkerIdOrderByTimestampDesc(String workerId);
    List<SensorData> findTop50ByStatusInOrderByTimestampDesc(List<String> statuses);
}
