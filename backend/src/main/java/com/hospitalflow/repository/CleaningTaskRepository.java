package com.hospitalflow.repository;

import com.hospitalflow.model.CleaningTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CleaningTaskRepository extends JpaRepository<CleaningTask, String> {
    List<CleaningTask> findByStatus(String status);
}
