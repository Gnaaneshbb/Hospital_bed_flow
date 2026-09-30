package com.hospitalflow.controller;

import com.hospitalflow.model.*;
import com.hospitalflow.repository.*;
import com.hospitalflow.service.HospitalStateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hospital")
@CrossOrigin(origins = "*")
public class HospitalStateController {

    @Autowired
    private HospitalStateService stateService;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private BedRepository bedRepository;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping("/state")
    public ResponseEntity<Map<String, Object>> getHospitalState() {
        return ResponseEntity.ok(stateService.getFullHospitalState());
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getPatients() {
        return ResponseEntity.ok(patientRepository.findAll());
    }

    @GetMapping("/beds")
    public ResponseEntity<List<Bed>> getBeds() {
        return ResponseEntity.ok(bedRepository.findAll());
    }

    @GetMapping("/staff")
    public ResponseEntity<List<Staff>> getStaff() {
        return ResponseEntity.ok(staffRepository.findAll());
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @PutMapping("/beds/{bedId}/status")
    public ResponseEntity<Map<String, Object>> updateBedStatus(
            @PathVariable String bedId,
            @RequestBody Map<String, Object> body) {
        String status = (String) body.get("status");
        String patientId = (String) body.get("patientId");
        Integer estimatedAvailableMins = body.get("estimatedAvailableMins") != null ? ((Number) body.get("estimatedAvailableMins")).intValue() : null;
        return ResponseEntity.ok(stateService.updateBedStatus(bedId, status, patientId, estimatedAvailableMins));
    }

    @PostMapping("/patients")
    public ResponseEntity<Map<String, Object>> createPatient(@RequestBody Patient patient) {
        return ResponseEntity.ok(stateService.createPatient(patient));
    }

    @PutMapping("/patients/{patientId}")
    public ResponseEntity<Map<String, Object>> updatePatient(
            @PathVariable String patientId,
            @RequestBody Patient update) {
        return ResponseEntity.ok(stateService.updatePatient(patientId, update));
    }

    @DeleteMapping("/patients/{patientId}")
    public ResponseEntity<Map<String, Object>> deletePatient(@PathVariable String patientId) {
        return ResponseEntity.ok(stateService.deletePatient(patientId));
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetState() {
        return ResponseEntity.ok(stateService.resetHospitalState());
    }
}
