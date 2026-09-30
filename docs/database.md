# Database Documentation & Schema - HOSPITAL FLOW AI

PostgreSQL database schema versioned via Flyway migrations (`database/migrations/`).

## Key Tables

1. `departments`: Hospital operational units (ER, ICU, WARD_A, WARD_B, OR).
2. `beds`: Bed inventory, bed_number, bed_type (ICU, WARD, ER), status (AVAILABLE, OCCUPIED, CLEANING, RESERVED).
3. `patients`: Patient profiles, severity (CRITICAL, HIGH, MODERATE, LOW), vitals_status, required_care_level, status.
4. `staff`: Physician, nurse, cleaner roster, shift, workload_score.
5. `cleaning_tasks`: Sanitization tasks, estimated completion times.
6. `hospital_events`: Recorded operational telemetry events (e.g. `SURGE_PATIENTS`).
7. `agent_runs` & `agent_findings`: Multi-agent execution tracking and structured findings.
8. `recommendations` & `approval_requests`: Action plan candidates and human approval queue requests.
9. `audit_logs`: Searchable system auditability record.
