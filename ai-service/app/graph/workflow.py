from langgraph.graph import StateGraph, END
from app.models.hospital_state import HospitalState, AgentFinding
from app.agents.patient_flow import PatientFlowAgent
from app.agents.bed_mgmt import BedMgmtAgent
from app.agents.staff import StaffAgent
from app.agents.discharge import DischargeAgent
from app.agents.prediction import PredictionAgent
from app.agents.planning import PlanningAgent
from app.validator.constraint_engine import ConstraintEngine
import datetime

def observe_node(state: HospitalState) -> HospitalState:
    state.iteration_count += 1
    state.audit_log.append({
        "timestamp": datetime.datetime.now().isoformat(),
        "actor": "OrchestratorAgent",
        "action": "OBSERVE",
        "details": f"Iteration {state.iteration_count}: Event received: {state.trigger_event.get('type') if state.trigger_event else 'SYSTEM_TICK'}"
    })
    return state

def patient_flow_node(state: HospitalState) -> HospitalState:
    finding = PatientFlowAgent.analyze(state)
    state.agent_findings.append(finding)
    return state

def bed_mgmt_node(state: HospitalState) -> HospitalState:
    finding = BedMgmtAgent.analyze(state)
    state.agent_findings.append(finding)
    return state

def staff_node(state: HospitalState) -> HospitalState:
    finding = StaffAgent.analyze(state)
    state.agent_findings.append(finding)
    return state

def discharge_node(state: HospitalState) -> HospitalState:
    finding = DischargeAgent.analyze(state)
    state.agent_findings.append(finding)
    return state

def prediction_node(state: HospitalState) -> HospitalState:
    finding = PredictionAgent.forecast(state)
    state.agent_findings.append(finding)
    return state

def planning_node(state: HospitalState) -> HospitalState:
    actions = PlanningAgent.generate_plan(state)
    state.candidate_actions = actions
    state.audit_log.append({
        "timestamp": datetime.datetime.now().isoformat(),
        "actor": "PlanningAgent",
        "action": "PLAN_GENERATED",
        "details": f"Generated {len(actions)} candidate actions (Rejections considered: {len(state.rejected_action_ids)})."
    })
    return state

def validator_node(state: HospitalState) -> HospitalState:
    val_res = ConstraintEngine.validate_plan(state)
    state.validation_results = val_res
    return state

def approval_gateway_node(state: HospitalState) -> HospitalState:
    high_risk = any(a.risk_level == "HIGH" for a in state.candidate_actions)
    med_risk = any(a.risk_level == "MEDIUM" for a in state.candidate_actions)

    if high_risk:
        state.risk_level = "HIGH"
    elif med_risk:
        state.risk_level = "MEDIUM"
    else:
        state.risk_level = "LOW"

    if state.validation_results.is_valid and (high_risk or med_risk):
        state.approval_status = "WAITING_HUMAN_APPROVAL"
    elif not state.validation_results.is_valid:
        state.approval_status = "INVALID_PLAN"
    else:
        state.approval_status = "AUTO_APPROVED"

    state.audit_log.append({
        "timestamp": datetime.datetime.now().isoformat(),
        "actor": "ApprovalGateway",
        "action": "RISK_ASSESSMENT",
        "details": f"Assigned Risk Level: {state.risk_level}, Approval Status: {state.approval_status}"
    })
    return state

def build_hospital_orchestrator_graph():
    builder = StateGraph(HospitalState)

    builder.add_node("observe", observe_node)
    builder.add_node("patient_flow", patient_flow_node)
    builder.add_node("bed_mgmt", bed_mgmt_node)
    builder.add_node("staff", staff_node)
    builder.add_node("discharge", discharge_node)
    builder.add_node("prediction", prediction_node)
    builder.add_node("planning", planning_node)
    builder.add_node("validator", validator_node)
    builder.add_node("approval_gateway", approval_gateway_node)

    # Set flow edges
    builder.set_entry_point("observe")
    builder.add_edge("observe", "patient_flow")
    builder.add_edge("patient_flow", "bed_mgmt")
    builder.add_edge("bed_mgmt", "staff")
    builder.add_edge("staff", "discharge")
    builder.add_edge("discharge", "prediction")
    builder.add_edge("prediction", "planning")
    builder.add_edge("planning", "validator")
    builder.add_edge("validator", "approval_gateway")
    builder.add_edge("approval_gateway", END)

    return builder.compile()

hospital_orchestrator = build_hospital_orchestrator_graph()
