from app.models.hospital_state import HospitalState, AgentFinding, CandidateAction
from typing import List, Dict, Any

class PlanningAgent:
    """
    Planning Agent: Synthesizes findings from all domain agents into a cohesive, prioritized Action Plan.
    Enforces risk assignment and explicit human approval tagging.
    """
    @staticmethod
    def generate_plan(state: HospitalState) -> List[CandidateAction]:
        actions: List[CandidateAction] = []
        action_counter = 1

        # Extract findings from state
        patient_finding = next((f for f in state.agent_findings if f.agent_name == "Patient Flow Agent"), None)
        bed_finding = next((f for f in state.agent_findings if f.agent_name == "Bed Management Agent"), None)
        staff_finding = next((f for f in state.agent_findings if f.agent_name == "Staff Agent"), None)
        discharge_finding = next((f for f in state.agent_findings if f.agent_name == "Discharge Review Agent"), None)
        prediction_finding = next((f for f in state.agent_findings if f.agent_name == "Prediction Agent"), None)

        rejected_ids = set(state.rejected_action_ids)

        # 1. ICU Capacity Crisis Resolution: Step-down transfer candidate
        if bed_finding and bed_finding.details.get("icu_transfer_candidates"):
            ward_beds = [b for b in bed_finding.details.get("ward_available_beds", [])]
            for cand in bed_finding.details["icu_transfer_candidates"]:
                aid = f"PLAN-ACT-{action_counter:03d}"
                action_counter += 1
                if aid not in rejected_ids:
                    if ward_beds:
                        target_ward = ward_beds.pop(0)  # Allocate a distinct available bed
                        actions.append(CandidateAction(
                            action_id=aid,
                            action_type="TRANSFER_PATIENT",
                            target_entity_id=cand["patient_id"],
                            target_entity_code=cand["patient_code"],
                            target_location=target_ward,
                            reason=(
                                f"CLINICAL STEP-DOWN: Patient {cand['patient_code']} in ICU ({cand['current_bed']}) has achieved stable vitals with physician clearance. "
                                f"Transferring to confirmed vacant bed {target_ward} safely transitions patient to general recovery and unlocks 1 life-saving ICU bed for incoming critical arrivals."
                            ),
                            expected_benefit=f"Frees ICU bed {cand['current_bed']} immediately for incoming emergency patient while safely admitting {cand['patient_code']} to vacant bed {target_ward}.",
                            dependencies=["Clinical step-down clearance verified", f"Target bed {target_ward} sanitation confirmed"],
                            risk_level="HIGH",
                            requires_human_approval=True,
                            approval_role="DOCTOR"
                        ))
                    else:
                        # No vacant ward beds: expedite cleaning on ward turnaround beds
                        actions.append(CandidateAction(
                            action_id=aid,
                            action_type="EXPEDITE_CLEANING",
                            target_entity_id="WARD-TURNOVER",
                            target_entity_code="CLEAN-WARD-SURGE",
                            target_location="WARD",
                            reason=(
                                f"ICU Step-down candidate {cand['patient_code']} is ready for transfer, but all general ward beds are currently occupied. "
                                f"Expedited cleaning priority requested to restore ward capacity for step-down transfer."
                            ),
                            expected_benefit="Turns around cleaning ward beds to unlock downstream ICU step-down capacity.",
                            dependencies=["Priority sanitation dispatch"],
                            risk_level="MEDIUM",
                            requires_human_approval=False,
                            approval_role="NURSE_MANAGER"
                        ))

        # 2. Reserve Available ICU Beds for Incoming Critical Patients
        if patient_finding and patient_finding.details.get("critical_count", 0) > 0:
            icu_beds = bed_finding.details.get("icu_available_beds", []) if bed_finding else []
            for i, bed_code in enumerate(icu_beds):
                aid = f"PLAN-ACT-{action_counter:03d}"
                action_counter += 1
                if aid not in rejected_ids:
                    actions.append(CandidateAction(
                        action_id=aid,
                        action_type="RESERVE_BED",
                        target_entity_id=f"RESERVE-ICU-{i+1}",
                        target_entity_code=bed_code,
                        target_location=bed_code,
                        reason=f"Reserve ICU bed {bed_code} for incoming critical ER triage patient.",
                        expected_benefit="Prevents queue delay for life-critical care.",
                        dependencies=[],
                        risk_level="MEDIUM",
                        requires_human_approval=True,
                        approval_role="NURSE_MANAGER"
                    ))

        # 3. Expedite Bed Cleaning Tasks
        if bed_finding and bed_finding.details.get("beds_under_cleaning", 0) > 0:
            aid = f"PLAN-ACT-{action_counter:03d}"
            action_counter += 1
            if aid not in rejected_ids:
                actions.append(CandidateAction(
                    action_id=aid,
                    action_type="EXPEDITE_CLEANING",
                    target_entity_id="CLEANING-BAY-01",
                    target_entity_code="CLEAN-FAST",
                    reason="Beds are currently held in cleaning queue during emergency surge.",
                    expected_benefit="Accelerates bed turnover by 15 minutes.",
                    dependencies=[],
                    risk_level="LOW",
                    requires_human_approval=False,
                    approval_role="NURSE_MANAGER"
                ))

        # 4. Float Nurse Reassignment to ER
        if staff_finding and staff_finding.details.get("understaffed_depts"):
            float_candidates = staff_finding.details.get("float_nurse_candidates", [])
            nurse_code = float_candidates[0] if float_candidates else "NURSE-N17"
            aid = f"PLAN-ACT-{action_counter:03d}"
            action_counter += 1
            if aid not in rejected_ids:
                actions.append(CandidateAction(
                    action_id=aid,
                    action_type="REASSIGN_STAFF",
                    target_entity_id="STAFF-REASSIGN-01",
                    target_entity_code=nurse_code,
                    target_location="ER",
                    reason=f"ER patient queue is elevated. Temporarily reassign Float Nurse {nurse_code} to ER triage unit.",
                    expected_benefit="Reduces ER patient wait times and relieves nurse workload.",
                    dependencies=[],
                    risk_level="MEDIUM",
                    requires_human_approval=True,
                    approval_role="NURSE_MANAGER"
                ))

        # 5. Flag Discharge Review Candidates
        if discharge_finding and discharge_finding.details.get("candidates"):
            for cand in discharge_finding.details["candidates"][:2]:
                aid = f"PLAN-ACT-{action_counter:03d}"
                action_counter += 1
                if aid not in rejected_ids:
                    actions.append(CandidateAction(
                        action_id=aid,
                        action_type="FLAG_DISCHARGE",
                        target_entity_id=cand["patient_id"],
                        target_entity_code=cand["patient_code"],
                        reason=f"Patient {cand['patient_code']} exhibits stable vitals in ward. Flagged for physician discharge authorization.",
                        expected_benefit="Opens ward bed capacity for incoming admissions.",
                        dependencies=["Final physician discharge sign-off"],
                        risk_level="HIGH",
                        requires_human_approval=True,
                        approval_role="DOCTOR"
                    ))

        return actions
