from app.models.hospital_state import HospitalState, AgentFinding
from typing import Dict, Any, List

class StaffAgent:
    """
    Staff Agent: Monitors physician, nursing, and cleaning staff workloads & departmental balancing.
    """
    @staticmethod
    def analyze(state: HospitalState) -> AgentFinding:
        dept_staff_count: Dict[str, int] = {}
        overloaded_staff: List[Dict[str, Any]] = []
        understaffed_depts: List[str] = []

        er_nurses = 0
        icu_nurses = 0
        reassignment_candidates = []

        for s in state.staff:
            dept = s.department_code
            if s.status != "OFF_DUTY":
                dept_staff_count[dept] = dept_staff_count.get(dept, 0) + 1
            if s.workload_score >= 85:
                overloaded_staff.append({
                    "staff_code": s.staff_code,
                    "name": s.name,
                    "role": s.role,
                    "dept": s.department_code,
                    "workload": s.workload_score
                })
            
            if s.role == "NURSE":
                if dept == "ER":
                    er_nurses += 1
                elif dept == "ICU":
                    icu_nurses += 1
                elif dept in ["WARD_A", "WARD_B"] and s.workload_score < 60:
                    reassignment_candidates.append(s)

        # Check for surge pressure vs staffing
        er_patients = len([p for p in state.patients if p.status == "ER_WAITING"]) + len(state.incoming_patients)
        if er_patients > 6 and er_nurses < 5:
            understaffed_depts.append("ER")

        summary = (f"Staff Analysis: {len(overloaded_staff)} staff members near capacity (>85% workload). "
                   f"ER Nursing load is HIGH ({er_patients} ER patients vs {er_nurses} active ER nurses). "
                   f"Found {len(reassignment_candidates)} available ward nurse(s) for temporary float support.")

        return AgentFinding(
            agent_name="Staff Agent",
            status="COMPLETED",
            finding_type="STAFF_WORKLOAD_BALANCING",
            summary=summary,
            confidence_score=0.94,
            details={
                "dept_staff_count": dept_staff_count,
                "overloaded_staff": overloaded_staff,
                "understaffed_depts": understaffed_depts,
                "float_nurse_candidates": [s.staff_code for s in reassignment_candidates]
            }
        )
