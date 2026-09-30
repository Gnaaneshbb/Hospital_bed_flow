import type { HospitalState, Patient, Bed, Staff, AuditLog, ApprovalRequest, WhatIfResult } from '../types/hospital';

const API_BASE_URL = 'http://localhost:8080/api';

export async function fetchHospitalState(): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/hospital/state`);
  if (!res.ok) throw new Error('Failed to fetch hospital state');
  return res.json();
}

export async function fetchPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_BASE_URL}/hospital/patients`);
  return res.json();
}

export async function fetchBeds(): Promise<Bed[]> {
  const res = await fetch(`${API_BASE_URL}/hospital/beds`);
  return res.json();
}

export async function fetchStaff(): Promise<Staff[]> {
  const res = await fetch(`${API_BASE_URL}/hospital/staff`);
  return res.json();
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE_URL}/hospital/audit-logs`);
  return res.json();
}

export async function fetchPendingApprovals(): Promise<ApprovalRequest[]> {
  const res = await fetch(`${API_BASE_URL}/approvals`);
  return res.json();
}

export async function triggerCrisisScenario(): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/simulations/crisis`, { method: 'POST' });
  if (!res.ok) throw new Error(`Crisis scenario trigger failed: ${res.statusText}`);
  return res.json();
}

export async function triggerScenario(scenarioName: string): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/simulations/scenario?name=${encodeURIComponent(scenarioName)}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Trigger scenario failed: ${res.statusText}`);
  return res.json();
}

export async function approveRequest(id: string, actor: string = 'Dr. Sarah Jenkins', role: string = 'DOCTOR'): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/approvals/${id}/approve?actor=${encodeURIComponent(actor)}&role=${encodeURIComponent(role)}`, {
    method: 'POST'
  });
  return res.json();
}

export async function rejectRequest(id: string, reason: string, actor: string = 'Dr. Sarah Jenkins', role: string = 'DOCTOR'): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/approvals/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, actor, role })
  });
  return res.json();
}

export async function runWhatIfSimulation(scenarioData: Record<string, any>): Promise<WhatIfResult> {
  const res = await fetch(`${API_BASE_URL}/simulations/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenarioData)
  });
  return res.json();
}

export async function updateBedStatus(
  bedId: string,
  status: string,
  patientId?: string | null,
  estimatedAvailableMins?: number
): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/hospital/beds/${encodeURIComponent(bedId)}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, patientId, estimatedAvailableMins })
  });
  if (!res.ok) throw new Error('Failed to update bed status');
  return res.json();
}

export async function createPatient(patient: Partial<Patient>): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/hospital/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patient)
  });
  if (!res.ok) throw new Error('Failed to create patient');
  return res.json();
}

export async function updatePatient(patientId: string, update: Partial<Patient>): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/hospital/patients/${encodeURIComponent(patientId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update)
  });
  if (!res.ok) throw new Error('Failed to update patient');
  return res.json();
}

export async function deletePatient(patientId: string): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/hospital/patients/${encodeURIComponent(patientId)}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete patient');
  return res.json();
}

export async function resetHospitalState(): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/hospital/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset hospital state');
  return res.json();
}

export async function reassignApprovalTargetBed(id: string, targetBed: string): Promise<HospitalState> {
  const res = await fetch(`${API_BASE_URL}/approvals/${encodeURIComponent(id)}/reassign?targetBed=${encodeURIComponent(targetBed)}`, {
    method: 'PUT'
  });
  if (!res.ok) throw new Error('Failed to reassign approval target bed');
  return res.json();
}

