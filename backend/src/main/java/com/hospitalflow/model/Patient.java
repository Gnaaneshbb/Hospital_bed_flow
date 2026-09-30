package com.hospitalflow.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    @Id
    private String id;
    private String patientCode;
    private int age;
    private String gender;
    private String severity; // CRITICAL, HIGH, MODERATE, LOW
    private String vitalsStatus; // STABLE, UNSTABLE, GUARDED
    private String requiredCareLevel; // ICU, MONITORED_WARD, WARD, ER_OBSERVATION
    private boolean physicianClearance;
    private String status; // ER_WAITING, ADMITTED_ICU, ADMITTED_WARD, TRANSFER_PENDING, DISCHARGE_PENDING, DISCHARGED
    private String assignedBedId;
    private LocalDateTime arrivalTime = LocalDateTime.now();
}
