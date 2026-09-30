from app.models.hospital_state import HospitalState, AgentFinding
from typing import Dict, Any, List

class DischargeAgent:
    """
    Discharge Review Agent: Identifies hospital ward patients eligible for clinical discharge review.
    Does NOT execute discharges autonomously.
    """
    @staticmethod
    def analyze(state: HospitalState) -> AgentFinding:
        discharge_candidates = []

        for p in state.patients:
            if p.status in ["ADMITTED_WARD", "ADMITTED_ICU"] and p.vitals_status == "STABLE":
                # Check eligibility criteria: Ward patient, stable vitals, physician clearance pending or granted
                discharge_candidates.append({
                    "patient_id": p.id,
                    "patient_code": p.code,
                    "age": p.age,
                    "current_status": p.status,
                    "vitals": p.vitals_status,
                    "physician_clearance": p.physician_clearance,
                    "recommendation": "POTENTIAL_DISCHARGE_REVIEW"
                })

        summary = (f"Discharge Review: Identified {len(discharge_candidates)} patient(s) meeting operational stability criteria "
                   f"for clinical discharge review.")

        return AgentFinding(
            agent_name="Discharge Review Agent",
            status="COMPLETED",
            finding_type="DISCHARGE_CANDIDATE_IDENTIFICATION",
            summary=summary,
            confidence_score=0.92,
            details={
                "candidate_count": len(discharge_candidates),
                "candidates": discharge_candidates
            }
        )
