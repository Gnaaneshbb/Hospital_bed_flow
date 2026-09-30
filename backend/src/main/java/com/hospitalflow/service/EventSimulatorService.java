package com.hospitalflow.service;

import com.hospitalflow.model.*;
import com.hospitalflow.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class EventSimulatorService {

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private BedRepository bedRepository;
    @Autowired
    private StaffRepository staffRepository;
    @Autowired
    private HospitalEventRepository eventRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private RecommendationRepository recommendationRepository;
    @Autowired
    private ApprovalRequestRepository approvalRequestRepository;
    @Autowired
    private HospitalStateService hospitalStateService;
    @Autowired
    private AIServiceClient aiServiceClient;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Map<String, Object> triggerScenario(String scenarioName) {
        String eventId = UUID.randomUUID().toString();
        HospitalEvent event = new HospitalEvent(eventId, scenarioName, "{\"scenario\":\"" + scenarioName + "\"}", LocalDateTime.now());
        eventRepository.save(event);

        if ("SURGE_12_EMERGENCY".equalsIgnoreCase(scenarioName) || "RUN CRISIS SCENARIO".equalsIgnoreCase(scenarioName)) {
            // Prime stable ICU patient P103 in BED-ICU-03 ready for step-down transfer
            Optional<Patient> p103Opt = patientRepository.findById("PAT-P003").or(() -> patientRepository.findByPatientCode("P103"));
            Patient p103 = p103Opt.orElseGet(() -> new Patient(
                "PAT-P003", "P103", 54, "M", "MODERATE", "STABLE", "ICU", true, "ADMITTED_ICU", "BED-ICU-03", LocalDateTime.now()
            ));
            p103.setStatus("ADMITTED_ICU");
            p103.setAssignedBedId("BED-ICU-03");
            p103.setVitalsStatus("STABLE");
            p103.setPhysicianClearance(true);
            patientRepository.save(p103);

            // Ensure ICU-03 is occupied by P103
            bedRepository.findById("BED-ICU-03").or(() -> bedRepository.findByBedNumber("ICU-03")).ifPresent(bed -> {
                bed.setStatus("OCCUPIED");
                bed.setCurrentPatientId("PAT-P003");
                bedRepository.save(bed);
            });

            // Ensure WARD-04 is AVAILABLE as vacant step-down destination
            bedRepository.findById("BED-WARD-04").or(() -> bedRepository.findByBedNumber("WARD-04")).ifPresent(bed -> {
                bed.setStatus("AVAILABLE");
                bed.setCurrentPatientId(null);
                bedRepository.save(bed);
            });

            // Ensure Float Nurse N17 is AVAILABLE so nurse reassignment is recommended
            staffRepository.findById("STF-N02").or(() -> staffRepository.findByStaffCode("NURSE-N17")).ifPresent(stf -> {
                stf.setStatus("AVAILABLE");
                stf.setDepartmentCode("WARD_A");
                stf.setWorkloadScore(45);
                staffRepository.save(stf);
            });

            // Generate 12 emergency patients with realistic triage severities
            for (int i = 1; i <= 12; i++) {
                String patCode = String.format("P2%02d", i);
                String id = "PAT-" + patCode;
                String severity = (i <= 4) ? "CRITICAL" : ((i <= 8) ? "HIGH" : "MODERATE");
                String careLevel = (i <= 4) ? "ICU" : ((i <= 8) ? "MONITORED_WARD" : "WARD");
                String vitals = (i <= 4) ? "UNSTABLE" : "STABLE";

                patientRepository.save(new Patient(
                    id, patCode, 30 + (i * 3), (i % 2 == 0 ? "M" : "F"),
                    severity, vitals, careLevel, false, "ER_WAITING", null, LocalDateTime.now()
                ));
            }
            auditLogRepository.save(new AuditLog(UUID.randomUUID().toString(), LocalDateTime.now(), "Simulator", "CRISIS_SURGE_TRIGGERED", scenarioName, "SUCCESS", "Generated 12 Emergency Patients"));
        } else if ("ICU_CAPACITY_CRISIS".equalsIgnoreCase(scenarioName)) {
            // Fill ICU beds to simulate ICU bottleneck
            bedRepository.findAll().forEach(b -> {
                if ("ICU".equalsIgnoreCase(b.getBedType()) && !"BED-ICU-03".equalsIgnoreCase(b.getId())) {
                    b.setStatus("OCCUPIED");
                    bedRepository.save(b);
                }
            });
            // Ensure P103 is ready in ICU-03 for step-down
            patientRepository.findById("PAT-P003").ifPresent(p -> {
                p.setStatus("ADMITTED_ICU");
                p.setAssignedBedId("BED-ICU-03");
                p.setVitalsStatus("STABLE");
                p.setPhysicianClearance(true);
                patientRepository.save(p);
            });
        } else if ("WARD_BED_SHORTAGE".equalsIgnoreCase(scenarioName)) {
            // Fill ward beds
            bedRepository.findAll().forEach(b -> {
                if ("WARD".equalsIgnoreCase(b.getBedType())) {
                    b.setStatus("OCCUPIED");
                    bedRepository.save(b);
                }
            });
        } else if ("STAFF_SHORTAGE".equalsIgnoreCase(scenarioName)) {
            staffRepository.findAll().forEach(s -> {
                if ("ER".equalsIgnoreCase(s.getDepartmentCode())) {
                    s.setWorkloadScore(98);
                    s.setStatus("OVERLOADED");
                    staffRepository.save(s);
                }
            });
        } else if ("CLEANING_BOTTLENECK".equalsIgnoreCase(scenarioName)) {
            bedRepository.findAll().forEach(b -> {
                if (b.getBedNumber().endsWith("-06") || b.getBedNumber().endsWith("-07") || b.getBedNumber().endsWith("-10")) {
                    b.setStatus("CLEANING");
                    b.setEstimatedAvailableMins(25);
                    bedRepository.save(b);
                }
            });
        }

        // Build current state payload for AI Service
        Map<String, Object> fullState = hospitalStateService.getFullHospitalState();
        fullState.put("trigger_event", Map.of("id", eventId, "type", scenarioName));

        // Invoke AI Multi-Agent Orchestrator
        Map<String, Object> aiResult = aiServiceClient.orchestrate(fullState);

        // Store generated recommendations into database for human approval gateway
        saveRecommendationsAndRequests(aiResult);

        // Safety fallback: Ensure crisis proposals are active in database
        List<Map<String, Object>> activeActions = hospitalStateService.buildActiveCandidateActions();
        if (activeActions.isEmpty() && ("SURGE_12_EMERGENCY".equalsIgnoreCase(scenarioName) || "RUN CRISIS SCENARIO".equalsIgnoreCase(scenarioName))) {
            Map<String, Object> fallbackAct1 = new HashMap<>();
            fallbackAct1.put("action_id", "STEPDOWN-P103-WARD-04");
            fallbackAct1.put("action_type", "TRANSFER_PATIENT");
            fallbackAct1.put("target_entity_id", "PAT-P003");
            fallbackAct1.put("target_entity_code", "P103");
            fallbackAct1.put("target_location", "WARD-04");
            fallbackAct1.put("reason", "CLINICAL STEP-DOWN: Patient P103 has stabilized in ICU (ICU-03) with physician clearance. Transferring to vacant bed WARD-04 safely transitions patient to general recovery and unlocks 1 critical ICU bed for incoming emergency resuscitation.");
            fallbackAct1.put("expected_benefit", "Frees ICU bed ICU-03 immediately for incoming emergency patient while safely admitting P103 to vacant bed WARD-04.");
            fallbackAct1.put("risk_level", "HIGH");
            fallbackAct1.put("requires_human_approval", true);
            fallbackAct1.put("approval_role", "DOCTOR");
            fallbackAct1.put("status", "PROPOSED");

            Map<String, Object> fallbackAct2 = new HashMap<>();
            fallbackAct2.put("action_id", "STAFF-REASSIGN-N17");
            fallbackAct2.put("action_type", "REASSIGN_STAFF");
            fallbackAct2.put("target_entity_id", "STF-N02");
            fallbackAct2.put("target_entity_code", "NURSE-N17");
            fallbackAct2.put("target_location", "ER");
            fallbackAct2.put("reason", "Temporarily reassign Float Nurse Samantha Blake (N17) to ER triage unit to alleviate surge wait times and maintain safe nurse-to-patient ratio.");
            fallbackAct2.put("expected_benefit", "Reduces ER triage queue bottlenecks and patient waiting times.");
            fallbackAct2.put("risk_level", "MEDIUM");
            fallbackAct2.put("requires_human_approval", true);
            fallbackAct2.put("approval_role", "NURSE_MANAGER");
            fallbackAct2.put("status", "PROPOSED");

            saveRecommendationsAndRequests(Map.of("candidate_actions", List.of(fallbackAct1, fallbackAct2)));
        }

        // Fetch refreshed state from database with active candidate actions and 12 surge patients
        Map<String, Object> stateToReturn = hospitalStateService.getFullHospitalState();

        // Merge AI agent reasoning findings, risk assessment, and predictions
        Object findings = aiResult.get("agent_findings") != null ? aiResult.get("agent_findings") : aiResult.get("agentFindings");
        Object valResults = aiResult.get("validation_results") != null ? aiResult.get("validation_results") : aiResult.get("validationResults");
        Object risk = aiResult.get("risk_level") != null ? aiResult.get("risk_level") : aiResult.getOrDefault("riskLevel", "HIGH");
        Object approval = aiResult.get("approval_status") != null ? aiResult.get("approval_status") : aiResult.getOrDefault("approvalStatus", "WAITING_HUMAN_APPROVAL");
        Object predDemand = aiResult.get("predicted_demand") != null ? aiResult.get("predicted_demand") : aiResult.get("predictedDemand");
        Object bottlenecks = aiResult.get("detected_bottlenecks") != null ? aiResult.get("detected_bottlenecks") : aiResult.get("detectedBottlenecks");

        if (findings != null) stateToReturn.put("agent_findings", findings);
        if (valResults != null) stateToReturn.put("validation_results", valResults);
        if (risk != null) stateToReturn.put("risk_level", risk);
        if (approval != null) stateToReturn.put("approval_status", approval);
        if (predDemand != null) stateToReturn.put("predicted_demand", predDemand);
        if (bottlenecks != null) stateToReturn.put("detected_bottlenecks", bottlenecks);

        // Broadcast real-time WebSocket update to clients
        broadcastHospitalStateUpdate(stateToReturn);

        return stateToReturn;
    }

    public void saveRecommendationsAndRequests(Map<String, Object> aiResult) {
        if (aiResult == null) return;
        List<Map<String, Object>> actions = (List<Map<String, Object>>) (
            aiResult.containsKey("candidate_actions") ? aiResult.get("candidate_actions") : aiResult.get("candidateActions")
        );
        if (actions == null || actions.isEmpty()) return;

        for (Map<String, Object> act : actions) {
            String recId = (String) (act.containsKey("action_id") ? act.get("action_id") : act.get("actionId"));
            if (recId != null) {
                String actionType = (String) (act.containsKey("action_type") ? act.get("action_type") : act.get("actionType"));
                String targetEntityId = (String) (act.containsKey("target_entity_id") ? act.get("target_entity_id") : act.get("targetEntityId"));
                String targetEntityCode = (String) (act.containsKey("target_entity_code") ? act.get("target_entity_code") : act.get("targetEntityCode"));
                String targetLocation = (String) (act.containsKey("target_location") ? act.get("target_location") : act.get("targetLocation"));
                String reason = (String) act.get("reason");
                String expectedBenefit = (String) (act.containsKey("expected_benefit") ? act.get("expected_benefit") : act.get("expectedBenefit"));
                String riskLevel = (String) (act.containsKey("risk_level") ? act.get("risk_level") : act.get("riskLevel"));
                if (riskLevel == null) riskLevel = "HIGH";

                Boolean requiresApproval = (Boolean) (act.containsKey("requires_human_approval") ? act.get("requires_human_approval") : act.get("requiresHumanApproval"));
                if (requiresApproval == null) requiresApproval = true;

                String approvalRole = (String) (act.containsKey("approval_role") ? act.get("approval_role") : act.get("approvalRole"));
                if (approvalRole == null) approvalRole = "DOCTOR";

                Optional<Recommendation> existingOpt = recommendationRepository.findById(recId);
                Recommendation rec;
                if (existingOpt.isPresent()) {
                    rec = existingOpt.get();
                    rec.setActionType(actionType);
                    rec.setTargetEntityId(targetEntityId);
                    rec.setTargetEntityCode(targetEntityCode);
                    rec.setTargetLocation(targetLocation);
                    rec.setReason(reason);
                    rec.setExpectedBenefit(expectedBenefit);
                    rec.setRiskLevel(riskLevel);
                    rec.setStatus("PROPOSED");
                } else {
                    rec = new Recommendation(
                        recId,
                        "RUN-" + UUID.randomUUID().toString().substring(0, 8),
                        actionType,
                        targetEntityId,
                        targetEntityCode,
                        targetLocation,
                        reason,
                        expectedBenefit,
                        riskLevel,
                        "PROPOSED"
                    );
                }
                recommendationRepository.save(rec);

                if (Boolean.TRUE.equals(requiresApproval)) {
                    String reqId = "REQ-" + recId;
                    Optional<ApprovalRequest> reqOpt = approvalRequestRepository.findByRecommendationId(recId)
                        .or(() -> approvalRequestRepository.findById(reqId));
                    ApprovalRequest req;
                    if (reqOpt.isPresent()) {
                        req = reqOpt.get();
                        req.setStatus("PENDING");
                        req.setRiskLevel(riskLevel);
                        req.setRequiredRole(approvalRole);
                        req.setRejectionReason(null);
                    } else {
                        req = new ApprovalRequest(
                            reqId,
                            recId,
                            riskLevel,
                            approvalRole,
                            "PENDING",
                            null,
                            LocalDateTime.now()
                        );
                    }
                    approvalRequestRepository.save(req);
                }
            }
        }
    }

    public void broadcastHospitalStateUpdate(Map<String, Object> payload) {
        try {
            messagingTemplate.convertAndSend("/topic/hospital-state", payload);
        } catch (Exception e) {
            System.err.println("[WebSocket] Broadcast error: " + e.getMessage());
        }
    }
}
