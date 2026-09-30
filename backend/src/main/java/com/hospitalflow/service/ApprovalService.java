package com.hospitalflow.service;

import com.hospitalflow.model.*;
import com.hospitalflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ApprovalService {

    @Autowired
    private RecommendationRepository recommendationRepository;
    @Autowired
    private ApprovalRequestRepository approvalRequestRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private BedRepository bedRepository;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private HospitalStateService hospitalStateService;
    @Autowired
    private AIServiceClient aiServiceClient;
    @Autowired
    private EventSimulatorService eventSimulatorService;

    private ApprovalRequest resolveApprovalRequest(String requestId) {
        // 1. Try finding by direct ID (e.g. REQ-ACT-001)
        Optional<ApprovalRequest> opt = approvalRequestRepository.findById(requestId);
        if (opt.isPresent()) return opt.get();

        // 2. Try finding by recommendationId (e.g. ACT-001 or FALLBACK-ACT-002)
        opt = approvalRequestRepository.findByRecommendationId(requestId);
        if (opt.isPresent()) return opt.get();

        // 3. Try finding by "REQ-" prefix
        opt = approvalRequestRepository.findById("REQ-" + requestId);
        if (opt.isPresent()) return opt.get();

        // 4. Fallback: Check if recommendation exists in database and create the request on-the-fly
        Optional<Recommendation> recOpt = recommendationRepository.findById(requestId);
        if (recOpt.isPresent()) {
            Recommendation r = recOpt.get();
            ApprovalRequest newReq = new ApprovalRequest(
                "REQ-" + r.getId(),
                r.getId(),
                r.getRiskLevel(),
                "DOCTOR",
                "PENDING",
                null,
                LocalDateTime.now()
            );
            return approvalRequestRepository.save(newReq);
        }

        // 5. If not found in recommendations either, create a synthetic recommendation and approval request
        Recommendation syntheticRec = new Recommendation(
            requestId,
            "RUN-MANUAL",
            "MANUAL_ACTION",
            null,
            requestId,
            null,
            "Manual approval trigger",
            "Direct user clinical authorization",
            "MEDIUM",
            "PROPOSED"
        );
        recommendationRepository.save(syntheticRec);

        ApprovalRequest syntheticReq = new ApprovalRequest(
            "REQ-" + requestId,
            requestId,
            "MEDIUM",
            "DOCTOR",
            "PENDING",
            null,
            LocalDateTime.now()
        );
        return approvalRequestRepository.save(syntheticReq);
    }

    public Map<String, Object> approveAction(String requestId, String approvedBy, String role) {
        ApprovalRequest req = resolveApprovalRequest(requestId);

        req.setStatus("APPROVED");
        approvalRequestRepository.save(req);

        Recommendation rec = recommendationRepository.findById(req.getRecommendationId()).orElse(null);
        if (rec != null) {
            rec.setStatus("EXECUTED");
            recommendationRepository.save(rec);
            executeApprovedAction(rec);
        }

        auditLogRepository.save(new AuditLog(
            UUID.randomUUID().toString(), LocalDateTime.now(),
            approvedBy + " (" + role + ")", "HUMAN_APPROVAL", req.getRecommendationId(),
            "APPROVED", "Action executed successfully: " + (rec != null ? rec.getActionType() : requestId)
        ));

        Map<String, Object> updatedState = hospitalStateService.getFullHospitalState();
        updatedState.put("candidate_actions", buildActiveCandidateActions());

        eventSimulatorService.broadcastHospitalStateUpdate(updatedState);
        return updatedState;
    }

    public Map<String, Object> rejectAction(String requestId, String rejectedBy, String role, String reason) {
        ApprovalRequest req = resolveApprovalRequest(requestId);

        req.setStatus("REJECTED");
        req.setRejectionReason(reason);
        approvalRequestRepository.save(req);

        Recommendation rec = recommendationRepository.findById(req.getRecommendationId()).orElse(null);
        if (rec != null) {
            rec.setStatus("REJECTED");
            recommendationRepository.save(rec);
        }

        auditLogRepository.save(new AuditLog(
            UUID.randomUUID().toString(), LocalDateTime.now(),
            rejectedBy + " (" + role + ")", "HUMAN_REJECTION", req.getRecommendationId(),
            "REJECTED", "Reason: " + reason + ". Triggering automatic AI Replanning cycle."
        ));

        // Re-build state payload with rejection feedback and trigger replan loop
        Map<String, Object> fullState = hospitalStateService.getFullHospitalState();
        fullState.put("rejection_reason", reason);
        fullState.put("rejected_action_ids", Collections.singletonList(req.getRecommendationId()));

        Map<String, Object> replanResult = aiServiceClient.replan(fullState);
        eventSimulatorService.saveRecommendationsAndRequests(replanResult);

        // Build fully refreshed state from DB with latest candidate actions & agent findings
        Map<String, Object> stateToReturn = hospitalStateService.getFullHospitalState();
        Object findings = replanResult.get("agent_findings") != null ? replanResult.get("agent_findings") : replanResult.get("agentFindings");
        Object valResults = replanResult.get("validation_results") != null ? replanResult.get("validation_results") : replanResult.get("validationResults");
        Object risk = replanResult.get("risk_level") != null ? replanResult.get("risk_level") : replanResult.getOrDefault("riskLevel", "HIGH");
        Object approval = replanResult.get("approval_status") != null ? replanResult.get("approval_status") : replanResult.getOrDefault("approvalStatus", "WAITING_HUMAN_APPROVAL");

        if (findings != null) stateToReturn.put("agent_findings", findings);
        if (valResults != null) stateToReturn.put("validation_results", valResults);
        if (risk != null) stateToReturn.put("risk_level", risk);
        if (approval != null) stateToReturn.put("approval_status", approval);

        eventSimulatorService.broadcastHospitalStateUpdate(stateToReturn);
        return stateToReturn;
    }

    public Map<String, Object> reassignTargetBed(String requestId, String newTargetBed) {
        ApprovalRequest req = resolveApprovalRequest(requestId);
        Recommendation rec = recommendationRepository.findById(req.getRecommendationId()).orElse(null);
        if (rec != null) {
            String oldBed = rec.getTargetLocation();
            rec.setTargetLocation(newTargetBed);
            if (rec.getReason() != null && oldBed != null) {
                rec.setReason(rec.getReason().replace(oldBed, newTargetBed));
            }
            if (rec.getExpectedBenefit() != null && oldBed != null) {
                rec.setExpectedBenefit(rec.getExpectedBenefit().replace(oldBed, newTargetBed));
            }
            recommendationRepository.save(rec);

            auditLogRepository.save(new AuditLog(
                UUID.randomUUID().toString(), LocalDateTime.now(),
                "Doctor / Admin", "BED_REASSIGNMENT", req.getRecommendationId(),
                "SUCCESS", "Reassigned target destination from " + oldBed + " to " + newTargetBed
            ));
        }

        Map<String, Object> updatedState = hospitalStateService.getFullHospitalState();
        updatedState.put("candidate_actions", buildActiveCandidateActions());
        eventSimulatorService.broadcastHospitalStateUpdate(updatedState);
        return updatedState;
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
                continue; // Do not return completed actions in pending queue
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

            // Dynamic live validation of target bed status
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

                // Provide alternative available beds for immediate reassignment
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

    private void executeApprovedAction(Recommendation rec) {
        String type = rec.getActionType();
        if ("TRANSFER_PATIENT".equalsIgnoreCase(type)) {
            // Find patient by ID or Code
            Patient p = null;
            if (rec.getTargetEntityId() != null) {
                p = patientRepository.findById(rec.getTargetEntityId()).orElse(null);
            }
            if (p == null && rec.getTargetEntityCode() != null) {
                p = patientRepository.findByPatientCode(rec.getTargetEntityCode()).orElse(null);
            }

            // Find destination Bed by BedNumber or ID
            Bed b = null;
            if (rec.getTargetLocation() != null) {
                b = bedRepository.findByBedNumber(rec.getTargetLocation()).orElse(null);
                if (b == null) {
                    b = bedRepository.findById(rec.getTargetLocation()).orElse(null);
                }
            }

            if (p != null && b != null) {
                if (!"AVAILABLE".equalsIgnoreCase(b.getStatus()) && !p.getId().equals(b.getCurrentPatientId())) {
                    throw new IllegalStateException("Destination bed " + b.getBedNumber() + " is currently " + b.getStatus() + ". Cannot transfer patient into an occupied or cleaning bed.");
                }

                // Clear old bed and mark for turnaround sanitization
                final String oldBedId = p.getAssignedBedId();
                if (oldBedId != null) {
                    Bed oldBed = bedRepository.findById(oldBedId)
                        .or(() -> bedRepository.findByBedNumber(oldBedId))
                        .orElse(null);
                    if (oldBed != null && !oldBed.getId().equals(b.getId())) {
                        oldBed.setStatus("CLEANING");
                        oldBed.setCurrentPatientId(null);
                        oldBed.setEstimatedAvailableMins(15);
                        bedRepository.save(oldBed);
                    }
                }
                // Assign new bed to patient
                b.setStatus("OCCUPIED");
                b.setCurrentPatientId(p.getId());
                bedRepository.save(b);

                p.setStatus("ICU".equalsIgnoreCase(b.getBedType()) ? "ADMITTED_ICU" : "ADMITTED_WARD");
                p.setAssignedBedId(b.getId());
                patientRepository.save(p);
            }
        } else if ("REASSIGN_STAFF".equalsIgnoreCase(type)) {
            Staff s = null;
            if (rec.getTargetEntityCode() != null) {
                s = staffRepository.findByStaffCode(rec.getTargetEntityCode()).orElse(null);
            }
            if (s == null && rec.getTargetEntityId() != null) {
                s = staffRepository.findById(rec.getTargetEntityId()).orElse(null);
            }
            if (s != null) {
                if (rec.getTargetLocation() != null) {
                    s.setDepartmentCode(rec.getTargetLocation());
                }
                s.setWorkloadScore(70);
                s.setStatus("ON_DUTY");
                staffRepository.save(s);
            }
        } else if ("RESERVE_BED".equalsIgnoreCase(type)) {
            Bed b = null;
            if (rec.getTargetLocation() != null) {
                b = bedRepository.findByBedNumber(rec.getTargetLocation()).orElse(null);
            }
            if (b == null && rec.getTargetEntityCode() != null) {
                b = bedRepository.findByBedNumber(rec.getTargetEntityCode()).orElse(null);
            }
            if (b != null) {
                b.setStatus("RESERVED");
                bedRepository.save(b);
            }
        }
    }
}
