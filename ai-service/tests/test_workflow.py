import pytest
from app.models.hospital_state import HospitalState, Bed, Patient, Staff, CandidateAction
from app.graph.workflow import hospital_orchestrator

def test_full_orchestration_cycle():
    state = HospitalState()
    # Add an emergency patient needing ICU
    state.patients.append(Patient(
        id="P-SURGE-1",
        code="P-901",
        age=52,
        gender="M",
        severity="CRITICAL",
        vitals_status="UNSTABLE",
        required_care_level="ICU",
        status="ER_WAITING"
    ))
    # Add an available ICU bed
    state.beds.append(Bed(
        id="BED-ICU-1",
        bed_number="ICU-01",
        department_code="ICU",
        bed_type="ICU",
        status="AVAILABLE"
    ))
    # Add on-duty staff
    state.staff.append(Staff(
        id="ST-1",
        staff_code="N101",
        name="Nurse Sarah",
        role="NURSE",
        department_code="ICU",
        shift="DAY",
        status="ON_DUTY",
        workload_score=40
    ))

    result = hospital_orchestrator.invoke(state)
    res_state = HospitalState(**result) if isinstance(result, dict) else result

    assert res_state.iteration_count >= 1
    assert len(res_state.agent_findings) > 0
    assert res_state.validation_results is not None
    assert res_state.validation_results.is_valid

def test_replanning_cycle_after_rejection():
    state = HospitalState()
    # Simulate a prior rejection
    state.rejected_action_ids.append("ACTION-PREV-01")
    state.rejection_reason = "Patient too unstable for step-down transfer"
    state.patients.append(Patient(
        id="P-101",
        code="P-101",
        age=60,
        gender="F",
        severity="HIGH",
        vitals_status="UNSTABLE",
        required_care_level="ICU",
        status="ER_WAITING"
    ))

    result = hospital_orchestrator.invoke(state)
    res_state = HospitalState(**result) if isinstance(result, dict) else result

    # Should not include the rejected action ID in new candidate actions
    for action in res_state.candidate_actions:
        assert action.action_id != "ACTION-PREV-01"
