import React, { useState, useEffect } from 'react';
import type { HospitalState, Bed, Patient, Staff, AuditLog } from './types/hospital';
import {
  fetchHospitalState,
  triggerCrisisScenario,
  triggerScenario,
  approveRequest,
  rejectRequest,
  updateBedStatus,
  createPatient,
  updatePatient,
  deletePatient,
  resetHospitalState,
  reassignApprovalTargetBed
} from './services/api';
import { createWebSocketClient } from './services/websocket';
import { Navbar } from './components/Navbar';
import { KPIOverview } from './components/KPIOverview';
import { LiveBedMap } from './components/LiveBedMap';
import { PatientFlowPanel } from './components/PatientFlowPanel';
import { StaffRosterPanel } from './components/StaffRosterPanel';
import { AgentCenterPanel } from './components/AgentCenterPanel';
import { PredictionsPanel } from './components/PredictionsPanel';
import { ApprovalQueuePanel } from './components/ApprovalQueuePanel';
import { EventSimulatorPanel } from './components/EventSimulatorPanel';
import { WhatIfSandbox } from './components/WhatIfSandbox';
import { AuditLogsPanel } from './components/AuditLogsPanel';
import { AddPatientModal } from './components/AddPatientModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [userRole, setUserRole] = useState<string>('DOCTOR');
  const [state, setState] = useState<HospitalState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState<boolean>(false);

  const loadState = async () => {
    try {
      setLoading(true);
      const initial = await fetchHospitalState();
      setState(initial);
    } catch (e) {
      console.error('Fetch hospital state error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and WebSocket connection
  useEffect(() => {
    loadState();

    const wsClient = createWebSocketClient((updatedPayload) => {
      setState(prev => ({
        ...prev,
        ...updatedPayload
      }));
    });

    wsClient.activate();

    return () => {
      wsClient.deactivate();
    };
  }, []);

  const handleTriggerCrisisScenario = async () => {
    setLoading(true);
    try {
      const updated = await triggerCrisisScenario();
      setState(prev => ({ ...prev, ...updated }));
      setActiveTab('approvals');
    } catch (e) {
      console.error('Trigger crisis scenario error:', e);
      alert('Failed to trigger crisis surge. Please verify backend is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerScenario = async (scenarioName: string) => {
    setLoading(true);
    try {
      const updated = await triggerScenario(scenarioName);
      setState(prev => ({ ...prev, ...updated }));
    } catch (e) {
      console.error('Trigger scenario error:', e);
      alert('Failed to trigger scenario: ' + scenarioName);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async (actionId: string) => {
    try {
      const updated = await approveRequest(actionId, 'Dr. Sarah Jenkins', userRole);
      setState(prev => {
        const base = prev || updated;
        const currentActions = (updated.candidate_actions || base.candidate_actions || []).filter(
          a => a.action_id !== actionId && a.status !== 'EXECUTED' && a.status !== 'APPROVED'
        );
        return {
          ...base,
          ...updated,
          candidate_actions: currentActions
        };
      });
    } catch (e) {
      console.error('Approve action error:', e);
    }
  };

  const handleRejectAction = async (actionId: string, reason: string) => {
    try {
      const updated = await rejectRequest(actionId, reason, 'Dr. Sarah Jenkins', userRole);
      setState(prev => {
        const base = prev || updated;
        const currentActions = (updated.candidate_actions || base.candidate_actions || []).filter(
          a => a.action_id !== actionId
        );
        return {
          ...base,
          ...updated,
          candidate_actions: currentActions
        };
      });
      setActiveTab('agentcenter');
    } catch (e) {
      console.error('Reject action error:', e);
    }
  };

  const handleReassignBed = async (actionId: string, newBed: string) => {
    try {
      const updated = await reassignApprovalTargetBed(actionId, newBed);
      setState(prev => ({ ...prev, ...updated }));
    } catch (e) {
      console.error('Reassign bed error:', e);
    }
  };

  const handleUpdateBedStatus = async (
    bedId: string,
    status: string,
    patientId?: string | null,
    estimatedAvailableMins?: number
  ) => {
    try {
      const updated = await updateBedStatus(bedId, status, patientId, estimatedAvailableMins);
      setState(prev => ({ ...prev, ...updated }));
    } catch (e) {
      console.error('Update bed status error:', e);
    }
  };

  const handleCreatePatient = async (patientData: Partial<Patient>) => {
    try {
      const updated = await createPatient(patientData);
      setState(prev => ({ ...prev, ...updated }));
    } catch (e) {
      console.error('Create patient error:', e);
      throw e;
    }
  };

  const handleUpdatePatient = async (patientId: string, updateData: Partial<Patient>) => {
    try {
      const updated = await updatePatient(patientId, updateData);
      setState(prev => ({ ...prev, ...updated }));
    } catch (e) {
      console.error('Update patient error:', e);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    try {
      const updated = await deletePatient(patientId);
      setState(prev => ({ ...prev, ...updated }));
    } catch (e) {
      console.error('Delete patient error:', e);
    }
  };

  const handleResetState = async () => {
    if (confirm('Are you sure you want to reset all beds, patients, and queues to the initial demo baseline?')) {
      setLoading(true);
      try {
        const updated = await resetHospitalState();
        setState(updated);
      } catch (e) {
        console.error('Reset state error:', e);
      } finally {
        setLoading(false);
      }
    }
  };

  const beds: Bed[] = state?.beds || [];
  const patients: Patient[] = state?.patients || [];
  const staff: Staff[] = state?.staff || [];
  const auditLogs: AuditLog[] = state?.audit_logs || [];
  const candidateActions = state?.candidate_actions || [];

  const availableBeds = beds.filter(b => b.status === 'AVAILABLE');
  const pendingApprovalsCount = candidateActions.filter(a => a.requires_human_approval && a.status !== 'EXECUTED').length;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        pendingApprovalsCount={pendingApprovalsCount}
        onRunCrisisScenario={handleTriggerCrisisScenario}
        onRefreshState={loadState}
        onOpenAddPatient={() => setIsAddPatientOpen(true)}
        onResetState={handleResetState}
      />

      {loading && (
        <div className="bg-blue-600/30 text-blue-300 border-b border-blue-500/30 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>Synchronizing multi-agent hospital state...</span>
        </div>
      )}

      <main className="flex-1 max-w-[1800px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Command Center Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <KPIOverview
              beds={beds}
              patients={patients}
              staff={staff}
              riskLevel={state?.risk_level}
              approvalStatus={state?.approval_status}
              bottlenecks={state?.validation_results?.violations}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LiveBedMap
                beds={beds}
                patients={patients}
                onUpdateBedStatus={handleUpdateBedStatus}
                onOpenAddPatient={() => setIsAddPatientOpen(true)}
              />
              <ApprovalQueuePanel
                candidateActions={candidateActions}
                userRole={userRole}
                onApprove={handleApproveAction}
                onReject={handleRejectAction}
                onReassignBed={handleReassignBed}
                onSimulateSurge={handleTriggerCrisisScenario}
              />
            </div>

            <AgentCenterPanel
              agentFindings={state?.agent_findings}
              validationResults={state?.validation_results}
              riskLevel={state?.risk_level}
              approvalStatus={state?.approval_status}
            />
          </div>
        )}

        {/* Live Bed Map Tab */}
        {activeTab === 'bedmap' && (
          <LiveBedMap
            beds={beds}
            patients={patients}
            onUpdateBedStatus={handleUpdateBedStatus}
            onOpenAddPatient={() => setIsAddPatientOpen(true)}
          />
        )}

        {/* Patient Flow Tab */}
        {activeTab === 'patientflow' && (
          <PatientFlowPanel
            patients={patients}
            onOpenAddPatient={() => setIsAddPatientOpen(true)}
            onUpdatePatient={handleUpdatePatient}
            onDeletePatient={handleDeletePatient}
          />
        )}

        {/* Staff Roster Tab */}
        {activeTab === 'staff' && <StaffRosterPanel staff={staff} />}

        {/* AI Agent Activity Center Tab */}
        {activeTab === 'agentcenter' && (
          <AgentCenterPanel
            agentFindings={state?.agent_findings}
            validationResults={state?.validation_results}
            riskLevel={state?.risk_level}
            approvalStatus={state?.approval_status}
          />
        )}

        {/* Forecasts Tab */}
        {activeTab === 'predictions' && <PredictionsPanel />}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <ApprovalQueuePanel
            candidateActions={candidateActions}
            userRole={userRole}
            onApprove={handleApproveAction}
            onReject={handleRejectAction}
            onReassignBed={handleReassignBed}
            onSimulateSurge={handleTriggerCrisisScenario}
          />
        )}

        {/* Event Simulator Tab */}
        {activeTab === 'simulator' && (
          <EventSimulatorPanel onTriggerScenario={handleTriggerScenario} />
        )}

        {/* What-If Sandbox Tab */}
        {activeTab === 'whatif' && <WhatIfSandbox />}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && <AuditLogsPanel logs={auditLogs} />}
      </main>

      {/* Global Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        availableBeds={availableBeds}
        onAddPatient={handleCreatePatient}
      />

      <footer className="bg-[#151C2C] border-t border-[#242F46] py-3 text-center text-xs text-gray-500">
        HOSPITAL FLOW AI &copy; 2026 - Academic Research Prototype | Continuous Multi-Agent Operations Orchestrator
      </footer>
    </div>
  );
};

export default App;
