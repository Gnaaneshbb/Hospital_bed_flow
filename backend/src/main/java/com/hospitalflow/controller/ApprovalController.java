package com.hospitalflow.controller;

import com.hospitalflow.model.ApprovalRequest;
import com.hospitalflow.repository.ApprovalRequestRepository;
import com.hospitalflow.service.ApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approvals")
@CrossOrigin(origins = "*")
public class ApprovalController {

    @Autowired
    private ApprovalRequestRepository approvalRequestRepository;
    @Autowired
    private ApprovalService approvalService;

    @GetMapping
    public ResponseEntity<List<ApprovalRequest>> getPendingApprovals() {
        return ResponseEntity.ok(approvalRequestRepository.findByStatus("PENDING"));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveRequest(
            @PathVariable String id,
            @RequestParam(defaultValue = "Doctor Smith") String actor,
            @RequestParam(defaultValue = "DOCTOR") String role) {
        return ResponseEntity.ok(approvalService.approveAction(id, actor, role));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String actor = body.getOrDefault("actor", "Doctor Smith");
        String role = body.getOrDefault("role", "DOCTOR");
        String reason = body.getOrDefault("reason", "Clinical judgment: Transfer unadvisable due to patient stability");
        return ResponseEntity.ok(approvalService.rejectAction(id, actor, role, reason));
    }

    @PutMapping("/{id}/reassign")
    public ResponseEntity<Map<String, Object>> reassignRequest(
            @PathVariable String id,
            @RequestParam String targetBed) {
        return ResponseEntity.ok(approvalService.reassignTargetBed(id, targetBed));
    }
}
