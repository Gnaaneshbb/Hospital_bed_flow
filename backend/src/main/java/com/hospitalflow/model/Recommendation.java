package com.hospitalflow.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {
    @Id
    private String id;
    private String agentRunId;
    private String actionType; // TRANSFER_PATIENT, RESERVE_BED, REASSIGN_STAFF, FLAG_DISCHARGE, EXPEDITE_CLEANING
    private String targetEntityId;
    private String targetEntityCode;
    private String targetLocation;
    @Column(columnDefinition = "TEXT")
    private String reason;
    @Column(columnDefinition = "TEXT")
    private String expectedBenefit;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String status = "PROPOSED"; // PROPOSED, APPROVED, REJECTED, EXECUTED
}
