# Security & Human Safety Position - HOSPITAL FLOW AI

## Academic Positioning & Safety Disclaimer
"HOSPITAL FLOW AI" is a simulated hospital operations capacity and patient flow decision-support system.

- **NO Autonomous Diagnosis**: The system does NOT diagnose patient illnesses.
- **NO Autonomous Treatment**: The system does NOT specify clinical treatment plans.
- **NO Autonomous Patient Transfers**: High-impact patient transfers require explicit physician/clinical human authorization.
- **NO Autonomous Discharges**: Patient discharge reviews require clinical clearance and human approval.

## Role-Based Access Control (RBAC)
- `DOCTOR`: Approves patient step-down transfers and discharge review candidates.
- `NURSE_MANAGER`: Approves staff reassignments, bed reservations, and cleaning expedites.
- `HOSPITAL_MANAGER`: Approves operational capacity overrides.
- `ADMIN`: Full administrative control.
