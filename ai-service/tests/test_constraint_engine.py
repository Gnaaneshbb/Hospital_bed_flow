import pytest
from app.models.hospital_state import HospitalState, Bed, Patient, CandidateAction
from app.validator.constraint_engine import ConstraintEngine

def test_cannot_allocate_occupied_bed():
    state = HospitalState()
    state.beds.append(Bed(id="BED-1", bed_number="ICU-01", department_code="ICU", bed_type="ICU", status="OCCUPIED", current_patient_id="P99"))
    state.patients.append(Patient(id="P1", code="P-001", age=45, gender="M", severity="CRITICAL", vitals_status="UNSTABLE", required_care_level="ICU", status="ER_WAITING"))
    
    state.candidate_actions.append(CandidateAction(
        action_id="ACT-1",
        action_type="TRANSFER_PATIENT",
        target_entity_id="P1",
        target_entity_code="P-001",
        target_location="BED-1",
        reason="Test transfer",
        expected_benefit="None",
        risk_level="HIGH"
    ))

    result = ConstraintEngine.validate_plan(state)
    assert not result.is_valid
    assert any("occupied bed" in v for v in result.violations)

def test_cannot_allocate_cleaning_bed():
    state = HospitalState()
    state.beds.append(Bed(id="BED-2", bed_number="WARD-01", department_code="WARD_A", bed_type="WARD", status="CLEANING"))
    state.patients.append(Patient(id="P2", code="P-002", age=30, gender="F", severity="MODERATE", vitals_status="STABLE", required_care_level="WARD", status="ER_WAITING"))

    state.candidate_actions.append(CandidateAction(
        action_id="ACT-2",
        action_type="TRANSFER_PATIENT",
        target_entity_id="P2",
        target_entity_code="P-002",
        target_location="BED-2",
        reason="Test transfer to cleaning bed",
        expected_benefit="None",
        risk_level="MEDIUM"
    ))

    result = ConstraintEngine.validate_plan(state)
    assert not result.is_valid
    assert any("undergoing cleaning" in v for v in result.violations)

def test_rejection_respect():
    state = HospitalState()
    state.rejected_action_ids.append("REJECTED-ACT-10")
    state.candidate_actions.append(CandidateAction(
        action_id="REJECTED-ACT-10",
        action_type="REASSIGN_STAFF",
        target_entity_id="STAFF-1",
        target_entity_code="N17",
        reason="Test rejected action",
        expected_benefit="None",
        risk_level="LOW"
    ))

    result = ConstraintEngine.validate_plan(state)
    assert not result.is_valid
    assert any("explicitly REJECTED" in v for v in result.violations)
