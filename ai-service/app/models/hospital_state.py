from pydantic import BaseModel, Field, ConfigDict, AliasChoices
from pydantic.alias_generators import to_camel
from typing import List, Dict, Any, Optional
from datetime import datetime

class HospitalBaseModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        extra="ignore"
    )

class Patient(HospitalBaseModel):
    id: str
    code: str = Field(validation_alias=AliasChoices("code", "patientCode", "patient_code"))
    age: int = 40
    gender: str = "M"
    severity: str = "MODERATE"  # CRITICAL, HIGH, MODERATE, LOW
    vitals_status: str = Field("STABLE", validation_alias=AliasChoices("vitals_status", "vitalsStatus"))
    required_care_level: str = Field("WARD", validation_alias=AliasChoices("required_care_level", "requiredCareLevel"))
    physician_clearance: bool = Field(False, validation_alias=AliasChoices("physician_clearance", "physicianClearance"))
    status: str = "ER_WAITING"  # ER_WAITING, ADMITTED_ICU, ADMITTED_WARD, TRANSFER_PENDING, DISCHARGE_PENDING, DISCHARGED
    assigned_bed_id: Optional[str] = Field(None, validation_alias=AliasChoices("assigned_bed_id", "assignedBedId"))
    arrival_time: Any = Field(default_factory=lambda: datetime.now().isoformat(), validation_alias=AliasChoices("arrival_time", "arrivalTime"))

    @property
    def patient_code(self) -> str:
        return self.code

class Bed(HospitalBaseModel):
    id: str
    bed_number: str = Field(validation_alias=AliasChoices("bed_number", "bedNumber"))
    department_code: str = Field(validation_alias=AliasChoices("department_code", "departmentCode"))
    bed_type: str = Field(validation_alias=AliasChoices("bed_type", "bedType"))
    status: str = "AVAILABLE"  # AVAILABLE, OCCUPIED, CLEANING, RESERVED, MAINTENANCE
    current_patient_id: Optional[str] = Field(None, validation_alias=AliasChoices("current_patient_id", "currentPatientId"))
    estimated_available_mins: int = Field(0, validation_alias=AliasChoices("estimated_available_mins", "estimatedAvailableMins"))

class Staff(HospitalBaseModel):
    id: str
    staff_code: str = Field(validation_alias=AliasChoices("staff_code", "staffCode"))
    name: str
    role: str = "NURSE"  # DOCTOR, NURSE, CLEANER
    department_code: str = Field(validation_alias=AliasChoices("department_code", "departmentCode"))
    shift: str = "DAY"  # DAY, NIGHT
    status: str = "ON_DUTY"  # AVAILABLE, ON_DUTY, OVERLOADED, OFF_DUTY
    workload_score: int = Field(50, validation_alias=AliasChoices("workload_score", "workloadScore"))

class CleaningTask(HospitalBaseModel):
    id: str
    bed_id: str = Field(validation_alias=AliasChoices("bed_id", "bedId"))
    cleaner_id: Optional[str] = Field(None, validation_alias=AliasChoices("cleaner_id", "cleanerId"))
    status: str = "PENDING"  # PENDING, IN_PROGRESS, COMPLETED
    est_completion_mins: int = Field(15, validation_alias=AliasChoices("est_completion_mins", "estCompletionMins", "estimatedCompletionMins"))

class AgentFinding(HospitalBaseModel):
    agent_name: str = Field(validation_alias=AliasChoices("agent_name", "agentName"))
    status: str = "COMPLETED"  # THINKING, RUNNING, COMPLETED, WAITING
    finding_type: str = Field(validation_alias=AliasChoices("finding_type", "findingType"))
    summary: str
    confidence_score: float = Field(0.95, validation_alias=AliasChoices("confidence_score", "confidenceScore"))
    details: Dict[str, Any] = {}
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())

class CandidateAction(HospitalBaseModel):
    action_id: str = Field(validation_alias=AliasChoices("action_id", "actionId"))
    action_type: str = Field("TRANSFER_PATIENT", validation_alias=AliasChoices("action_type", "actionType"))  # TRANSFER_PATIENT, RESERVE_BED, REASSIGN_STAFF, FLAG_DISCHARGE, EXPEDITE_CLEANING, OVERRIDE_CAPACITY
    target_entity_id: str = Field(validation_alias=AliasChoices("target_entity_id", "targetEntityId"))
    target_entity_code: str = Field(validation_alias=AliasChoices("target_entity_code", "targetEntityCode"))
    target_location: Optional[str] = Field(None, validation_alias=AliasChoices("target_location", "targetLocation"))
    reason: str
    expected_benefit: str = Field(validation_alias=AliasChoices("expected_benefit", "expectedBenefit"))
    dependencies: List[str] = []
    risk_level: str = Field("HIGH", validation_alias=AliasChoices("risk_level", "riskLevel"))  # LOW, MEDIUM, HIGH
    requires_human_approval: bool = Field(True, validation_alias=AliasChoices("requires_human_approval", "requiresHumanApproval"))
    approval_role: str = Field("DOCTOR", validation_alias=AliasChoices("approval_role", "approvalRole"))  # DOCTOR, NURSE_MANAGER, HOSPITAL_MANAGER
    status: str = "PROPOSED"  # PROPOSED, APPROVED, REJECTED, EXECUTED

class ValidationResult(HospitalBaseModel):
    is_valid: bool = Field(True, validation_alias=AliasChoices("is_valid", "isValid"))
    violations: List[str] = []
    warnings: List[str] = []

class WhatIfResult(HospitalBaseModel):
    current_state_summary: Dict[str, Any]
    predicted_state_summary: Dict[str, Any]
    detected_bottlenecks: List[str]
    recommended_interventions: List[CandidateAction]
    expected_capacity_gain: Dict[str, Any]

class HospitalState(HospitalBaseModel):
    current_timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    trigger_event: Optional[Dict[str, Any]] = None
    incoming_patients: List[Patient] = Field(default_factory=list, validation_alias=AliasChoices("incoming_patients", "incomingPatients"))
    patients: List[Patient] = Field(default_factory=list)
    beds: List[Bed] = Field(default_factory=list)
    staff: List[Staff] = Field(default_factory=list)
    departments: List[Dict[str, Any]] = Field(default_factory=list)
    cleaning_tasks: List[CleaningTask] = Field(default_factory=list, validation_alias=AliasChoices("cleaning_tasks", "cleaningTasks"))
    predicted_demand: Dict[str, Any] = Field(default_factory=dict)
    detected_bottlenecks: List[str] = Field(default_factory=list)
    agent_findings: List[AgentFinding] = Field(default_factory=list, validation_alias=AliasChoices("agent_findings", "agentFindings"))
    candidate_actions: List[CandidateAction] = Field(default_factory=list, validation_alias=AliasChoices("candidate_actions", "candidateActions"))
    validation_results: ValidationResult = Field(default_factory=ValidationResult, validation_alias=AliasChoices("validation_results", "validationResults"))
    risk_level: str = "LOW"
    approval_status: str = "PENDING"  # PENDING, APPROVED, REJECTED
    rejection_reason: Optional[str] = None
    rejected_action_ids: List[str] = Field(default_factory=list, validation_alias=AliasChoices("rejected_action_ids", "rejectedActionIds"))
    execution_results: List[Dict[str, Any]] = Field(default_factory=list)
    audit_log: List[Any] = Field(default_factory=list, validation_alias=AliasChoices("audit_log", "audit_logs", "auditLogs"))
    iteration_count: int = 0
