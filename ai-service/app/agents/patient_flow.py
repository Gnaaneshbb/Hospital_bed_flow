from app.models.hospital_state import HospitalState, AgentFinding
from typing import Dict, Any, List

class PatientFlowAgent:
    """
    Patient Flow Agent: Operational Triage & Care Level Analysis.
    Categorizes operational priority and care level requirements without making medical diagnoses.
    """
    @staticmethod
    def analyze(state: HospitalState) -> AgentFinding:
        critical_count = 0
        high_count = 0
        icu_needed = 0
        monitored_needed = 0
        ward_needed = 0

        er_queue: List[Dict[str, Any]] = []

        # Analyze incoming patients and current ER waiting patients
        all_er_patients = [p for p in state.patients if p.status == "ER_WAITING"] + state.incoming_patients

        for p in all_er_patients:
            if p.severity in ["CRITICAL", "HIGH"]:
                if p.severity == "CRITICAL":
                    critical_count += 1
                else:
                    high_count += 1

            if p.required_care_level == "ICU":
                icu_needed += 1
            elif p.required_care_level == "MONITORED_WARD":
                monitored_needed += 1
            else:
                ward_needed += 1

            er_queue.append({
                "patient_code": p.code,
                "severity": p.severity,
                "care_level": p.required_care_level,
                "vitals": p.vitals_status
            })

        summary = (f"Analyzed {len(all_er_patients)} ER/Incoming patients. "
                   f"Urgency: {critical_count} CRITICAL, {high_count} HIGH. "
                   f"Estimated care demand: {icu_needed} ICU beds, {monitored_needed} Monitored Wards, {ward_needed} General Wards.")

        return AgentFinding(
            agent_name="Patient Flow Agent",
            status="COMPLETED",
            finding_type="TRIAGE_CARE_ASSESSMENT",
            summary=summary,
            confidence_score=0.96,
            details={
                "total_er_patients": len(all_er_patients),
                "critical_count": critical_count,
                "high_count": high_count,
                "icu_beds_required": icu_needed,
                "monitored_beds_required": monitored_needed,
                "ward_beds_required": ward_needed,
                "er_queue_sample": er_queue[:5]
            }
        )
