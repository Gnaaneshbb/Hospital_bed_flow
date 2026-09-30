package com.hospitalflow.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Staff {
    @Id
    private String id;
    private String staffCode;
    private String name;
    private String role; // DOCTOR, NURSE, CLEANER
    private String departmentCode;
    private String shift; // DAY, NIGHT
    private String status; // AVAILABLE, ON_DUTY, OVERLOADED, OFF_DUTY
    private int workloadScore;
}
