package com.hospitalflow.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalRequest {
    @Id
    private String id;
    private String recommendationId;
    private String riskLevel;
    private String requiredRole; // DOCTOR, NURSE_MANAGER, HOSPITAL_MANAGER
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED
    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    private LocalDateTime createdAt = LocalDateTime.now();
}
