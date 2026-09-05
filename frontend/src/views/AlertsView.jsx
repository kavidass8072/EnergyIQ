import React, { useState } from 'react';
import { ShieldAlert, Filter, CheckCircle2, AlertTriangle, Eye, AlertOctagon, Search } from 'lucide-react';

export default function AlertsView({ alerts, onInspectAlert }) {
  const [statusTab, setStatusTab] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredAlerts = alerts.filter(al => {
    // Status filter
    if (statusTab === 'RESOLVED' && al.status !== 'RESOLVED') return false;
    if (statusTab === 'FALSE_POSITIVE' && al.status !== 'FALSE_POSITIVE') return false;
    if (statusTab === 'ACTIVE' && al.status !== 'ACTIVE' && al.status !== 'UNDER_INVESTIGATION') return false;
    
    // Severity filter
    if (severityFilter !== 'ALL' && al.severity !== severityFilter) return false;

    // Search query
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const eq = al.equipment_id.toLowerCase();
      const fault = (al.likely_fault || '').toLowerCase();
      if (!eq.includes(q) && !fault.includes(q)) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" /> AI Anomaly & Fault Alert Center
          </h2>
          <p className="text-xs text-slate-500 mt-1">Real-time equipment fault links, baseline deviations, and physical evidence logs.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'ACTIVE', 'RESOLVED', 'FALSE_POSITIVE'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusTab === tab
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tab === 'FALSE_POSITIVE' ? 'False Positive' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter by asset or fault..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 font-medium">Severity Filter:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                severityFilter === sev
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Inbox Table */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Alert Inbox ({filteredAlerts.length} Matching)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Energy Draw</th>
                <th className="py-3 px-4">Expected</th>
                <th className="py-3 px-4">Deviation</th>
                <th className="py-3 px-4">Likely Fault Cause</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((al) => (
                  <tr key={al.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        al.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                        al.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {al.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{al.equipment_id}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{al.timestamp}</td>
                    <td className="py-3 px-4 font-mono text-red-600 font-bold">{al.energy_kwh} kWh</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{al.expected_kwh} kWh</td>
                    <td className="py-3 px-4 font-mono text-amber-700 font-bold">+{al.dev_pct}%</td>
                    <td className="py-3 px-4 text-slate-900 font-bold">{al.likely_fault}</td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-bold">{al.fault_confidence}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        al.status === 'REVIEWED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        al.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        al.status === 'FALSE_POSITIVE' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {al.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onInspectAlert(al)}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs border border-red-200 transition-all flex items-center gap-1 shadow-xs"
                      >
                        <Eye className="w-3 h-3 text-red-600" /> Inspect Evidence
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 text-xs font-medium">
                    ✓ Everything looks good. No active anomalies matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
