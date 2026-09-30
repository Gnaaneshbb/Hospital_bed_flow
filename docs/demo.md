# Demo Guide - 12 Emergency Patient Crisis Scenario

## Step-by-Step Demonstration Protocol

1. **Launch Stack**: Ensure Spring Boot Backend (`:8080`), Python AI Service (`:8000`), and React Frontend (`:5173`) are active.
2. **Open Command Center**: Navigate to `http://localhost:5173`.
3. **Observe Baseline State**:
   - ICU Occupancy: ~90% (1 available bed).
   - Ward Occupancy: ~70%.
   - Pending Approvals: 0.
4. **Trigger Crisis Scenario**: Click **"RUN CRISIS SCENARIO"** in the top navigation bar.
5. **Observe Real-Time Telemetry & Agent Lifecycle**:
   - 12 Emergency Patients arrive in ER triage queue (4 Critical, 4 High, 4 Moderate).
   - Multi-Agent workflow triggers: Patient Flow -> Bed Mgmt -> Staff -> Prediction -> Planning -> Safety Validator.
   - High-risk recommendations appear in the **Approvals** tab (e.g. `PLAN-ACT-001`: Step-down transfer P103 from ICU-03 to WARD-04).
6. **Test Human Approval Gateway**:
   - Click **APPROVE** on Float Nurse Reassignment. State executes immediately.
   - Click **REJECT** on Patient P103 Transfer. Enter clinical reason: *"Patient vitals unstable due to cardiac arrhythmia."*
7. **Observe Automatic Replanning**:
   - Rejection feedback feeds back into the **Orchestrator Agent**.
   - System recalculates alternatives and presents an updated plan automatically (e.g., Transfer P107 instead).
8. **Digital Twin What-If Sandbox**: Open **What-If Digital Twin** tab to run hypothetical forward-projected simulations.
