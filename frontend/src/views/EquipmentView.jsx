import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Clock, Wrench, ShieldAlert, RefreshCw } from 'lucide-react';
import { fetchEquipmentHistory, fetchAlerts, fetchMaintenanceOverview } from '../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function EquipmentView({ equipmentList, selectedEquipmentId, onSelectEquipment, onInspectAlert }) {
  const [activeAssetId, setActiveAssetId] = useState(selectedEquipmentId || (equipmentList[0]?.equipment_id || 'HVAC-01'));
  const [history, setHistory] = useState([]);
  const [assetAlerts, setAssetAlerts] = useState([]);
  const [assetMaintenance, setAssetMaintenance] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (selectedEquipmentId) {
      setActiveAssetId(selectedEquipmentId);
    }
  }, [selectedEquipmentId]);

  useEffect(() => {
    async function loadAssetDetails() {
      if (!activeAssetId) return;
      setLoadingHistory(true);
      try {
        const [histRes, alertRes, maintRes] = await Promise.all([
          fetchEquipmentHistory(activeAssetId, 72),
          fetchAlerts(null, null, activeAssetId),
          fetchMaintenanceOverview()
        ]);
        setHistory(histRes.history || []);
        setAssetAlerts(alertRes.alerts || []);
        const filteredMaint = (maintRes.tasks || []).filter(t => t.equipment_id === activeAssetId);
        setAssetMaintenance(filteredMaint);
      } catch (err) {
        console.error("Error loading asset detail:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadAssetDetails();
  }, [activeAssetId]);

  const activeAsset = equipmentList.find(e => e.equipment_id === activeAssetId) || equipmentList[0];
  const latestAlert = assetAlerts.find(a => a.status === 'ACTIVE') || assetAlerts[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Asset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-red-600" /> Equipment Health & Diagnostic Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-1">Select an asset to view historical curves, baseline deviations, and maintenance logs.</p>
        </div>

        {/* Asset Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {equipmentList.map(eq => (
            <button
              key={eq.equipment_id}
              onClick={() => setActiveAssetId(eq.equipment_id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeAssetId === eq.equipment_id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {eq.equipment_id}
            </button>
          ))}
        </div>
      </div>

      {activeAsset && (
        <>
          {/* Detailed Asset Banner */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-black text-slate-900">{activeAsset.equipment_id}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {activeAsset.equipment_type}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    activeAsset.health_score < 65 ? 'bg-red-100 text-red-700 border border-red-200' :
                    activeAsset.health_score < 85 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    Health Score: {activeAsset.health_score || 95} / 100 ● {activeAsset.health_status || 'Healthy'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">Last Telemetry Timestamp: {activeAsset.timestamp}</p>
              </div>

              {latestAlert && (
                <button
                  onClick={() => onInspectAlert(latestAlert)}
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all flex items-center gap-2 shadow-xs"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600" /> Inspect Active Alert Evidence
                </button>
              )}
            </div>

            {/* Metric Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Current Energy</p>
                <p className="text-lg font-black font-mono text-red-600 mt-1">{activeAsset.energy_kwh} kWh</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Operating State</p>
                <p className="text-sm font-extrabold text-slate-800 mt-1">{activeAsset.operating_state}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Production Rate</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{activeAsset.production_output || 0} units/hr</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Anomaly Score</p>
                <p className="text-sm font-black font-mono text-amber-700 mt-1">
                  {activeAsset.anomaly_score ? (activeAsset.anomaly_score * 100).toFixed(1) : '0.0'}%
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Maintenance Age</p>
                <p className="text-sm font-bold text-slate-800 mt-1">{activeAsset.maintenance_days} days</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Likely Fault</p>
                <p className="text-xs font-black text-red-600 truncate mt-1">{activeAsset.active_fault || 'None'}</p>
              </div>
            </div>
          </div>

          {/* Historical Energy Chart */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" /> Historical Energy Consumption vs Baseline (72 Hours)
            </h3>

            {loadingHistory ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-red-600 mr-2" /> Loading energy curve history...
              </div>
            ) : (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 9 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" kWh" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.875rem', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Line type="monotone" dataKey="energy_kwh" name="Actual Draw (kWh)" stroke="#dc2626" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="expected_kwh" name="Expected Baseline (kWh)" stroke="#16a34a" strokeDasharray="4 4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Maintenance & Timeline Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" /> Health & Severity Timeline Log
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {history.slice(-10).reverse().map((h, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-slate-500">{h.timestamp}</span>
                      <span className="ml-3 font-semibold text-slate-800">State: {h.operating_state}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-red-600 font-bold">{h.energy_kwh} kWh</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        h.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                        h.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {h.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Log */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-600" /> Maintenance Records & Schedule
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {assetMaintenance.length > 0 ? (
                  assetMaintenance.map(m => (
                    <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Task #{m.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === 'OVERDUE' ? 'bg-red-100 text-red-700 border border-red-200' :
                          m.status === 'IN_PROGRESS' ? 'bg-red-50 text-red-600 border border-red-200' :
                          m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <p className="text-slate-700">{m.issue_description}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-medium">
                        <span>Tech: {m.assigned_technician}</span>
                        <span>Due: {m.due_date}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-8">No maintenance tasks logged for {activeAsset.equipment_id}.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
