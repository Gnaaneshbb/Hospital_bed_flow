package com.hospitalflow.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "cleaning_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CleaningTask {
    @Id
    private String id;
    private String bedId;
    private String cleanerId;
    private String status; // PENDING, IN_PROGRESS, COMPLETED
    private int estCompletionMins;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
