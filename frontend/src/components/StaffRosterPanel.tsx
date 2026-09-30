import React from 'react';
import type { Staff } from '../types/hospital';
import { UserCheck, AlertTriangle } from 'lucide-react';

interface StaffRosterPanelProps {
  staff: Staff[];
}

export const StaffRosterPanel: React.FC<StaffRosterPanelProps> = ({ staff }) => {
  const overloadedCount = staff.filter(s => s.workloadScore >= 85).length;

  return (
    <div className="bg-[#151C2C] border border-[#242F46] rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#242F46] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" />
            Clinical Staff Workload Roster & Departmental Balancing
          </h2>
          <p className="text-xs text-gray-400">Real-time physician, nursing, and cleaning staff workload tracking</p>
        </div>

        {overloadedCount > 0 && (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            {overloadedCount} Staff Member(s) Overloaded (&gt;85% Workload)
          </span>
        )}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => {
          const isOverloaded = s.workloadScore >= 85;
          return (
            <div
              key={s.id}
              className={`bg-[#0B0F19] border rounded-xl p-4 space-y-3 shadow-md transition-all hover:border-blue-500/50 ${
                isOverloaded ? 'border-amber-500/50 bg-amber-950/10' : 'border-[#242F46]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">{s.name}</h3>
                  <p className="text-xs text-gray-400">{s.staffCode} | {s.role}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  s.departmentCode === 'ER' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                }`}>
                  {s.departmentCode}
                </span>
              </div>

              {/* Workload Gauge */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Workload Score:</span>
                  <span className={`font-bold ${isOverloaded ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {s.workloadScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isOverloaded ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${s.workloadScore}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-800">
                <span>Shift: <strong className="text-white">{s.shift}</strong></span>
                <span>Status: <strong className={isOverloaded ? 'text-amber-400' : 'text-emerald-400'}>{s.status}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
