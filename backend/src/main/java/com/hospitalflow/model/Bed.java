package com.hospitalflow.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "beds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bed {
    @Id
    private String id;
    private String bedNumber;
    private String departmentCode; // ER, ICU, WARD_A, WARD_B
    private String bedType; // ICU, WARD, ER
    private String status; // AVAILABLE, OCCUPIED, CLEANING, RESERVED, MAINTENANCE
    private String currentPatientId;
    private int estimatedAvailableMins;
}
