import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, IndianRupee, ShieldAlert, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { fetchAnalyticsSummary, fetchAlerts, fetchAllEquipment } from '../services/api';

export default function AIInsightsView({ onInspectEquipment, onInspectAlert }) {
  const [analytics, setAnalytics] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [aRes, eRes, alRes] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchAllEquipment(),
          fetchAlerts()
        ]);
        setAnalytics(aRes);
        setEquipment(eRes.equipment || []);
        setAlerts(alRes.alerts || []);
      } catch (err) {
        console.error("AI Insights load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3 text-slate-500 text-xs font-semibold">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p>Synthesizing AI energy drift patterns and fault insights...</p>
      </div>
    );
  }

  // Calculate highest risk assets
  const highRiskAssets = equipment.filter(e => e.alert_severity === 'CRITICAL' || e.alert_severity === 'HIGH');
  const wasteList = analytics?.energy_waste?.by_equipment || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-black text-slate-900">AI Energy Insights & Predictive Recommendations</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Automated intelligence analyzing campus power consumption patterns, equipment degradation signals, and energy waste reduction opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Highest Risk Equipment */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Highest Risk Equipment Assets
          </h3>
          <div className="space-y-3">
            {highRiskAssets.length > 0 ? (
              highRiskAssets.map(eq => (
                <div key={eq.equipment_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900">{eq.equipment_id}</span>
                    <span className="text-[10px] text-slate-500 ml-2 font-medium">({eq.equipment_type})</span>
                    <p className="text-amber-700 font-bold mt-1">{eq.active_fault || 'Energy Anomaly Detected'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Maintenance Age: {eq.maintenance_days} days</p>
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => onInspectEquipment(eq.equipment_id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200 transition-all flex items-center gap-1 shadow-xs"
                    >
                      View Asset <ArrowRight className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 font-medium">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                No high-risk equipment currently flagged.
              </div>
            )}
          </div>
        </div>

        {/* 2. Emerging Energy Drift Patterns */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" /> Emerging Energy Drift & Baseline Deviations
          </h3>
          <div className="space-y-3">
            {alerts.slice(0, 3).map(al => (
              <div key={al.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{al.equipment_id}</span>
                  <span className="font-mono text-amber-700 font-bold">+{al.dev_pct}% Deviation</span>
                </div>
                <p className="text-slate-800 font-bold">{al.likely_fault}</p>
                <p className="text-[10px] text-slate-500 font-medium">Actual: {al.energy_kwh} kWh | Expected Baseline: {al.expected_kwh} kWh</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Energy Waste & Financial Savings Opportunities */}
      <div className="p-6 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-600" /> Energy Waste & Cost Savings Opportunities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wasteList.map(w => (
            <div key={w.equipment_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-900">{w.equipment_id}</span>
              <p className="text-red-600 font-mono font-bold">Waste: {w.waste_kwh} kWh</p>
              <p className="text-emerald-700 font-mono font-black">Avoidable Cost: ₹{w.waste_cost_inr.toLocaleString()}</p>
              <p className="text-[10px] text-slate-500 pt-1 font-medium">Action: Inspect mechanical load & seals</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
