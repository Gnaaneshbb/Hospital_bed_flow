from app.models.hospital_state import HospitalState, AgentFinding
from typing import Dict, Any, List

class BedMgmtAgent:
    """
    Bed Management Agent: Bed inventory, status tracking, care-level matching, and deficit detection.
    """
    @staticmethod
    def analyze(state: HospitalState) -> AgentFinding:
        available_by_dept: Dict[str, int] = {}
        occupied_by_dept: Dict[str, int] = {}
        cleaning_by_dept: Dict[str, int] = {}

        icu_available = []
        ward_available = []
        icu_transfer_candidates = []

        for b in state.beds:
            dept = b.department_code
            if b.status == "AVAILABLE":
                available_by_dept[dept] = available_by_dept.get(dept, 0) + 1
                if b.bed_type == "ICU":
                    icu_available.append(b)
                elif b.bed_type == "WARD":
                    ward_available.append(b)
            elif b.status == "OCCUPIED":
                occupied_by_dept[dept] = occupied_by_dept.get(dept, 0) + 1
                # Find stable ICU patients who might be candidates for transfer to step-down ward
                if b.bed_type == "ICU" and b.current_patient_id:
                    patient = next((p for p in state.patients if p.id == b.current_patient_id), None)
                    if patient and patient.vitals_status == "STABLE" and patient.status == "ADMITTED_ICU":
                        icu_transfer_candidates.append({
                            "patient_id": patient.id,
                            "patient_code": patient.code,
                            "current_bed": b.bed_number,
                            "vitals": patient.vitals_status,
                            "physician_clearance": patient.physician_clearance
                        })
            elif b.status == "CLEANING":
                cleaning_by_dept[dept] = cleaning_by_dept.get(dept, 0) + 1

        cleaning_count = sum(cleaning_by_dept.values())
        total_icu_avail = len(icu_available)
        total_ward_avail = len(ward_available)

        summary = (f"Inventory Check: ICU Available: {total_icu_avail}, Wards Available: {total_ward_avail}, "
                   f"Under Cleaning: {cleaning_count}. Identified {len(icu_transfer_candidates)} stable ICU transfer candidate(s).")

        return AgentFinding(
            agent_name="Bed Management Agent",
            status="COMPLETED",
            finding_type="BED_INVENTORY_MATCHING",
            summary=summary,
            confidence_score=0.98,
            details={
                "icu_available_beds": [b.bed_number for b in icu_available],
                "ward_available_beds": [b.bed_number for b in ward_available],
                "beds_under_cleaning": cleaning_count,
                "icu_transfer_candidates": icu_transfer_candidates,
                "dept_available": available_by_dept,
                "dept_occupied": occupied_by_dept
            }
        )
