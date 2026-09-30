package com.hospitalflow.repository;

import com.hospitalflow.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, String> {
    Optional<Patient> findByPatientCode(String patientCode);
    List<Patient> findByStatus(String status);
    List<Patient> findBySeverity(String severity);
}
