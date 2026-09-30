export type Severity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'RESERVED' | 'MAINTENANCE';
export type BedType = 'ICU' | 'WARD' | 'ER';
export type PatientStatus = 'ER_WAITING' | 'ADMITTED_ICU' | 'ADMITTED_WARD' | 'TRANSFER_PENDING' | 'DISCHARGE_PENDING' | 'DISCHARGED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_HUMAN_APPROVAL' | 'AUTO_APPROVED' | 'INVALID_PLAN';

export interface Department {
  id: string;
  code: string;
  name: string;
  totalBeds: number;
  activeStaff: number;
}

export interface Bed {
  id: string;
  bedNumber: string;
  departmentCode: string;
  bedType: BedType;
  status: BedStatus;
  currentPatientId?: string | null;
  estimatedAvailableMins?: number;
}

export interface Patient {
  id: string;
  patientCode: string;
  age: number;
  gender: string;
  severity: Severity;
  vitalsStatus: 'STABLE' | 'UNSTABLE' | 'GUARDED';
  requiredCareLevel: 'ICU' | 'MONITORED_WARD' | 'WARD' | 'ER_OBSERVATION';
  physicianClearance: boolean;
  status: PatientStatus;
  assignedBedId?: string | null;
  arrivalTime: string;
}

export interface Staff {
  id: string;
  staffCode: string;
  name: string;
  role: 'DOCTOR' | 'NURSE' | 'CLEANER';
  departmentCode: string;
  shift: 'DAY' | 'NIGHT';
  status: 'AVAILABLE' | 'ON_DUTY' | 'OVERLOADED' | 'OFF_DUTY';
  workloadScore: number;
}

export interface CleaningTask {
  id: string;
  bedId: string;
  cleanerId?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  estCompletionMins: number;
}

export interface AgentFinding {
  agent_name: string;
  status: 'THINKING' | 'RUNNING' | 'COMPLETED' | 'WAITING';
  finding_type: string;
  summary: string;
  confidence_score: number;
  details?: Record<string, any>;
  timestamp?: string;
}

export interface CandidateAction {
  action_id: string;
  action_type: 'TRANSFER_PATIENT' | 'RESERVE_BED' | 'REASSIGN_STAFF' | 'FLAG_DISCHARGE' | 'EXPEDITE_CLEANING' | 'OVERRIDE_CAPACITY';
  target_entity_id: string;
  target_entity_code: string;
  target_location?: string;
  reason: string;
  expected_benefit: string;
  dependencies?: string[];
  risk_level: RiskLevel;
  requires_human_approval: boolean;
  approval_role?: 'DOCTOR' | 'NURSE_MANAGER' | 'HOSPITAL_MANAGER';
  status?: string;
  target_bed_status?: string;
  target_bed_occupant?: string | null;
  target_bed_valid?: boolean;
  target_bed_conflict_reason?: string;
  available_alternative_beds?: string[];
}

export interface ValidationResult {
  is_valid: boolean;
  violations: string[];
  warnings: string[];
}

export interface ApprovalRequest {
  id: string;
  recommendationId: string;
  riskLevel: RiskLevel;
  requiredRole: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  eventName: string;
  inputRef?: string;
  decision?: string;
  executionResultJson?: string;
}

export interface WhatIfResult {
  current_state_summary: Record<string, any>;
  predicted_state_summary: Record<string, any>;
  detected_bottlenecks: string[];
  recommended_interventions: CandidateAction[];
  expected_capacity_gain: Record<string, any>;
}

export interface HospitalState {
  departments: Department[];
  beds: Bed[];
  patients: Patient[];
  staff: Staff[];
  cleaning_tasks: CleaningTask[];
  agent_findings?: AgentFinding[];
  candidate_actions?: CandidateAction[];
  validation_results?: ValidationResult;
  risk_level?: RiskLevel;
  approval_status?: ApprovalStatus;
  rejection_reason?: string;
  audit_logs?: AuditLog[];
}
