# Multi-Agent Architecture - HOSPITAL FLOW AI

The system utilizes specialized cooperating AI agents coordinated by a **LangGraph** state graph orchestrator.

## 1. Orchestrator Agent (LangGraph StateGraph)
- **Role**: Maintains workflow state (`HospitalState`), coordinates execution sequence, combines agent outputs, triggers automatic replanning upon human feedback, and never performs unsafe/high-impact mutations without explicit approval.

## 2. Patient Flow Agent
- **Role**: Evaluates incoming ER patients, prioritizes operational triage (CRITICAL, HIGH, MODERATE, LOW), and estimates required care levels (ICU, MONITORED_WARD, WARD) without making autonomous medical diagnoses.

## 3. Bed Management Agent
- **Role**: Matches operational care level needs against live bed inventory, tracks cleaning status, detects ICU/Ward bed shortages, and identifies step-down transfer candidates.

## 4. Staff Agent
- **Role**: Monitors physician, nursing, and cleaning staff workload scores, detects understaffed units (workload > 85%), and recommends float nurse reassignments.

## 5. Discharge Review Agent
- **Role**: Identifies stable ward patients eligible for clinical discharge review (`POTENTIAL_DISCHARGE_REVIEW`). Does NOT discharge patients autonomously.

## 6. Prediction Agent
- **Role**: Forecasts operational demand over 15m, 30m, 60m, and 4h horizons. Labeled explicitly as "Operational Forecast".

## 7. Planning Agent
- **Role**: Merges agent findings into a structured Candidate Action Plan with assigned risk levels (LOW, MEDIUM, HIGH) and human approval tags.

## 8. Constraint / Safety Validator
- **Role**: Deterministic rule-based engine enforcing hard rules:
  - Cannot allocate occupied bed.
  - Cannot allocate bed under cleaning.
  - Cannot assign ICU patient to ordinary ward.
  - Must respect prior human rejections.
