package com.hospitalflow.service;

import com.hospitalflow.model.*;
import com.hospitalflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class HospitalStateService {

    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private BedRepository bedRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private CleaningTaskRepository cleaningTaskRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private RecommendationRepository recommendationRepository;
    @Autowired
    private ApprovalRequestRepository approvalRequestRepository;
    @Autowired
    private org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @PostConstruct
    public void initDemoDataIfEmpty() {
        if (departmentRepository.count() == 0) {
            seedInitialData();
        }
    }

    public void seedInitialData() {
        departmentRepository.save(new Department("DEPT-ER", "ER", "Emergency Department", 10, 8));
        departmentRepository.save(new Department("DEPT-ICU", "ICU", "Intensive Care Unit", 10, 10));
        departmentRepository.save(new Department("DEPT-WARD-A", "WARD_A", "General Ward A", 10, 6));
        departmentRepository.save(new Department("DEPT-WARD-B", "WARD_B", "General Ward B", 10, 6));
        departmentRepository.save(new Department("DEPT-OR", "OR", "Operating Room", 4, 4));

        // Create Beds
        for (int i = 1; i <= 10; i++) {
            String bedNo = String.format("ICU-%02d", i);
            String status = (i <= 9) ? "OCCUPIED" : "AVAILABLE";
            String patId = (i <= 9) ? String.format("PAT-P%03d", i) : null;
            bedRepository.save(new Bed("BED-" + bedNo, bedNo, "ICU", "ICU", status, patId, 0));
        }

        for (int i = 1; i <= 10; i++) {
            String bedNo = String.format("WARD-%02d", i);
            String dept = (i <= 5) ? "WARD_A" : "WARD_B";
            String status = (i == 4 || i == 5 || i == 9) ? "AVAILABLE" : ((i == 6 || i == 10) ? "CLEANING" : "OCCUPIED");
            String patId = (status.equals("OCCUPIED")) ? String.format("PAT-P%03d", 100 + i) : null;
            bedRepository.save(new Bed("BED-" + bedNo, bedNo, dept, "WARD", status, patId, (status.equals("CLEANING") ? 15 : 0)));
        }

        for (int i = 1; i <= 4; i++) {
            String bedNo = String.format("ER-%02d", i);
            String status = (i <= 2) ? "OCCUPIED" : "AVAILABLE";
            String patId = (i <= 2) ? String.format("PAT-P%03d", 114 + i) : null;
            bedRepository.save(new Bed("BED-" + bedNo, bedNo, "ER", "ER", status, patId, 0));
        }

        // Create Initial Patients
        patientRepository.save(new Patient("PAT-P001", "P101", 68, "M", "HIGH", "GUARDED", "ICU", false, "ADMITTED_ICU", "BED-ICU-01", LocalDateTime.now()));
        patientRepository.save(new Patient("PAT-P002", "P102", 72, "F", "CRITICAL", "UNSTABLE", "ICU", false, "ADMITTED_ICU", "BED-ICU-02", LocalDateTime.now()));
        patientRepository.save(new Patient("PAT-P003", "P103", 54, "M", "MODERATE", "STABLE", "ICU", true, "ADMITTED_ICU", "BED-ICU-03", LocalDateTime.now()));
        patientRepository.save(new Patient("PAT-P004", "P104", 81, "F", "CRITICAL", "UNSTABLE", "ICU", false, "ADMITTED_ICU", "BED-ICU-04", LocalDateTime.now()));
        patientRepository.save(new Patient("PAT-P005", "P105", 49, "M", "HIGH", "STABLE", "ICU", false, "ADMITTED_ICU", "BED-ICU-05", LocalDateTime.now()));

        patientRepository.save(new Patient("PAT-P101", "P110", 38, "F", "LOW", "STABLE", "WARD", true, "ADMITTED_WARD", "BED-WARD-01", LocalDateTime.now()));
        patientRepository.save(new Patient("PAT-P102", "P111", 45, "M", "MODERATE", "STABLE", "WARD", false, "ADMITTED_WARD", "BED-WARD-02", LocalDateTime.now()));

        // Create Staff
        staffRepository.save(new Staff("STF-D01", "DOC-D01", "Dr. Sarah Jenkins", "DOCTOR", "ICU", "DAY", "ON_DUTY", 78));
        staffRepository.save(new Staff("STF-D02", "DOC-D02", "Dr. Marcus Vance", "DOCTOR", "ER", "DAY", "ON_DUTY", 92));
        staffRepository.save(new Staff("STF-N01", "NURSE-N10", "Elena Rostova, RN", "NURSE", "ER", "DAY", "OVERLOADED", 94));
        staffRepository.save(new Staff("STF-N02", "NURSE-N17", "Samantha Blake, RN", "NURSE", "WARD_A", "DAY", "AVAILABLE", 45));

        // Create Cleaning Task
        cleaningTaskRepository.save(new CleaningTask("CLN-01", "BED-WARD-06", "STF-C01", "IN_PROGRESS", 15, LocalDateTime.now(), null));

        auditLogRepository.save(new AuditLog(UUID.randomUUID().toString(), LocalDateTime.now(), "System", "INITIALIZATION", "System Boot", "SUCCESS", "Initial seed state populated successfully"));
    }

    public List<Map<String, Object>> buildActiveCandidateActions() {
        List<Map<String, Object>> actions = new ArrayList<>();
        List<Bed> allBeds = bedRepository.findAll();
        Map<String, Bed> bedsByNumber = new HashMap<>();
        Map<String, Bed> bedsById = new HashMap<>();
        List<String> availableWardBeds = new ArrayList<>();
        List<String> availableIcuBeds = new ArrayList<>();

        for (Bed b : allBeds) {
            bedsByNumber.put(b.getBedNumber(), b);
            bedsById.put(b.getId(), b);
            if ("AVAILABLE".equalsIgnoreCase(b.getStatus())) {
                if ("ICU".equalsIgnoreCase(b.getBedType())) {
                    availableIcuBeds.add(b.getBedNumber());
                } else if ("WARD".equalsIgnoreCase(b.getBedType())) {
                    availableWardBeds.add(b.getBedNumber());
                }
            }
        }

        for (Recommendation r : recommendationRepository.findAll()) {
            if ("EXECUTED".equalsIgnoreCase(r.getStatus()) || "APPROVED".equalsIgnoreCase(r.getStatus())) {
                continue;
            }
            Optional<ApprovalRequest> rReq = approvalRequestRepository.findByRecommendationId(r.getId())
                .or(() -> approvalRequestRepository.findById("REQ-" + r.getId()));

            Map<String, Object> actMap = new HashMap<>();
            actMap.put("action_id", r.getId());
            actMap.put("action_type", r.getActionType());
            actMap.put("target_entity_id", r.getTargetEntityId());
            actMap.put("target_entity_code", r.getTargetEntityCode());
            actMap.put("target_location", r.getTargetLocation());
            actMap.put("reason", r.getReason());
            actMap.put("expected_benefit", r.getExpectedBenefit());
            actMap.put("risk_level", r.getRiskLevel());
            actMap.put("status", r.getStatus());
            actMap.put("requires_human_approval", rReq.map(req -> !"APPROVED".equals(req.getStatus()) && !"REJECTED".equals(req.getStatus())).orElse(true));
            actMap.put("approval_role", rReq.map(ApprovalRequest::getRequiredRole).orElse("DOCTOR"));

            String targetLoc = r.getTargetLocation();
            if (targetLoc != null && ("TRANSFER_PATIENT".equalsIgnoreCase(r.getActionType()) || "RESERVE_BED".equalsIgnoreCase(r.getActionType()))) {
                Bed targetBed = bedsByNumber.get(targetLoc);
                if (targetBed == null) {
                    targetBed = bedsById.get(targetLoc);
                }

                if (targetBed != null) {
                    actMap.put("target_bed_status", targetBed.getStatus());
                    actMap.put("target_bed_occupant", targetBed.getCurrentPatientId());
                    boolean isVacant = "AVAILABLE".equalsIgnoreCase(targetBed.getStatus());
                    actMap.put("target_bed_valid", isVacant);

                    if (!isVacant) {
                        String conflictMsg = "Target Bed " + targetBed.getBedNumber() + " is currently " + targetBed.getStatus();
                        if (targetBed.getCurrentPatientId() != null) {
                            conflictMsg += " (Occupied by " + targetBed.getCurrentPatientId() + ")";
                        }
                        conflictMsg += ". Direct transfer blocked until resolved or alternate bed selected.";
                        actMap.put("target_bed_conflict_reason", conflictMsg);
                    }
                } else {
                    actMap.put("target_bed_status", "UNKNOWN");
                    actMap.put("target_bed_valid", false);
                    actMap.put("target_bed_conflict_reason", "Target Bed " + targetLoc + " does not exist in inventory.");
                }

                if ("ICU".equalsIgnoreCase(r.getTargetLocation()) || (targetBed != null && "ICU".equalsIgnoreCase(targetBed.getBedType()))) {
                    actMap.put("available_alternative_beds", availableIcuBeds);
                } else {
                    actMap.put("available_alternative_beds", availableWardBeds);
                }
            }

            actions.add(actMap);
        }
        return actions;
    }

    public Map<String, Object> updateBedStatus(String bedId, String status, String patientId, Integer estimatedAvailableMins) {
        Bed bed = bedRepository.findById(bedId)
            .or(() -> bedRepository.findByBedNumber(bedId))
            .orElseThrow(() -> new IllegalArgumentException("Bed not found: " + bedId));

        String oldStatus = bed.getStatus();
        String oldPatientId = bed.getCurrentPatientId();

        if ("AVAILABLE".equalsIgnoreCase(status)) {
            if (oldPatientId != null) {
                Patient p = patientRepository.findById(oldPatientId).orElse(null);
                if (p != null) {
                    p.setAssignedBedId(null);
                    p.setStatus("DISCHARGE_READY");
                    patientRepository.save(p);
                }
            }
            bed.setCurrentPatientId(null);
            bed.setEstimatedAvailableMins(0);
            bed.setStatus("AVAILABLE");
        } else if ("OCCUPIED".equalsIgnoreCase(status)) {
            if (patientId != null && !patientId.trim().isEmpty()) {
                Patient p = patientRepository.findById(patientId)
                    .or(() -> patientRepository.findByPatientCode(patientId))
                    .orElse(null);
                if (p != null) {
                    if (p.getAssignedBedId() != null && !p.getAssignedBedId().equals(bed.getId())) {
                        Bed oldBed = bedRepository.findById(p.getAssignedBedId())
                            .or(() -> bedRepository.findByBedNumber(p.getAssignedBedId()))
                            .orElse(null);
                        if (oldBed != null && !oldBed.getId().equals(bed.getId())) {
                            oldBed.setStatus("AVAILABLE");
                            oldBed.setCurrentPatientId(null);
                            bedRepository.save(oldBed);
                        }
                    }
                    p.setAssignedBedId(bed.getId());
                    p.setStatus("ICU".equalsIgnoreCase(bed.getBedType()) ? "ADMITTED_ICU" : "ADMITTED_WARD");
                    patientRepository.save(p);
                    bed.setCurrentPatientId(p.getId());
                } else {
                    bed.setCurrentPatientId(patientId);
                }
            }
            bed.setEstimatedAvailableMins(0);
            bed.setStatus("OCCUPIED");
        } else if ("CLEANING".equalsIgnoreCase(status)) {
            if (oldPatientId != null) {
                Patient p = patientRepository.findById(oldPatientId).orElse(null);
                if (p != null) {
                    p.setAssignedBedId(null);
                    patientRepository.save(p);
                }
            }
            bed.setCurrentPatientId(null);
            bed.setEstimatedAvailableMins(estimatedAvailableMins != null ? estimatedAvailableMins : 15);
            bed.setStatus("CLEANING");
        } else {
            bed.setStatus(status);
        }

        bedRepository.save(bed);

        auditLogRepository.save(new AuditLog(
            UUID.randomUUID().toString(), LocalDateTime.now(),
            "Manual Override", "BED_STATUS_UPDATE", bed.getBedNumber(),
            "SUCCESS", "Bed " + bed.getBedNumber() + " transitioned from " + oldStatus + " to " + status +
                       (patientId != null ? " (Occupant: " + patientId + ")" : "")
        ));

        Map<String, Object> state = getFullHospitalState();
        broadcastHospitalStateUpdate(state);
        return state;
    }

    public Map<String, Object> createPatient(Patient patient) {
        if (patient.getId() == null || patient.getId().trim().isEmpty()) {
            patient.setId("PAT-" + (patient.getPatientCode() != null ? patient.getPatientCode() : UUID.randomUUID().toString().substring(0, 6).toUpperCase()));
        }
        if (patient.getArrivalTime() == null) {
            patient.setArrivalTime(LocalDateTime.now());
        }

        if (patient.getAssignedBedId() != null && !patient.getAssignedBedId().trim().isEmpty()) {
            Bed bed = bedRepository.findById(patient.getAssignedBedId())
                .or(() -> bedRepository.findByBedNumber(patient.getAssignedBedId()))
                .orElse(null);
            if (bed != null) {
                bed.setStatus("OCCUPIED");
                bed.setCurrentPatientId(patient.getId());
                bedRepository.save(bed);
                patient.setAssignedBedId(bed.getId());
                patient.setStatus("ICU".equalsIgnoreCase(bed.getBedType()) ? "ADMITTED_ICU" : "ADMITTED_WARD");
            }
        }

        patientRepository.save(patient);

        auditLogRepository.save(new AuditLog(
            UUID.randomUUID().toString(), LocalDateTime.now(),
            "Clinical Staff", "MANUAL_PATIENT_ADMISSION", patient.getPatientCode(),
            "SUCCESS", "Admitted patient " + patient.getPatientCode() + " (" + patient.getSeverity() + ", " + patient.getVitalsStatus() + ")" +
                       (patient.getAssignedBedId() != null ? " to bed " + patient.getAssignedBedId() : " in ER Queue")
        ));

        Map<String, Object> state = getFullHospitalState();
        broadcastHospitalStateUpdate(state);
        return state;
    }

    public Map<String, Object> updatePatient(String patientId, Patient update) {
        Patient patient = patientRepository.findById(patientId)
            .or(() -> patientRepository.findByPatientCode(patientId))
            .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));

        if (update.getPatientCode() != null) patient.setPatientCode(update.getPatientCode());
        if (update.getAge() > 0) patient.setAge(update.getAge());
        if (update.getGender() != null) patient.setGender(update.getGender());
        if (update.getSeverity() != null) patient.setSeverity(update.getSeverity());
        if (update.getVitalsStatus() != null) patient.setVitalsStatus(update.getVitalsStatus());
        if (update.getRequiredCareLevel() != null) patient.setRequiredCareLevel(update.getRequiredCareLevel());
        patient.setPhysicianClearance(update.isPhysicianClearance());
        if (update.getStatus() != null) patient.setStatus(update.getStatus());

        String newBedId = update.getAssignedBedId();
        if (newBedId != null && !newBedId.equals(patient.getAssignedBedId())) {
            // Free previous bed
            if (patient.getAssignedBedId() != null) {
                Bed oldBed = bedRepository.findById(patient.getAssignedBedId())
                    .or(() -> bedRepository.findByBedNumber(patient.getAssignedBedId()))
                    .orElse(null);
                if (oldBed != null) {
                    oldBed.setStatus("AVAILABLE");
                    oldBed.setCurrentPatientId(null);
                    bedRepository.save(oldBed);
                }
            }

            // Assign new bed
            Bed newBed = bedRepository.findById(newBedId)
                .or(() -> bedRepository.findByBedNumber(newBedId))
                .orElse(null);
            if (newBed != null) {
                newBed.setStatus("OCCUPIED");
                newBed.setCurrentPatientId(patient.getId());
                bedRepository.save(newBed);
                patient.setAssignedBedId(newBed.getId());
                patient.setStatus("ICU".equalsIgnoreCase(newBed.getBedType()) ? "ADMITTED_ICU" : "ADMITTED_WARD");
            }
        }

        patientRepository.save(patient);

        auditLogRepository.save(new AuditLog(
            UUID.randomUUID().toString(), LocalDateTime.now(),
            "Clinical Staff", "PATIENT_UPDATE", patient.getPatientCode(),
            "SUCCESS", "Updated patient " + patient.getPatientCode() + " vitals=" + patient.getVitalsStatus() +
                       ", clearance=" + patient.isPhysicianClearance() + ", status=" + patient.getStatus()
        ));

        Map<String, Object> state = getFullHospitalState();
        broadcastHospitalStateUpdate(state);
        return state;
    }

    public Map<String, Object> deletePatient(String patientId) {
        Patient patient = patientRepository.findById(patientId)
            .or(() -> patientRepository.findByPatientCode(patientId))
            .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));

        if (patient.getAssignedBedId() != null) {
            Bed bed = bedRepository.findById(patient.getAssignedBedId())
                .or(() -> bedRepository.findByBedNumber(patient.getAssignedBedId()))
                .orElse(null);
            if (bed != null) {
                bed.setStatus("CLEANING");
                bed.setCurrentPatientId(null);
                bed.setEstimatedAvailableMins(15);
                bedRepository.save(bed);
            }
        }

        patientRepository.delete(patient);

        auditLogRepository.save(new AuditLog(
            UUID.randomUUID().toString(), LocalDateTime.now(),
            "Clinical Staff", "PATIENT_DISCHARGE", patient.getPatientCode(),
            "SUCCESS", "Discharged and removed patient " + patient.getPatientCode() + " from hospital roster."
        ));

        Map<String, Object> state = getFullHospitalState();
        broadcastHospitalStateUpdate(state);
        return state;
    }

    public Map<String, Object> resetHospitalState() {
        patientRepository.deleteAll();
        bedRepository.deleteAll();
        departmentRepository.deleteAll();
        staffRepository.deleteAll();
        cleaningTaskRepository.deleteAll();
        recommendationRepository.deleteAll();
        approvalRequestRepository.deleteAll();
        auditLogRepository.deleteAll();

        seedInitialData();

        auditLogRepository.save(new AuditLog(
            UUID.randomUUID().toString(), LocalDateTime.now(),
            "Administrator", "STATE_RESET", "ALL",
            "SUCCESS", "All hospital beds, patients, and queues reset to initial baseline demo state."
        ));

        Map<String, Object> state = getFullHospitalState();
        broadcastHospitalStateUpdate(state);
        return state;
    }

    public void broadcastHospitalStateUpdate(Map<String, Object> payload) {
        try {
            if (messagingTemplate != null) {
                messagingTemplate.convertAndSend("/topic/hospital-state", payload);
            }
        } catch (Exception e) {
            System.err.println("[WebSocket] Broadcast error: " + e.getMessage());
        }
    }

    public Map<String, Object> getFullHospitalState() {
        Map<String, Object> state = new HashMap<>();
        state.put("departments", departmentRepository.findAll());
        state.put("beds", bedRepository.findAll());
        state.put("patients", patientRepository.findAll());
        state.put("staff", staffRepository.findAll());
        state.put("cleaning_tasks", cleaningTaskRepository.findAll());
        state.put("audit_logs", auditLogRepository.findAllByOrderByTimestampDesc());
        state.put("candidate_actions", buildActiveCandidateActions());
        return state;
    }
}
