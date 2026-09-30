import React from 'react';
import type { Bed, Patient, Staff } from '../types/hospital';
import { Activity, AlertTriangle, BedDouble, Clock, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

interface KPIOverviewProps {
  beds: Bed[];
  patients: Patient[];
  staff: Staff[];
  riskLevel?: string;
  approvalStatus?: string;
  bottlenecks?: string[];
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({
  beds,
  patients,
  staff,
  riskLevel = 'LOW',
  approvalStatus = 'NORMAL',
  bottlenecks = []
}) => {
  const totalICU = beds.filter(b => b.bedType === 'ICU');
  const occupiedICU = totalICU.filter(b => b.status === 'OCCUPIED');
  const icuOccupancyPct = totalICU.length > 0 ? Math.round((occupiedICU.length / totalICU.length) * 100) : 0;
  const availableICU = totalICU.filter(b => b.status === 'AVAILABLE').length;

  const totalWard = beds.filter(b => b.bedType === 'WARD');
  const occupiedWard = totalWard.filter(b => b.status === 'OCCUPIED');
  const wardOccupancyPct = totalWard.length > 0 ? Math.round((occupiedWard.length / totalWard.length) * 100) : 0;
  const availableWard = totalWard.filter(b => b.status === 'AVAILABLE').length;

  const totalBedsCount = beds.length;
  const availableBedsCount = beds.filter(b => b.status === 'AVAILABLE').length;
  const cleaningBedsCount = beds.filter(b => b.status === 'CLEANING').length;
  const reservedBedsCount = beds.filter(b => b.status === 'RESERVED').length;

  const erWaitingPatients = patients.filter(p => p.status === 'ER_WAITING');
  const criticalErWaiting = erWaitingPatients.filter(p => p.severity === 'CRITICAL');
  const highErWaiting = erWaitingPatients.filter(p => p.severity === 'HIGH');
  const dischargeCandidatesCount = patients.filter(p => p.vitalsStatus === 'STABLE' && p.status === 'ADMITTED_WARD').length;
  const overloadedStaffCount = staff.filter(s => s.workloadScore >= 85).length;

  // Executive summary message
  const getExecutiveSummary = () => {
    if (riskLevel === 'HIGH' || icuOccupancyPct >= 90) {
      return {
        level: 'CRITICAL',
        title: 'High ICU Surge & Capacity Alert Active',
        description: `ICU occupancy is at ${icuOccupancyPct}% with only ${availableICU} ICU bed left. Automated step-down transfers and discharge reviews are recommended.`,
        bg: 'from-red-950/80 via-rose-950/60 to-slate-900',
        border: 'border-red-500/60',
        text: 'text-red-300'
      };
    }
    if (erWaitingPatients.length > 3) {
      return {
        level: 'WARNING',
        title: 'Elevated Emergency Triage Influx',
        description: `${erWaitingPatients.length} patients currently waiting in ER queue (${criticalErWaiting.length} Critical). Accelerating bed cleaning and allocation.`,
        bg: 'from-amber-950/80 via-orange-950/60 to-slate-900',
        border: 'border-amber-500/60',
        text: 'text-amber-300'
      };
    }
    return {
      level: 'OPTIMAL',
      title: 'Hospital Operating Flow Within Safe Boundaries',
      description: `All units balanced. ${availableBedsCount} total beds ready for immediate intake, ${cleaningBedsCount} beds currently in turnaround sanitization.`,
      bg: 'from-slate-900 via-blue-950/30 to-slate-900',
      border: 'border-slate-800',
      text: 'text-slate-300'
    };
  };

  const summary = getExecutiveSummary();

  return (
    <div className="space-y-4">
      {/* Executive Operational Summary Banner */}
      <div className={`bg-gradient-to-r ${summary.bg} border ${summary.border} rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 transition-all duration-300`}>
        <div className="flex items-center space-x-3.5">
          <div className={`p-2.5 rounded-xl shadow-md ${
            summary.level === 'CRITICAL' ? 'bg-red-600/90 text-white animate-pulse' :
            summary.level === 'WARNING' ? 'bg-amber-600 text-white' : 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
          }`}>
            {summary.level === 'CRITICAL' ? <AlertTriangle className="w-5 h-5" /> :
             summary.level === 'WARNING' ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded ${
                summary.level === 'CRITICAL' ? 'bg-red-500 text-white' :
                summary.level === 'WARNING' ? 'bg-amber-500 text-slate-900 font-bold' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {approvalStatus !== 'NORMAL' && approvalStatus !== 'IDLE' ? approvalStatus : `${summary.level} STATUS`}
              </span>
              <h3 className="font-bold text-white text-sm font-['Outfit']">{summary.title}</h3>
            </div>
            <p className={`text-xs ${summary.text} mt-0.5`}>
              {bottlenecks.length > 0 ? bottlenecks[0] : summary.description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400">Governance Mode: </span>
            <span className="font-bold text-cyan-300">Continuous AI Guardrails</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-700/60 px-3 py-1.5 rounded-lg">
            <span className="text-slate-400">Total Census: </span>
            <span className="font-bold text-white">{totalBedsCount - availableBedsCount} / {totalBedsCount} Beds</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ICU Occupancy */}
        <div className={`bg-gradient-to-b from-slate-900 to-[#111827] border rounded-2xl p-4 shadow-xl transition-all duration-200 hover:border-slate-600 ${
          icuOccupancyPct >= 85 ? 'border-red-500/50 shadow-red-950/20' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ICU Occupancy</span>
            <div className={`p-2 rounded-xl ${
              icuOccupancyPct >= 85 ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/10 text-blue-400'
            }`}>
              <BedDouble className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1.5">
              <span className={`text-3xl font-black font-['Outfit'] ${
                icuOccupancyPct >= 85 ? 'text-red-400' : icuOccupancyPct >= 70 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {icuOccupancyPct}%
              </span>
              <span className="text-xs font-medium text-slate-400">capacity</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
              icuOccupancyPct >= 85 ? 'bg-red-950/80 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-300'
            }`}>
              {availableICU === 1 ? '1 BED LEFT' : `${availableICU} Avail`}
            </span>
          </div>

          {/* Visual Progress Meter */}
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                icuOccupancyPct >= 85 ? 'bg-gradient-to-r from-red-600 to-rose-500' :
                icuOccupancyPct >= 70 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
                'bg-gradient-to-r from-emerald-500 to-teal-400'
              }`}
              style={{ width: `${Math.min(icuOccupancyPct, 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>{occupiedICU.length} occupied of {totalICU.length} beds</span>
            <span className={icuOccupancyPct >= 85 ? 'text-red-400 font-bold' : 'text-slate-400'}>
              {icuOccupancyPct >= 85 ? 'High Surge Risk' : 'Normal Operations'}
            </span>
          </div>
        </div>

        {/* 2. Ward Occupancy */}
        <div className="bg-gradient-to-b from-slate-900 to-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl transition-all duration-200 hover:border-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ward Occupancy</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black font-['Outfit'] text-white">
                {wardOccupancyPct}%
              </span>
              <span className="text-xs font-medium text-slate-400">capacity</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              {availableWard} Avail
            </span>
          </div>

          {/* Visual Progress Meter */}
          <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${Math.min(wardOccupancyPct, 100)}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span>{occupiedWard.length} occupied of {totalWard.length} beds</span>
            <span className="text-emerald-400 font-semibold">Stable Capacity</span>
          </div>
        </div>

        {/* 3. ER Waiting Queue */}
        <div className={`bg-gradient-to-b from-slate-900 to-[#111827] border rounded-2xl p-4 shadow-xl transition-all duration-200 hover:border-slate-600 ${
          criticalErWaiting.length > 0 ? 'border-red-500/60 shadow-red-950/20' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ER Waiting Queue</span>
            <div className={`p-2 rounded-xl ${
              criticalErWaiting.length > 0 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-blue-500/10 text-blue-400'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-black font-['Outfit'] ${
                erWaitingPatients.length > 0 ? 'text-amber-400' : 'text-white'
              }`}>
                {erWaitingPatients.length}
              </span>
              <span className="text-xs font-medium text-slate-400">patients waiting</span>
            </div>
            {criticalErWaiting.length > 0 ? (
              <span className="text-xs font-black px-2 py-0.5 rounded-md bg-red-500 text-white animate-bounce shadow">
                {criticalErWaiting.length} CRITICAL
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                0 Critical
              </span>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Needs: {erWaitingPatients.filter(p => p.requiredCareLevel === 'ICU').length} ICU • {erWaitingPatients.filter(p => p.requiredCareLevel === 'WARD').length} Ward</span>
            <span className="text-blue-400 font-medium">Triage Priority 1-4</span>
          </div>

          <div className="mt-1 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Avg Wait Time: &lt;12 mins</span>
            {highErWaiting.length > 0 && <span className="text-amber-400 font-semibold">{highErWaiting.length} High Urgency</span>}
          </div>
        </div>

        {/* 4. Total Available Beds & Turnaround */}
        <div className="bg-gradient-to-b from-slate-900 to-[#111827] border border-slate-800 rounded-2xl p-4 shadow-xl transition-all duration-200 hover:border-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Ready Beds</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black font-['Outfit'] text-emerald-400">
                {availableBedsCount}
              </span>
              <span className="text-xs font-medium text-slate-400">ready for admission</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40">
              {cleaningBedsCount} Sanitizing
            </span>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Discharge Candidates: <strong className="text-white font-bold">{dischargeCandidatesCount}</strong></span>
            {reservedBedsCount > 0 && <span className="text-purple-400">{reservedBedsCount} Reserved</span>}
          </div>

          <div className="mt-1 text-[11px] flex items-center justify-between">
            <span className="text-slate-500">Nurse Roster Balance</span>
            {overloadedStaffCount > 0 ? (
              <span className="text-rose-400 font-semibold">⚠️ {overloadedStaffCount} Nurses Overloaded</span>
            ) : (
              <span className="text-emerald-400 font-semibold">✓ Ratios Compliant</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
