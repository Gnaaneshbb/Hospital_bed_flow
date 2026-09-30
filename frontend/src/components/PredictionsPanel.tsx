import React from 'react';
import { TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const PredictionsPanel: React.FC = () => {
  const forecastData = [
    { time: 'Now', icuDemand: 9, icuCapacity: 10, wardDemand: 16, wardCapacity: 20 },
    { time: '+15 min', icuDemand: 11, icuCapacity: 10, wardDemand: 18, wardCapacity: 20 },
    { time: '+30 min', icuDemand: 13, icuCapacity: 10, wardDemand: 21, wardCapacity: 20 },
    { time: '+60 min', icuDemand: 12, icuCapacity: 10, wardDemand: 19, wardCapacity: 20 },
    { time: '+4 hrs', icuDemand: 8, icuCapacity: 10, wardDemand: 14, wardCapacity: 20 },
  ];

  return (
    <div className="bg-[#151C2C] border border-[#242F46] rounded-xl p-5 shadow-lg space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#242F46] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Operational Capacity & Pressure Demand Forecast
            </h2>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              OPERATIONAL FORECAST
            </span>
          </div>
          <p className="text-xs text-gray-400">Statistical baseline & predictive capacity modeling across 15m, 30m, 60m, and 4h horizons</p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-[#0B0F19] px-3 py-1.5 rounded-lg border border-[#242F46]">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">Model: Hybrid Monte-Carlo Baseline</span>
        </div>
      </div>

      {/* Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ICU Demand Forecast Chart */}
        <div className="bg-[#0B0F19] border border-[#242F46] p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-sm">ICU Demand vs Bed Capacity Threshold</h3>
            <span className="text-xs text-red-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Shortage @ +30m
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242F46" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 16]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151C2C', borderColor: '#242F46', color: '#FFF', borderRadius: '8px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="icuDemand" name="ICU Demand" stroke="#EF4444" fill="#EF4444" fillOpacity={0.25} />
                <Area type="monotone" dataKey="icuCapacity" name="ICU Bed Limit" stroke="#10B981" fill="#10B981" fillOpacity={0.05} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ward Demand Forecast Chart */}
        <div className="bg-[#0B0F19] border border-[#242F46] p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-sm">Ward Demand vs Bed Capacity Threshold</h3>
            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> High Pressure @ +30m
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242F46" />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 25]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#151C2C', borderColor: '#242F46', color: '#FFF', borderRadius: '8px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="wardDemand" name="Ward Demand" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.25} />
                <Area type="monotone" dataKey="wardCapacity" name="Ward Bed Limit" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.05} strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
