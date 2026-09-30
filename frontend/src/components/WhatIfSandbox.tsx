import React, { useState } from 'react';
import type { WhatIfResult } from '../types/hospital';
import { runWhatIfSimulation } from '../services/api';
import { Cpu, Play, Sparkles, AlertTriangle } from 'lucide-react';

export const WhatIfSandbox: React.FC = () => {
  const [criticalCount, setCriticalCount] = useState<number>(15);
  const [timeframeMins, setTimeframeMins] = useState<number>(20);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WhatIfResult | null>(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await runWhatIfSimulation({
        additional_critical_patients: criticalCount,
        timeframe_mins: timeframeMins,
        current_icu_available: 1,
        current_ward_available: 3
      });
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#151C2C] border border-[#242F46] rounded-xl p-5 shadow-lg space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Digital Twin &quot;What-If&quot; Scenario Sandbox
          </h2>
          <p className="text-xs text-gray-400">Run forward-projected capacity simulations over cloned hospital state WITHOUT modifying live hospital records</p>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0B0F19] p-4 rounded-xl border border-[#242F46] items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Hypothetical Critical ER Arrivals:</label>
            <input
              type="number"
              value={criticalCount}
              onChange={(e) => setCriticalCount(parseInt(e.target.value) || 0)}
              className="w-full bg-[#151C2C] border border-[#242F46] rounded-lg p-2 text-white font-bold text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Time Horizon (Minutes):</label>
            <input
              type="number"
              value={timeframeMins}
              onChange={(e) => setTimeframeMins(parseInt(e.target.value) || 0)}
              className="w-full bg-[#151C2C] border border-[#242F46] rounded-lg p-2 text-white font-bold text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs shadow-lg shadow-purple-900/30 flex items-center justify-center space-x-2 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{loading ? 'Simulating...' : 'RUN WHAT-IF SIMULATION'}</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Comparison Cards: Current vs Predicted State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current State Summary */}
            <div className="bg-[#151C2C] border border-[#242F46] rounded-xl p-5 shadow-lg space-y-3">
              <h3 className="font-bold text-white text-base border-b border-[#242F46] pb-2">Current State Snapshot</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">ICU Available Beds:</span>
                  <span className="font-bold text-emerald-400">{result.current_state_summary.icu_available}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Ward Available Beds:</span>
                  <span className="font-bold text-emerald-400">{result.current_state_summary.ward_available}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">ER Waiting Patients:</span>
                  <span className="font-bold text-white">{result.current_state_summary.er_waiting}</span>
                </div>
              </div>
            </div>

            {/* Predicted State Summary */}
            <div className="bg-[#151C2C] border border-red-500/50 rounded-xl p-5 shadow-lg space-y-3 glow-critical">
              <h3 className="font-bold text-red-300 text-base border-b border-red-500/30 pb-2">Predicted State (+{timeframeMins} mins)</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Simulated Critical Patients:</span>
                  <span className="font-bold text-white">{result.predicted_state_summary.incoming_patients}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-800">
                  <span className="text-gray-400">Predicted ICU Bed Deficit:</span>
                  <span className="font-bold text-red-400 text-sm">{result.predicted_state_summary.predicted_icu_deficit} BEDS SHORT</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">Projected ER Triage Wait:</span>
                  <span className="font-bold text-amber-400">{result.predicted_state_summary.predicted_er_wait_mins} Mins</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Bottlenecks */}
          <div className="bg-[#151C2C] border border-[#242F46] rounded-xl p-5 shadow-lg space-y-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Detected Operational Bottlenecks
            </h3>
            <div className="space-y-2">
              {result.detected_bottlenecks.map((bot, idx) => (
                <div key={idx} className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-lg text-amber-200 text-xs font-semibold">
                  {bot}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Actions & Expected Outcome */}
          <div className="bg-[#151C2C] border border-[#242F46] rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Recommended Multi-Agent Interventions &amp; Expected Outcome
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.recommended_interventions.map((act) => (
                <div key={act.action_id} className="bg-[#0B0F19] border border-[#242F46] p-4 rounded-xl space-y-2 text-xs">
                  <span className="font-bold text-purple-400 font-mono block">{act.action_id}: {act.action_type}</span>
                  <p className="text-gray-200 font-semibold">{act.reason}</p>
                  <p className="text-emerald-400 font-semibold text-[11px] pt-1">Benefit: {act.expected_benefit}</p>
                </div>
              ))}
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl text-xs space-y-1">
              <span className="font-bold text-emerald-300 block uppercase tracking-wider">PROJECTED CAPACITY GAIN</span>
              <p className="text-gray-200">{result.expected_capacity_gain.icu_capacity_gain}</p>
              <p className="text-gray-300">{result.expected_capacity_gain.er_wait_time_reduction}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
