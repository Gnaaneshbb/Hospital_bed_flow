import React from 'react';
import { Play, Zap } from 'lucide-react';

interface EventSimulatorPanelProps {
  onTriggerScenario: (scenarioName: string) => void;
}

export const EventSimulatorPanel: React.FC<EventSimulatorPanelProps> = ({ onTriggerScenario }) => {
  const scenarios = [
    {
      id: 'SURGE_12_EMERGENCY',
      title: '12 Emergency Patient Surge (PRIMARY DEMO CRISIS)',
      desc: 'Simulates sudden arrival of 12 ER emergency patients (4 Critical, 4 High, 4 Moderate). Triggers full Multi-Agent Orchestration & Replanning.',
      badge: 'PRIMARY CRISIS DEMO',
      badgeColor: 'bg-red-600 text-white',
      isPrimary: true
    },
    {
      id: 'ICU_CAPACITY_CRISIS',
      title: 'ICU Near Capacity Crisis',
      desc: '95% of ICU beds become occupied with critical arrivals. Forces step-down transfer planning.',
      badge: 'ICU PRESSURE',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'WARD_BED_SHORTAGE',
      title: 'General Ward Bed Shortage',
      desc: 'Wards A and B reach 100% occupancy. Identifies discharge candidates.',
      badge: 'WARD DEFICIT',
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    {
      id: 'STAFF_SHORTAGE',
      title: 'ER & ICU Nursing Workload Overload',
      desc: 'Shift workload score reaches 98%. Recommends float nurse reassignment.',
      badge: 'STAFFING PRESS',
      badgeColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
    },
    {
      id: 'CLEANING_BOTTLENECK',
      title: 'Cleaning Bay Sanitization Bottleneck',
      desc: '4 dirty beds stuck in sanitization queue. Expedites bed cleaning tasks.',
      badge: 'CLEANING QUEUE',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    },
    {
      id: 'MASS_DISCHARGE',
      title: 'Mass Discharge Review Queue',
      desc: '6 stable ward patients flagged for physician discharge sign-off.',
      badge: 'DISCHARGE FLOW',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-[#151C2C] border border-[#242F46] rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Hospital Event Simulator &amp; Crisis Trigger Engine
          </h2>
          <p className="text-xs text-gray-400">Inject structured operational telemetry events to test multi-agent observe-reason-plan-validate-approve-replan workflow</p>
        </div>

        <button
          onClick={() => onTriggerScenario('SURGE_12_EMERGENCY')}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-xl shadow-red-900/40 transition-all transform hover:scale-[1.03]"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>RUN 12-PATIENT CRISIS DEMO</span>
        </button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((sc) => (
          <div
            key={sc.id}
            className={`border rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all duration-200 hover:border-blue-500 ${
              sc.isPrimary
                ? 'bg-gradient-to-br from-[#1E1B2E] to-[#151C2C] border-red-500/60 glow-critical'
                : 'bg-[#151C2C] border-[#242F46]'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${sc.badgeColor}`}>
                  {sc.badge}
                </span>
              </div>
              <h3 className="font-bold text-white text-base leading-snug">{sc.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{sc.desc}</p>
            </div>

            <button
              onClick={() => onTriggerScenario(sc.id)}
              className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                sc.isPrimary
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40'
                  : 'bg-[#0B0F19] hover:bg-[#1E293B] text-blue-400 border border-[#242F46]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Trigger Scenario</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
