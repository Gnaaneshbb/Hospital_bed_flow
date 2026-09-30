import React, { useState } from 'react';
import type { Patient } from '../types/hospital';
import { Users, CheckCircle, Clock, HeartPulse, UserPlus, Trash2, ArrowUpDown } from 'lucide-react';

interface PatientFlowPanelProps {
  patients: Patient[];
  onOpenAddPatient?: () => void;
  onUpdatePatient?: (patientId: string, update: Partial<Patient>) => Promise<void>;
  onDeletePatient?: (patientId: string) => Promise<void>;
}

export const PatientFlowPanel: React.FC<PatientFlowPanelProps> = ({
  patients,
  onOpenAddPatient,
  onUpdatePatient,
  onDeletePatient
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredPatients = filterSeverity === 'ALL'
    ? patients
    : patients.filter(p => p.severity === filterSeverity);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">CRITICAL</span>;
      case 'HIGH':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">HIGH</span>;
      case 'MODERATE':
        return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">MODERATE</span>;
      default:
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">LOW</span>;
    }
  };

  const handleToggleVitals = async (patient: Patient) => {
    if (!onUpdatePatient) return;
    setUpdatingId(patient.id);
    try {
      const nextVitals = patient.vitalsStatus === 'STABLE' ? 'UNSTABLE' : 'STABLE';
      await onUpdatePatient(patient.id, { vitalsStatus: nextVitals });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleClearance = async (patient: Patient) => {
    if (!onUpdatePatient) return;
    setUpdatingId(patient.id);
    try {
      await onUpdatePatient(patient.id, { physicianClearance: !patient.physicianClearance });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (patient: Patient) => {
    if (!onDeletePatient) return;
    if (confirm(`Discharge & remove patient ${patient.patientCode}?`)) {
      setUpdatingId(patient.id);
      try {
        await onDeletePatient(patient.id);
      } finally {
        setUpdatingId(null);
      }
    }
  };

  return (
    <div className="bg-[#151C2C] border border-[#242F46] rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#242F46] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Patient Operational Triage &amp; Care Level Demand Queue
            <span className="text-xs text-slate-400 font-normal">({filteredPatients.length} patients)</span>
          </h2>
          <p className="text-xs text-gray-400">
            Real-time patient census. Click vitals or clearance to toggle telemetry &amp; test agent replanning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter Tabs */}
          <div className="flex items-center space-x-1 bg-[#0B0F19] border border-[#242F46] p-1 rounded-lg text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                  filterSeverity === sev
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {onOpenAddPatient && (
            <button
              onClick={onOpenAddPatient}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-950/40 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* Patient Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#0B0F19] text-gray-400 font-semibold border-b border-[#242F46]">
            <tr>
              <th className="py-3 px-4">Patient Code</th>
              <th className="py-3 px-4">Demographics</th>
              <th className="py-3 px-4">Triage Priority</th>
              <th className="py-3 px-4">Care Level</th>
              <th className="py-3 px-4">Assigned Bed</th>
              <th className="py-3 px-4">Vitals (Click to Toggle)</th>
              <th className="py-3 px-4">Physician Clearance</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242F46]/60">
            {filteredPatients.map((patient) => {
              const isBusy = updatingId === patient.id;
              return (
                <tr key={patient.id} className="hover:bg-[#1E293B]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-cyan-300">
                      {patient.patientCode}
                    </span>
                  </td>
                  <td className="py-3 px-4">{patient.age} yrs ({patient.gender})</td>
                  <td className="py-3 px-4">{getSeverityBadge(patient.severity)}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-blue-300 font-mono text-[11px]">{patient.requiredCareLevel}</span>
                  </td>
                  <td className="py-3 px-4">
                    {patient.assignedBedId ? (
                      <span className="font-mono text-xs font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                        {patient.assignedBedId.replace('BED-', '')}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">ER Queue</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      disabled={isBusy || !onUpdatePatient}
                      onClick={() => handleToggleVitals(patient)}
                      title="Click to toggle vitals between STABLE and UNSTABLE"
                      className={`font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 transition-all ${
                        patient.vitalsStatus === 'STABLE'
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/60'
                          : 'bg-red-950/50 text-red-400 border-red-500/30 hover:bg-red-900/60 animate-pulse'
                      }`}
                    >
                      <HeartPulse className="w-3 h-3" />
                      <span>{patient.vitalsStatus}</span>
                      <ArrowUpDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      disabled={isBusy || !onUpdatePatient}
                      onClick={() => handleToggleClearance(patient)}
                      title="Click to toggle physician discharge/step-down clearance"
                      className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 font-semibold transition-all ${
                        patient.physicianClearance
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {patient.physicianClearance ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          <span>Cleared</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>Pending</span>
                        </>
                      )}
                      <ArrowUpDown className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      patient.status === 'ER_WAITING' ? 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse' :
                      patient.status === 'ADMITTED_ICU' ? 'bg-purple-950/60 text-purple-300 border border-purple-500/40' :
                      'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {onDeletePatient && (
                      <button
                        disabled={isBusy}
                        onClick={() => handleDelete(patient)}
                        title="Discharge and remove patient from hospital"
                        className="text-slate-400 hover:text-red-400 p-1 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
