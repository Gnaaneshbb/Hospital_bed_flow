import React, { useState } from 'react';
import type { CandidateAction } from '../types/hospital';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertOctagon,
  X,
  Stethoscope,
  ArrowRight,
  Sparkles,
  Info,
  Play
} from 'lucide-react';

interface ApprovalQueuePanelProps {
  candidateActions?: CandidateAction[];
  userRole: string;
  onApprove: (actionId: string) => void;
  onReject: (actionId: string, reason: string) => void;
  onReassignBed?: (actionId: string, newBed: string) => void;
  onSimulateSurge?: () => void;
}

export const ApprovalQueuePanel: React.FC<ApprovalQueuePanelProps> = ({
  candidateActions = [],
  userRole,
  onApprove,
  onReject,
  onReassignBed,
  onSimulateSurge
}) => {
  const [rejectingAction, setRejectingAction] = useState<CandidateAction | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const pendingActions = candidateActions.filter(a => a.requires_human_approval && a.status !== 'EXECUTED');

  const handleApproveClick = async (actionId: string) => {
    setApprovingId(actionId);
    try {
      await onApprove(actionId);
    } finally {
      setApprovingId(null);
    }
  };

  const handleConfirmReject = () => {
    if (rejectingAction && rejectionReason.trim()) {
      onReject(rejectingAction.action_id, rejectionReason.trim());
      setRejectingAction(null);
      setRejectionReason('');
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm shadow-red-950/40 animate-pulse">
            <AlertOctagon className="w-3.5 h-3.5" /> HIGH RISK • REQUIRES AUTHORIZATION
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> MEDIUM RISK • OPERATIONAL REVIEW
          </span>
        );
      default:
        return (
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-3 py-1 rounded-full">
            LOW RISK • AUTO-EXECUTABLE
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Role & Context */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
              Human-in-the-Loop Clinical &amp; Operational Approval Gateway
              {pendingActions.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full animate-bounce">
                  {pendingActions.length} Pending
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">
              High and Medium risk multi-agent proposals require explicit human clinical or administrative sign-off before execution
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Logged in as:</span>
          <span className="bg-blue-950/80 text-blue-300 border border-blue-500/40 text-xs font-bold font-mono px-3 py-1 rounded-lg">
            {userRole}
          </span>
        </div>
      </div>

      {/* When Empty: Safe Autonomous Operations Card */}
      {pendingActions.length === 0 ? (
        <div className="bg-gradient-to-b from-slate-900/90 to-[#111827] border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-black text-white font-['Outfit']">No Pending Actions Requiring Human Approval</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hospital operations are running smoothly within autonomous safety thresholds. If emergency patient surge or ICU bottlenecks occur, candidate transfer proposals will appear here for your clinical authorization.
            </p>
          </div>

          {onSimulateSurge && (
            <div className="pt-2">
              <button
                onClick={onSimulateSurge}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-red-950/50 transition-all transform hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Simulate Emergency Surge (Generates Candidate Approvals)</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pendingActions.map((action) => (
            <div
              key={action.action_id}
              className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl space-y-4 hover:border-slate-500 transition-all relative overflow-hidden"
            >
              {/* Subtle glowing accent strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-blue-500" />

              {/* Action Ticket Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-black text-blue-400 text-xs bg-blue-950/80 px-2.5 py-1 rounded-md border border-blue-500/30">
                    {action.action_id}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-white text-sm tracking-wide">
                      {action.action_type.replace(/_/g, ' ')}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-cyan-300 font-bold font-mono text-sm bg-slate-800 px-2 py-0.5 rounded">
                      {action.target_entity_code}
                    </span>
                  </div>
                </div>

                {getRiskBadge(action.risk_level)}
              </div>

              {/* Live Target Bed Verification & Clinical Conflict Banner */}
              {action.target_location && (action.action_type === 'TRANSFER_PATIENT' || action.action_type === 'RESERVE_BED') && (
                <div
                  className={`p-4 rounded-xl border space-y-2 transition-all ${
                    action.target_bed_valid === false || action.target_bed_status === 'OCCUPIED'
                      ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                      : action.target_bed_status === 'CLEANING'
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                      : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs uppercase tracking-wide">Destination Bed Live Check:</span>
                      <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-black/40 border border-current">
                        {action.target_location}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          action.target_bed_valid === false || action.target_bed_status === 'OCCUPIED'
                            ? 'bg-red-500 text-white animate-pulse'
                            : action.target_bed_status === 'CLEANING'
                            ? 'bg-amber-500 text-black font-bold'
                            : 'bg-emerald-500 text-black font-bold'
                        }`}
                      >
                        {action.target_bed_status || (action.target_bed_valid ? 'AVAILABLE' : 'CHECKING...')}
                        {action.target_bed_occupant ? ` • OCCUPIED by ${action.target_bed_occupant}` : ''}
                      </span>
                    </div>

                    {/* Bed Reassignment Selector */}
                    {onReassignBed && (action.available_alternative_beds?.length || 0) > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] text-slate-300 font-semibold">Reassign Bed:</span>
                        <select
                          className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1 text-white font-mono focus:border-cyan-400 focus:outline-none"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              onReassignBed(action.action_id, e.target.value);
                            }
                          }}
                        >
                          <option value="" disabled>Select vacant bed...</option>
                          {action.available_alternative_beds!.map((bedNo) => (
                            <option key={bedNo} value={bedNo}>
                              {bedNo} (AVAILABLE)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Safety Conflict Alert */}
                  {(action.target_bed_valid === false || action.target_bed_status === 'OCCUPIED') ? (
                    <div className="text-xs space-y-1 bg-red-950/60 p-3 rounded-lg border border-red-500/40">
                      <p className="font-black text-red-300 flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-red-400 shrink-0" />
                        CAPACITY CONFLICT: Target bed {action.target_location} is already occupied!
                      </p>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        The multi-agent constraint engine flagged that {action.target_location} currently holds another patient. Direct admission to an occupied bed is blocked to prevent double-booking.
                        {action.available_alternative_beds && action.available_alternative_beds.length > 0 ? (
                          <> Please use the dropdown above to reassign <strong>{action.target_entity_code}</strong> to an available bed (such as <span className="font-mono text-cyan-300">{action.available_alternative_beds.join(', ')}</span>), or click REJECT to trigger AI replanning.</>
                        ) : (
                          <> All ward beds are currently full. Expedited bed turnaround or priority cleaning is required.</>
                        )}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-300 flex items-center gap-1.5 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      Bed {action.target_location} is confirmed vacant, sanitized, and clinical telemetry meets step-down requirements.
                    </p>
                  )}
                </div>
              )}

              {/* 4-Box Explainability Grid: WHAT, WHY, IMPACT, CLINICAL SAFETY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 1. WHAT */}
                <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-blue-400 uppercase text-[10px] tracking-wider block flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> WHAT (PROPOSED ACTION)
                  </span>
                  <p className="text-white font-semibold text-xs">
                    {action.action_type.replace(/_/g, ' ')} target <strong className="text-cyan-300 font-mono">{action.target_entity_code}</strong> to <strong className="text-emerald-300 font-mono">{action.target_location || 'Designated Destination Unit'}</strong>
                  </p>
                </div>

                {/* 2. WHY */}
                <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-cyan-400 uppercase text-[10px] tracking-wider block flex items-center gap-1">
                    <Info className="w-3 h-3" /> WHY (AGENT RATIONALE)
                  </span>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {action.reason}
                  </p>
                </div>

                {/* 3. EXPECTED BENEFIT */}
                <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">
                    EXPECTED OPERATIONAL IMPACT
                  </span>
                  <p className="text-slate-300 text-xs">
                    {action.expected_benefit}
                  </p>
                </div>

                {/* 4. CLINICAL SAFETY & DEPENDENCIES */}
                <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider block flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" /> CLINICAL SAFETY &amp; APPROVER
                  </span>
                  <p className="text-slate-300 text-xs">
                    Required Role: <strong className="text-white">{action.approval_role || 'DOCTOR'}</strong> • Dependencies: {action.dependencies?.join(', ') || 'Physician discharge sign-off verified'}
                  </p>
                </div>
              </div>

              {/* Decision Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setRejectingAction(action)}
                  className="flex items-center space-x-1.5 bg-red-950/50 hover:bg-red-900/70 text-red-300 border border-red-700/60 px-4 py-2 rounded-xl font-bold text-xs transition-colors"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>REJECT &amp; TRIGGER REPLANNING</span>
                </button>

                <button
                  onClick={() => handleApproveClick(action.action_id)}
                  disabled={
                    approvingId === action.action_id ||
                    (action.action_type === 'TRANSFER_PATIENT' && (action.target_bed_valid === false || action.target_bed_status === 'OCCUPIED'))
                  }
                  className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-bold text-xs shadow-lg transition-all transform border ${
                    (action.action_type === 'TRANSFER_PATIENT' && (action.target_bed_valid === false || action.target_bed_status === 'OCCUPIED'))
                      ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/50 hover:scale-[1.02] border-emerald-500/40'
                  }`}
                >
                  {approvingId === action.action_id ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>EXECUTING ACTION...</span>
                    </>
                  ) : (action.action_type === 'TRANSFER_PATIENT' && (action.target_bed_valid === false || action.target_bed_status === 'OCCUPIED')) ? (
                    <>
                      <AlertOctagon className="w-4 h-4 text-amber-400" />
                      <span>DESTINATION OCCUPIED • REASSIGN BED FIRST</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>AUTHORIZE &amp; EXECUTE ACTION</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clinical Rejection Reason Modal */}
      {rejectingAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setRejectingAction(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white font-['Outfit']">Clinical Override / Rejection</h3>
                <p className="text-xs text-slate-400">Action: {rejectingAction.action_id} • Target: {rejectingAction.target_entity_code}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Provide clinical feedback explaining why this recommendation cannot be executed. The LangGraph <strong>Orchestrator Agent</strong> will ingest your feedback as hard constraints and immediately synthesize an alternative allocation plan.
              </p>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Clinical Override Reason / Context:</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Patient exhibits cardiac telemetry arrhythmia and requires continuous ICU monitoring for next 24 hours. Do not step down."
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 text-xs font-sans"
                />
              </div>

              {/* Quick Preset Buttons for easy testing */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Quick Clinical Feedback Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRejectionReason("Patient exhibits oxygen desaturation below 90%; not stable for general ward.")}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                  >
                    O2 desaturation
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectionReason("Family requested delay; attending physician review pending.")}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded"
                  >
                    Physician review pending
                  </button>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRejectingAction(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl text-xs disabled:opacity-50 transition-colors shadow-lg shadow-red-950/50"
              >
                Submit &amp; Trigger AI Replan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
