import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Clock,
  UserCheck,
  LayoutDashboard,
  BedDouble,
  Users,
  Cpu,
  TrendingUp,
  ShieldAlert,
  PlayCircle,
  SlidersHorizontal,
  History,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
  pendingApprovalsCount: number;
  onRunCrisisScenario: () => void;
  onRefreshState?: () => void;
  onOpenAddPatient?: () => void;
  onResetState?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  pendingApprovalsCount,
  onRunCrisisScenario,
  onRefreshState,
  onOpenAddPatient,
  onResetState
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Command Center', icon: LayoutDashboard },
    { id: 'bedmap', label: 'Live Bed Map', icon: BedDouble },
    { id: 'patientflow', label: 'Patient Triage', icon: Users },
    { id: 'staff', label: 'Staff Roster', icon: UserCheck },
    { id: 'agentcenter', label: 'AI Agent Center', icon: Cpu },
    { id: 'predictions', label: 'Forecasts', icon: TrendingUp },
    { id: 'approvals', label: 'Approvals', icon: ShieldAlert, count: pendingApprovalsCount },
    { id: 'simulator', label: 'Simulator', icon: PlayCircle },
    { id: 'whatif', label: 'What-If Digital Twin', icon: SlidersHorizontal },
    { id: 'audit', label: 'Audit Logs', icon: History },
  ];

  return (
    <header className="bg-[#111827]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-2xl transition-all">
      {/* Top Banner */}
      <div className="max-w-[1800px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & System Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur-sm opacity-70 animate-pulse"></div>
            <div className="relative bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-2.5 rounded-xl shadow-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-['Outfit']">
                HOSPITAL FLOW <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">AI</span>
              </h1>
              <span className="bg-blue-950/80 text-blue-300 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-500/40 font-mono tracking-wider shadow-inner">
                v1.0 • MULTI-AGENT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Real-Time Patient Flow & Bed Allocation Digital Twin</p>
          </div>
        </div>

        {/* Live Status & Quick Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live WebSocket Connection Pill */}
          <div className="hidden sm:flex items-center space-x-2 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] tracking-wide">LIVE TELEMETRY</span>
          </div>

          {/* Refresh State Button */}
          {onRefreshState && (
            <button
              onClick={onRefreshState}
              title="Refresh Hospital State"
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:border-slate-500"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Refresh</span>
            </button>
          )}

          {/* Reset Demo State Button */}
          {onResetState && (
            <button
              onClick={onResetState}
              title="Reset all beds, patients and queues to initial demo state"
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-amber-950/40 text-amber-300 border border-slate-700 hover:border-amber-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline">Reset State</span>
            </button>
          )}

          {/* Add Patient Button */}
          {onOpenAddPatient && (
            <button
              onClick={onOpenAddPatient}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs shadow-md shadow-blue-950/40 transition-all border border-blue-500/40"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Add Patient</span>
            </button>
          )}

          {/* Trigger Crisis Surge Scenario Button */}
          <button
            onClick={onRunCrisisScenario}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-red-900/40 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] border border-red-500/40"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>TRIGGER CRISIS SURGE</span>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 space-x-2 shadow-inner">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              aria-label="User Role"
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="DOCTOR" className="bg-slate-900 text-white">Doctor (Clinical Approver)</option>
              <option value="NURSE_MANAGER" className="bg-slate-900 text-white">Nurse Manager (Staff/Bed)</option>
              <option value="HOSPITAL_MANAGER" className="bg-slate-900 text-white">Hospital Admin (Operations)</option>
              <option value="ADMIN" className="bg-slate-900 text-white">Super Admin (All Access)</option>
            </select>
          </div>

          {/* Live System Clock */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-slate-300 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{time}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="max-w-[1800px] mx-auto px-4 flex space-x-1 overflow-x-auto scrollbar-none border-t border-slate-800/80 bg-slate-900/40 py-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-900/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse shadow-md shadow-red-900/50">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
