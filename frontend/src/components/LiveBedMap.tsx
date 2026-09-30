import React, { useState } from 'react';
import type { Bed, Patient } from '../types/hospital';
import {
  BedDouble,
  Clock,
  Lock,
  X,
  Filter,
  User,
  HeartPulse,
  Sparkles,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';

interface LiveBedMapProps {
  beds: Bed[];
  patients: Patient[];
  onUpdateBedStatus?: (bedId: string, status: string, patientId?: string | null, estimatedAvailableMins?: number) => Promise<void>;
  onOpenAddPatient?: () => void;
}

export const LiveBedMap: React.FC<LiveBedMapProps> = ({ beds, patients, onUpdateBedStatus, onOpenAddPatient }) => {
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [updatingBed, setUpdatingBed] = useState<boolean>(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const departments = [
    { code: 'ICU', label: 'Intensive Care Unit (ICU)', desc: 'High Acuity & Ventilator Telemetry' },
    { code: 'WARD_A', label: 'General Ward A (Medical)', desc: 'Post-Acute & Medical Recovery' },
    { code: 'WARD_B', label: 'General Ward B (Surgical)', desc: 'Post-Surgical & Step-Down' },
    { code: 'ER', label: 'Emergency Triage & Resus', desc: 'Rapid Assessment & Holding' },
  ];

  const getBedStatusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-gradient-to-b from-emerald-950/40 to-slate-900 border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/30';
      case 'OCCUPIED':
        return 'bg-gradient-to-b from-rose-950/40 to-slate-900 border-red-500/40 text-red-300 hover:border-red-400 hover:shadow-lg hover:shadow-red-950/30';
      case 'CLEANING':
        return 'bg-gradient-to-b from-amber-950/40 to-slate-900 border-amber-500/40 text-amber-300 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-950/30';
      case 'RESERVED':
        return 'bg-gradient-to-b from-purple-950/40 to-slate-900 border-purple-500/40 text-purple-300 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-950/30';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-400';
    }
  };

  const getBedStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> AVAILABLE
          </span>
        );
      case 'OCCUPIED':
        return (
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> OCCUPIED
          </span>
        );
      case 'CLEANING':
        return (
          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" /> CLEANING
          </span>
        );
      case 'RESERVED':
        return (
          <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" /> RESERVED
          </span>
        );
      default:
        return null;
    }
  };

  const getPatientForBed = (patientId?: string | null) => {
    if (!patientId) return null;
    return patients.find(p => p.id === patientId || p.patientCode === patientId);
  };

  // Filtered beds
  const filteredBeds = beds.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesDept = deptFilter === 'ALL' || b.departmentCode === deptFilter;
    return matchesStatus && matchesDept;
  });

  const availableCount = beds.filter(b => b.status === 'AVAILABLE').length;
  const occupiedCount = beds.filter(b => b.status === 'OCCUPIED').length;
  const cleaningCount = beds.filter(b => b.status === 'CLEANING').length;
  const reservedCount = beds.filter(b => b.status === 'RESERVED').length;

  return (
    <div className="space-y-4">
      {/* Header and Interactive Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <BedDouble className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                Live Hospital Digital Twin Bed Layout Map
                <span className="text-xs font-normal text-slate-400 font-sans">({filteredBeds.length} of {beds.length} beds shown)</span>
              </h2>
              <p className="text-[11px] text-slate-400">Click any bed for clinical telemetry, telemetry history, and patient flow recommendations</p>
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({beds.length})
            </button>
            <button
              onClick={() => setStatusFilter('AVAILABLE')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                statusFilter === 'AVAILABLE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Available ({availableCount})
            </button>
            <button
              onClick={() => setStatusFilter('OCCUPIED')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                statusFilter === 'OCCUPIED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span> Occupied ({occupiedCount})
            </button>
            <button
              onClick={() => setStatusFilter('CLEANING')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                statusFilter === 'CLEANING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/40'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Cleaning ({cleaningCount})
            </button>
            {reservedCount > 0 && (
              <button
                onClick={() => setStatusFilter('RESERVED')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  statusFilter === 'RESERVED'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-purple-400"></span> Reserved ({reservedCount})
              </button>
            )}

            {onOpenAddPatient && (
              <button
                onClick={onOpenAddPatient}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all ml-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>+ Add Patient</span>
              </button>
            )}
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center space-x-1 border-t border-slate-800/80 pt-2 text-xs overflow-x-auto scrollbar-none">
          <span className="text-slate-500 font-medium mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Unit:
          </span>
          <button
            onClick={() => setDeptFilter('ALL')}
            className={`px-2.5 py-0.5 rounded-md font-medium ${deptFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            All Units
          </button>
          {departments.map(d => (
            <button
              key={d.code}
              onClick={() => setDeptFilter(d.code)}
              className={`px-2.5 py-0.5 rounded-md font-medium whitespace-nowrap ${deptFilter === d.code ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              {d.label.split(' ')[0]} {d.label.includes('ICU') ? '(ICU)' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Hospital Wards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments
          .filter(d => deptFilter === 'ALL' || d.code === deptFilter)
          .map((dept) => {
            const deptBeds = filteredBeds.filter(b => b.departmentCode === dept.code);
            const totalInDept = beds.filter(b => b.departmentCode === dept.code).length;
            const availInDept = beds.filter(b => b.departmentCode === dept.code && b.status === 'AVAILABLE').length;

            return (
              <div key={dept.code} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                {/* Ward Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-sm font-['Outfit']">
                        {dept.label}
                      </h3>
                      {dept.code === 'ICU' && (
                        <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/30 whitespace-nowrap">
                          CRITICAL CARE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{dept.desc} • {totalInDept} Total Units</p>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border shrink-0 whitespace-nowrap ${
                    availInDept === 0 ? 'bg-red-950/80 text-red-300 border-red-500/40' :
                    availInDept === 1 ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' :
                    'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {availInDept} Available
                  </span>
                </div>

                {/* Bed Cards Matrix */}
                {deptBeds.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 italic">
                    No beds match the current filter in this unit.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {deptBeds.map((bed) => {
                      const patient = getPatientForBed(bed.currentPatientId);
                      const isCriticalVital = patient?.severity === 'CRITICAL' || patient?.vitalsStatus === 'UNSTABLE';

                      return (
                        <div
                          key={bed.id}
                          onClick={() => setSelectedBed(bed)}
                          className={`border rounded-xl p-2.5 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] relative group ${getBedStatusStyle(bed.status)} ${
                            isCriticalVital ? 'ring-1 ring-red-500/50' : ''
                          }`}
                        >
                          {/* Bed Top Row: Identifier & Acuity */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-black text-xs text-white font-mono tracking-tight group-hover:text-blue-300">
                              {bed.bedNumber}
                            </span>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-1 py-0.5 rounded">
                              {bed.bedType}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <div className="mb-1.5">
                            {getBedStatusBadge(bed.status)}
                          </div>

                          {/* If Occupied: Patient Summary Mini-Strip */}
                          {patient ? (
                            <div className="pt-1.5 border-t border-slate-700/50 text-[11px] space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200 truncate flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  {patient.patientCode}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {patient.age}{patient.gender}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-slate-400">Vitals:</span>
                                <span className={`font-bold flex items-center gap-0.5 ${
                                  patient.vitalsStatus === 'STABLE' ? 'text-emerald-400' :
                                  patient.vitalsStatus === 'GUARDED' ? 'text-amber-400' : 'text-red-400 animate-pulse'
                                }`}>
                                  <HeartPulse className="w-2.5 h-2.5" />
                                  {patient.vitalsStatus}
                                </span>
                              </div>
                            </div>
                          ) : bed.status === 'AVAILABLE' ? (
                            <div className="pt-1.5 border-t border-emerald-500/20 text-[10px] text-emerald-400/80 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Sanitized &amp; Ready</span>
                            </div>
                          ) : (
                            <div className="pt-1.5 border-t border-amber-500/20 text-[10px] text-amber-400/80 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Turnaround in prog.</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Bed Details Diagnostic Drawer / Modal */}
      {selectedBed && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedBed(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center space-x-3.5 border-b border-slate-800 pb-4">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white font-['Outfit']">Bed Telemetry: {selectedBed.bedNumber}</h3>
                  <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                    {selectedBed.bedType}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Department: {selectedBed.departmentCode} • Active Digital Twin Sensor Feed</p>
              </div>
            </div>

            {/* Modal Body Info */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Bed Allocation Status</span>
                  <div className="mt-1">{getBedStatusBadge(selectedBed.status)}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Equipment Installed</span>
                  <span className="text-slate-200 font-medium">
                    {selectedBed.bedType === 'ICU' ? '🫁 Ventilator, 🫀 Multi-lead Monitor, 💉 IV Infusion' : '🫀 Standard Vitals Monitor, O2 Line'}
                  </span>
                </div>
              </div>

              {/* Patient Profile If Occupied */}
              {selectedBed.currentPatientId && (
                <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-blue-400" />
                      Assigned Patient Profile
                    </span>
                    <span className="text-blue-400 font-mono font-bold text-xs">{selectedBed.currentPatientId}</span>
                  </div>

                  {getPatientForBed(selectedBed.currentPatientId) ? (
                    (() => {
                      const p = getPatientForBed(selectedBed.currentPatientId)!;
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Patient Code &amp; Demographics:</span>
                            <span className="text-white font-bold">{p.patientCode} ({p.age} yrs, {p.gender})</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Triage Acuity Priority:</span>
                            <span className={`font-bold ${p.severity === 'CRITICAL' ? 'text-red-400' : p.severity === 'HIGH' ? 'text-amber-400' : 'text-blue-300'}`}>
                              {p.severity}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Continuous Vitals:</span>
                            <span className={`font-bold ${p.vitalsStatus === 'STABLE' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {p.vitalsStatus}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Physician Discharge Sign-off:</span>
                            <span className={p.physicianClearance ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                              {p.physicianClearance ? '✓ Cleared for Transfer/Discharge' : '⏳ Pending Examination'}
                            </span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <p className="text-slate-400">Patient telemetry loading...</p>
                  )}
                </div>
              )}

              {/* Manual Operational Controls */}
              {onUpdateBedStatus && (
                <div className="bg-slate-900/90 p-4 rounded-xl border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Manual Bed Status Override &amp; Patient Assignment
                    </span>
                    {updatingBed && (
                      <span className="text-[10px] text-cyan-400 animate-pulse font-mono">Syncing...</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Instantly toggle bed state between Available, Occupied, and Cleaning to test capacity workflows &amp; multi-agent re-planning.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      disabled={updatingBed || selectedBed.status === 'AVAILABLE'}
                      onClick={async () => {
                        setUpdatingBed(true);
                        try {
                          await onUpdateBedStatus(selectedBed.id, 'AVAILABLE');
                          setSelectedBed(prev => prev ? { ...prev, status: 'AVAILABLE', currentPatientId: null, estimatedAvailableMins: 0 } : null);
                        } finally {
                          setUpdatingBed(false);
                        }
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                        selectedBed.status === 'AVAILABLE'
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-800/60'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Available</span>
                    </button>

                    <button
                      disabled={updatingBed || selectedBed.status === 'CLEANING'}
                      onClick={async () => {
                        setUpdatingBed(true);
                        try {
                          await onUpdateBedStatus(selectedBed.id, 'CLEANING', null, 15);
                          setSelectedBed(prev => prev ? { ...prev, status: 'CLEANING', currentPatientId: null, estimatedAvailableMins: 15 } : null);
                        } finally {
                          setUpdatingBed(false);
                        }
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                        selectedBed.status === 'CLEANING'
                          ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 cursor-default'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-700/50 hover:bg-amber-800/60'
                      }`}
                    >
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Cleaning</span>
                    </button>

                    <button
                      disabled={updatingBed || selectedBed.status === 'OCCUPIED'}
                      onClick={async () => {
                        const defaultPat = patients.find(p => p.status === 'ER_WAITING' || !p.assignedBedId) || patients[0];
                        const patId = selectedPatientId || defaultPat?.id || 'PAT-P103';
                        setUpdatingBed(true);
                        try {
                          await onUpdateBedStatus(selectedBed.id, 'OCCUPIED', patId);
                          setSelectedBed(prev => prev ? { ...prev, status: 'OCCUPIED', currentPatientId: patId } : null);
                        } finally {
                          setUpdatingBed(false);
                        }
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                        selectedBed.status === 'OCCUPIED'
                          ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50 cursor-default'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-700/50 hover:bg-rose-800/60'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      <span>Occupied</span>
                    </button>

                    <button
                      disabled={updatingBed || selectedBed.status === 'RESERVED'}
                      onClick={async () => {
                        setUpdatingBed(true);
                        try {
                          await onUpdateBedStatus(selectedBed.id, 'RESERVED');
                          setSelectedBed(prev => prev ? { ...prev, status: 'RESERVED' } : null);
                        } finally {
                          setUpdatingBed(false);
                        }
                      }}
                      className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                        selectedBed.status === 'RESERVED'
                          ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 cursor-default'
                          : 'bg-purple-950/60 text-purple-300 border border-purple-700/50 hover:bg-purple-800/60'
                      }`}
                    >
                      <Lock className="w-3 h-3 text-purple-400" />
                      <span>Reserved</span>
                    </button>
                  </div>

                  {/* Patient Assignment Picker if setting or changing occupant */}
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400">Assign Patient:</span>
                    <select
                      value={selectedPatientId || selectedBed.currentPatientId || ''}
                      onChange={async (e) => {
                        const newPatId = e.target.value;
                        setSelectedPatientId(newPatId);
                        if (newPatId) {
                          setUpdatingBed(true);
                          try {
                            await onUpdateBedStatus(selectedBed.id, 'OCCUPIED', newPatId);
                            setSelectedBed(prev => prev ? { ...prev, status: 'OCCUPIED', currentPatientId: newPatId } : null);
                          } finally {
                            setUpdatingBed(false);
                          }
                        }
                      }}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs focus:outline-none"
                    >
                      <option value="">Select patient to assign...</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.patientCode} ({p.severity}, {p.vitalsStatus}) {p.assignedBedId ? `[Current: ${p.assignedBedId}]` : '[ER Waiting]'}
                        </option>
                      ))}
                    </select>

                    {selectedBed.status === 'OCCUPIED' && (
                      <button
                        onClick={async () => {
                          setUpdatingBed(true);
                          try {
                            await onUpdateBedStatus(selectedBed.id, 'AVAILABLE');
                            setSelectedBed(prev => prev ? { ...prev, status: 'AVAILABLE', currentPatientId: null } : null);
                          } finally {
                            setUpdatingBed(false);
                          }
                        }}
                        className="bg-slate-800 hover:bg-red-950/50 text-red-300 border border-red-500/30 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                      >
                        Discharge Patient &amp; Free Bed
                      </button>
                    )}

                    {selectedBed.status === 'CLEANING' && (
                      <button
                        onClick={async () => {
                          setUpdatingBed(true);
                          try {
                            await onUpdateBedStatus(selectedBed.id, 'AVAILABLE');
                            setSelectedBed(prev => prev ? { ...prev, status: 'AVAILABLE', currentPatientId: null, estimatedAvailableMins: 0 } : null);
                          } finally {
                            setUpdatingBed(false);
                          }
                        }}
                        className="bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-400" />
                        Finish Cleaning Now
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Multi-Agent Recommendation Box */}
              <div className="bg-blue-950/30 border border-blue-500/30 p-3.5 rounded-xl space-y-1">
                <span className="font-bold text-blue-300 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Multi-Agent Flow Insight
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {selectedBed.status === 'OCCUPIED' && selectedBed.bedType === 'ICU'
                    ? 'Discharge Review Agent is monitoring telemetry stability. If patient vitals remain stable, an automated step-down proposal will be created to maintain ICU buffer.'
                    : selectedBed.status === 'AVAILABLE'
                    ? 'Bed is fully sanitized and indexed by Bed Management Agent. Available for immediate emergency triage allocation.'
                    : 'Sanitization turnaround scheduled. Cleaning task assigned to housekeeping staff.'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedBed(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                Close Telemetry View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
