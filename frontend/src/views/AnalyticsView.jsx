import React, { useState, useEffect } from 'react';
import { BarChart3, Sun, BatteryCharging, Building2, TrendingDown, Cpu, RefreshCw } from 'lucide-react';
import { fetchAnalyticsSummary } from '../services/api';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export default function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetchAnalyticsSummary();
        setData(res);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3 text-slate-500 text-xs font-semibold">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p>Calculating equipment efficiency & microgrid energy analytics...</p>
      </div>
    );
  }

  const equipmentMetrics = data?.equipment_metrics || [];
  const energySources = data?.energy_sources || {};
  const energyWaste = data?.energy_waste || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-red-600" /> Advanced Energy & Equipment Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-1">Multi-asset energy efficiency benchmarks, wasted power breakdown, and renewable supply contribution.</p>
      </div>

      {/* Energy Source Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Solar Card */}
        <div className="p-5 bg-white border border-amber-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase">☀️ Solar Contribution</span>
            <Sun className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600 font-mono mt-3">{energySources.solar_contribution_pct}%</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Avg Output: {energySources.avg_solar_kwh} kWh/hr</p>
        </div>

        {/* Battery Card */}
        <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase">🔋 Battery Storage</span>
            <BatteryCharging className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700 font-mono mt-3">{energySources.avg_battery_soc_pct}% <span className="text-xs font-normal text-slate-500">Avg SoC</span></p>
          <p className="text-xs text-slate-500 font-medium mt-1">Peak Storage Buffer Active</p>
        </div>

        {/* Grid Reliance Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase">⚡ Grid Reliance</span>
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-3xl font-black text-slate-800 font-mono mt-3">{energySources.grid_dependence_pct}%</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Est Grid Cost: ₹{energySources.estimated_grid_cost_inr?.toLocaleString()}</p>
        </div>
      </div>

      {/* Equipment Comparison Chart */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-red-600" /> Equipment Average Power Consumption vs Baseline Benchmark
        </h3>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={equipmentMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="equipment_id" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit=" kWh" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.875rem', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="avg_consumption_kwh" name="Actual Average Draw (kWh)" fill="#dc2626" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expected_baseline_kwh" name="Expected Baseline (kWh)" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy Waste Breakdown Table */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" /> Energy Waste & Inefficiency Cost Breakdown
          </h3>
          <span className="text-xs text-red-600 font-extrabold font-mono">
            Total Waste: {energyWaste.total_wasted_kwh} kWh (₹{energyWaste.total_waste_cost_inr?.toLocaleString()})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Equipment ID</th>
                <th className="py-3 px-4">Total Wasted Energy</th>
                <th className="py-3 px-4">Alert Trigger Count</th>
                <th className="py-3 px-4">Estimated Waste Cost (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {energyWaste.by_equipment?.map((item) => (
                <tr key={item.equipment_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.equipment_id}</td>
                  <td className="py-3 px-4 font-mono font-bold text-red-600">{item.waste_kwh} kWh</td>
                  <td className="py-3 px-4 font-mono text-amber-700 font-bold">{item.alert_count} alerts</td>
                  <td className="py-3 px-4 font-mono font-black text-emerald-700">₹{item.waste_cost_inr.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
