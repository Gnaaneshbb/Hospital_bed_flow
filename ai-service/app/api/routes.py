from fastapi import APIRouter, HTTPException
from app.models.hospital_state import HospitalState, WhatIfResult, CandidateAction
from app.graph.workflow import hospital_orchestrator
from app.validator.constraint_engine import ConstraintEngine
import copy
import datetime

router = APIRouter()

@router.get("/health")
def health_check():
    return {"status": "UP", "service": "Hospital Flow AI - Multi-Agent Service", "timestamp": datetime.datetime.now().isoformat()}

@router.post("/orchestrate", response_model=HospitalState)
def orchestrate_workflow(state: HospitalState):
    """
    Executes full LangGraph multi-agent orchestration cycle over incoming hospital state.
    """
    try:
        updated_state = hospital_orchestrator.invoke(state)
        # Convert dictionary response back to HospitalState model if returned as dict
        if isinstance(updated_state, dict):
            return HospitalState(**updated_state)
        return updated_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration error: {str(e)}")

@router.post("/replan", response_model=HospitalState)
def replan_workflow(state: HospitalState):
    """
    Triggers re-planning loop following human approval/rejection.
    """
    state.audit_log.append({
        "timestamp": datetime.datetime.now().isoformat(),
        "actor": "HumanApprover",
        "action": "REJECTION_RECEIVED",
        "details": f"Reason: {state.rejection_reason or 'Not specified'}. Re-invoking planning graph."
    })
    try:
        updated_state = hospital_orchestrator.invoke(state)
        if isinstance(updated_state, dict):
            return HospitalState(**updated_state)
        return updated_state
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replanning error: {str(e)}")

@router.post("/what-if", response_model=WhatIfResult)
def run_what_if_simulation(scenario: dict):
    """
    Digital Twin Simulation Sandbox.
    Simulates hypothetical surge scenarios (e.g. '15 critical patients arrive in 20 mins')
    without mutating live hospital data.
    """
    incoming_surge = scenario.get("additional_critical_patients", 15)
    timeframe_mins = scenario.get("timeframe_mins", 20)

    current_icu_avail = scenario.get("current_icu_available", 1)
    current_ward_avail = scenario.get("current_ward_available", 3)

    predicted_icu_deficit = max(0, incoming_surge - current_icu_avail)
    predicted_ward_deficit = max(0, (incoming_surge - predicted_icu_deficit) - current_ward_avail)

    bottlenecks = []
    if predicted_icu_deficit > 0:
        bottlenecks.append(f"SEVERE ICU DEFICIT: Shortage of {predicted_icu_deficit} ICU beds within {timeframe_mins} mins.")
    if predicted_ward_deficit > 0:
        bottlenecks.append(f"WARD OVERFLOW: Deficit of {predicted_ward_deficit} ward beds.")
    bottlenecks.append("ER Triage Queue Bottleneck: Triage delay estimated at 55 minutes.")

    recommended_actions = [
        CandidateAction(
            action_id="SIM-001",
            action_type="TRANSFER_PATIENT",
            target_entity_id="PATIENT-P103",
            target_entity_code="P103",
            target_location="WARD-04",
            reason="Step-down transfer 2 stable ICU patients to Ward beds.",
            expected_benefit="Frees 2 ICU beds for incoming critical arrivals.",
            dependencies=["Clinical approval"],
            risk_level="HIGH",
            requires_human_approval=True
        ),
        CandidateAction(
            action_id="SIM-002",
            action_type="EXPEDITE_CLEANING",
            target_entity_id="CLEANING-BAY-ICU",
            target_entity_code="CLEAN-ICU-02",
            reason="Priority sanitization of 2 cleaning ICU beds.",
            expected_benefit="Restores 2 ICU beds to available status in 15 mins.",
            dependencies=[],
            risk_level="LOW",
            requires_human_approval=False
        ),
        CandidateAction(
            action_id="SIM-003",
            action_type="REASSIGN_STAFF",
            target_entity_id="FLOAT-NURSE-TEAM",
            target_entity_code="FLOAT-N12-N14",
            target_location="ER",
            reason="Deploy 2 float nurses to ER surge unit.",
            expected_benefit="Maintains nurse-to-patient ratio under surge conditions.",
            dependencies=[],
            risk_level="MEDIUM",
            requires_human_approval=True
        )
    ]

    return WhatIfResult(
        current_state_summary={
            "icu_available": current_icu_avail,
            "ward_available": current_ward_avail,
            "er_waiting": 4
        },
        predicted_state_summary={
            "incoming_patients": incoming_surge,
            "timeframe_mins": timeframe_mins,
            "predicted_icu_deficit": predicted_icu_deficit,
            "predicted_er_wait_mins": 55
        },
        detected_bottlenecks=bottlenecks,
        recommended_interventions=recommended_actions,
        expected_capacity_gain={
            "icu_capacity_gain": "+2 Beds (Step-down) +2 Beds (Expedited cleaning) = 4 Beds",
            "er_wait_time_reduction": "Reduced from 55 mins to 20 mins"
        }
    )
