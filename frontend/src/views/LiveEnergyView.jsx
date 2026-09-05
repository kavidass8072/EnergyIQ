import React from 'react';
import { Zap, Sun, BatteryCharging, Building2, Activity, RefreshCw } from 'lucide-react';

export default function LiveEnergyView({ summary, powerFlow, equipment }) {
  const microgrid = summary?.microgrid || {
    solar_generation_kwh: 45.0,
    battery_soc_pct: 65.0,
    grid_consumption_kwh: 120.0,
    total_campus_load_kwh: 180.0
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-600" /> Live Energy Telemetry Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-1">Real-time microgrid power generation, storage state of charge, and equipment draw.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto Sync Active (15s)
        </div>
      </div>

      {/* Real-time Power Mix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-amber-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase">Solar Generation</span>
            <Sun className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600 font-mono mt-3">{microgrid.solar_generation_kwh} <span className="text-xs font-normal text-slate-500">kWh</span></p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Photovoltaic Array Output</p>
        </div>

        <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase">Battery Storage (BESS)</span>
            <BatteryCharging className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-emerald-700 font-mono mt-3">{microgrid.battery_soc_pct}% <span className="text-xs font-normal text-slate-500">SoC</span></p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Energy Storage Reserve</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase">Grid Electricity Import</span>
            <Building2 className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-3xl font-black text-slate-700 font-mono mt-3">{microgrid.grid_consumption_kwh} <span className="text-xs font-normal text-slate-500">kWh</span></p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Utility Substation Import</p>
        </div>

        <div className="p-5 bg-white border border-red-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 uppercase">Total Campus Demand</span>
            <Activity className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-black text-red-600 font-mono mt-3">{microgrid.total_campus_load_kwh} <span className="text-xs font-normal text-slate-500">kWh</span></p>
          <p className="text-[10px] text-slate-500 font-medium mt-1">Facility Aggregate Load</p>
        </div>
      </div>

      {/* Live Telemetry Data Table */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          Real-Time Asset Telemetry Stream
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Asset Type</th>
                <th className="py-3 px-4">Operating State</th>
                <th className="py-3 px-4">Current Power Draw</th>
                <th className="py-3 px-4">Production Setpoint</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Anomaly Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {equipment.map(eq => (
                <tr key={eq.equipment_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{eq.equipment_id}</td>
                  <td className="py-3 px-4 text-slate-500">{eq.equipment_type}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{eq.operating_state}</td>
                  <td className="py-3 px-4 font-mono font-bold text-red-600">{eq.energy_kwh} kWh</td>
                  <td className="py-3 px-4 text-slate-600">{eq.production_output || 0} units/hr</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{eq.temperature || 40.0} °C</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      eq.alert_severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
                      eq.alert_severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {eq.alert_severity || 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
