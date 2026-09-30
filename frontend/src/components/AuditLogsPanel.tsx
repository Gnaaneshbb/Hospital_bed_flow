import React, { useState } from 'react';
import type { AuditLog } from '../types/hospital';
import { FileText, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditLogsPanelProps {
  logs?: AuditLog[];
}

export const AuditLogsPanel: React.FC<AuditLogsPanelProps> = ({ logs = [] }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = logs.filter(log =>
    log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.inputRef && log.inputRef.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-[#151C2C] border border-[#242F46] rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#242F46] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            System Auditability &amp; Agent Decision Trail
          </h2>
          <p className="text-xs text-gray-400">Complete immutable record of all agent telemetry runs, recommendations, human approvals, and rejections</p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit logs..."
            className="bg-[#0B0F19] border border-[#242F46] rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#0B0F19] text-gray-400 font-semibold border-b border-[#242F46]">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Event Name</th>
              <th className="py-3 px-4">Input Reference</th>
              <th className="py-3 px-4">Decision</th>
              <th className="py-3 px-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242F46]/60">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500 italic">
                  No audit log entries recorded.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-[#1E293B]/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="py-3 px-4 font-bold text-white">{log.actor}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-300">{log.eventName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-400">{log.inputRef || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.decision === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400' :
                          log.decision === 'REJECTED' ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-300'
                        }`}>
                          {log.decision || 'LOGGED'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                        >
                          <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && log.executionResultJson && (
                      <tr className="bg-[#0B0F19]/80">
                        <td colSpan={6} className="p-4 border-b border-[#242F46]">
                          <pre className="bg-black/60 p-3 rounded text-[11px] font-mono text-emerald-400 overflow-x-auto border border-gray-800">
                            {log.executionResultJson}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
