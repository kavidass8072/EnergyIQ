import React, { useState, useEffect } from 'react';
import { FileText, Printer, RefreshCw } from 'lucide-react';
import { generateReport } from '../services/api';

export default function ReportsView() {
  const [reportType, setReportType] = useState('system_health');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      try {
        const res = await generateReport(reportType);
        setReportData(res);
      } catch (err) {
        console.error("Report generation error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [reportType]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" /> Executive Report Generator
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Generate, audit, and print formal campus energy intelligence & fault inspection reports.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Report Type Selector */}
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
          >
            <option value="system_health">System Health Report</option>
            <option value="anomaly">Anomaly & Fault Report</option>
            <option value="evaluation">Model Evaluation Report</option>
            <option value="maintenance">Maintenance Audit Report</option>
            <option value="cost">Cost Impact & Savings Report</option>
          </select>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document View */}
      {loading ? (
        <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3 text-slate-500 text-xs font-semibold">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
          <p>Compiling executive report metrics...</p>
        </div>
      ) : reportData && (
        <div className="bg-white p-8 border border-slate-200 shadow-xl rounded-3xl space-y-6 text-slate-800 print:shadow-none print:border-none print:p-0">
          {/* Report Document Header */}
          <div className="border-b border-slate-200 pb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-red-600 font-black text-lg">
                <span>EnergyIQ</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-50 font-mono text-red-700 border border-red-200">CAMPUS INTELLIGENCE</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-2">{reportData.title}</h1>
              <p className="text-xs text-slate-500 font-medium mt-1 max-w-2xl">{reportData.summary}</p>
            </div>
            <div className="text-right font-mono text-xs text-slate-500 space-y-1">
              <p><b className="text-slate-800">Report ID:</b> {reportData.report_id}</p>
              <p><b className="text-slate-800">Facility:</b> {reportData.facility}</p>
              <p><b className="text-slate-800">Generated:</b> {reportData.generated_at}</p>
            </div>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Total Monitored Assets</p>
              <p className="text-xl font-black text-slate-900 mt-1 font-mono">{reportData.kpis.total_equipment}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Active Anomaly Alerts</p>
              <p className="text-xl font-black text-amber-700 mt-1 font-mono">{reportData.kpis.active_alerts}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Historical Anomalies</p>
              <p className="text-xl font-black text-red-600 mt-1 font-mono">{reportData.kpis.total_historical_alerts}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Logged Maintenance Tasks</p>
              <p className="text-xl font-black text-emerald-700 mt-1 font-mono">{reportData.kpis.maintenance_tasks_count}</p>
            </div>
          </div>

          {/* Recent Anomalies Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Recent Equipment Anomaly Observations
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                    <th className="py-2.5 px-3">Asset</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Energy Draw</th>
                    <th className="py-2.5 px-3">Likely Fault</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {reportData.recent_alerts?.slice(0, 8).map(al => (
                    <tr key={al.id}>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{al.equipment_id}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{al.timestamp}</td>
                      <td className="py-2.5 px-3 font-bold text-red-600">{al.severity}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{al.energy_kwh} kWh</td>
                      <td className="py-2.5 px-3 text-slate-800 font-bold">{al.likely_fault}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">{al.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Document Footer Sign-off */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Generated by EnergyIQ Automated Intelligence Engine v2.0</span>
            <span>Commercial Campus Facilities Division</span>
          </div>
        </div>
      )}
    </div>
  );
}
