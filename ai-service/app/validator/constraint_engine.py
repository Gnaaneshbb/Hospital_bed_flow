from typing import List, Dict, Any
from app.models.hospital_state import HospitalState, CandidateAction, ValidationResult

class ConstraintEngine:
    """
    Deterministic rule-based safety validator.
    Ensures LLM planning outputs never bypass hospital hard clinical & operational constraints.
    """
    @staticmethod
    def validate_plan(state: HospitalState) -> ValidationResult:
        violations: List[str] = []
        warnings: List[str] = []

        beds_by_id = {b.id: b for b in state.beds}
        beds_by_id.update({b.bed_number: b for b in state.beds})

        patients_by_id = {p.id: p for p in state.patients}
        patients_by_id.update({p.code: p for p in state.patients})
        
        # Track beds targeted for allocation in this plan
        allocated_bed_ids = set()

        for action in state.candidate_actions:
            # Check 1: Respect prior human rejection
            if action.action_id in state.rejected_action_ids:
                violations.append(f"Action {action.action_id} was explicitly REJECTED by human oversight in prior iteration.")
                continue

            # Check 2: Bed allocations & transfers
            if action.action_type in ["TRANSFER_PATIENT", "RESERVE_BED"]:
                target_bed_id = action.target_location
                patient_id = action.target_entity_id

                if target_bed_id:
                    if target_bed_id not in beds_by_id:
                        violations.append(f"Target bed {target_bed_id} does not exist in hospital inventory.")
                        continue
                    
                    target_bed = beds_by_id[target_bed_id]

                    # Hard Rule: Cannot allocate occupied bed
                    if target_bed.status == "OCCUPIED" and target_bed.current_patient_id != patient_id:
                        violations.append(f"Target bed {target_bed.bed_number} is already OCCUPIED by patient {target_bed.current_patient_id}. Cannot double-book.")

                    # Hard Rule: Cannot allocate bed under cleaning
                    if target_bed.status == "CLEANING":
                        violations.append(f"Bed {target_bed.bed_number} is currently undergoing sanitization/cleaning and is not ready.")

                    # Hard Rule: No duplicate double-booking in same plan
                    if target_bed.id in allocated_bed_ids:
                        violations.append(f"Conflicting actions: Bed {target_bed.bed_number} is allocated twice in the same plan.")
                    allocated_bed_ids.add(target_bed.id)

                    # Hard Rule: Care level compatibility
                    if patient_id in patients_by_id:
                        patient = patients_by_id[patient_id]
                        # If patient is unstable/critical and assigned non-ICU bed
                        if (patient.vitals_status != "STABLE" and not patient.physician_clearance) and patient.required_care_level == "ICU" and target_bed.bed_type != "ICU":
                            violations.append(f"Patient {patient.code} is clinically unstable ({patient.vitals_status}) and requires ICU care; cannot transfer to general bed {target_bed.bed_number}.")
                        elif target_bed.bed_type != "ICU" and patient.status == "ADMITTED_ICU" and not patient.physician_clearance and patient.vitals_status != "STABLE":
                            violations.append(f"Step-down transfer of Patient {patient.code} to {target_bed.bed_number} requires stable vitals or physician clearance.")
                        elif target_bed.bed_type != "ICU" and patient.status == "ADMITTED_ICU":
                            warnings.append(f"Step-down transfer: Patient {patient.code} transitioning from ICU to Ward bed {target_bed.bed_number} with verified stable vitals.")

            # Check 3: Discharge Candidate Rules
            if action.action_type == "FLAG_DISCHARGE":
                patient_id = action.target_entity_id
                if patient_id in patients_by_id:
                    patient = patients_by_id[patient_id]
                    if not patient.physician_clearance:
                        warnings.append(f"Patient {patient.code} proposed for discharge review is pending physician clearance.")
                    if patient.vitals_status != "STABLE":
                        violations.append(f"Patient {patient.code} cannot be discharged with unstable vitals ({patient.vitals_status}).")

            # Check 4: Staff Reassignment Limits
            if action.action_type == "REASSIGN_STAFF":
                staff_id = action.target_entity_id
                staff_member = next((s for s in state.staff if s.id == staff_id or s.staff_code == action.target_entity_code), None)
                if staff_member and staff_member.workload_score > 90:
                    warnings.append(f"Staff member {staff_member.name} is currently at high workload ({staff_member.workload_score}%).")

        is_valid = len(violations) == 0
        return ValidationResult(
            is_valid=is_valid,
            violations=violations,
            warnings=warnings
        )
