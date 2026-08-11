package com.example.helloworld;
import org.springframework.data.jpa.repository.JpaRepository;
public interface WorkerRepository extends JpaRepository<Worker, String> {}
