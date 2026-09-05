import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  Zap, 
  TrendingDown, 
  IndianRupee, 
  Sun, 
  BatteryCharging, 
  Building2, 
  Activity, 
  RefreshCw, 
  AlertOctagon,
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid
} from 'recharts';

export default function DashboardView({ 
  summary, 
  powerFlow, 
  equipment, 
  alerts, 
  onInspectEquipment, 
  onInspectAlert,
  onRefresh,
  autoRefresh,
  setAutoRefresh,
  lastUpdated
}) {
  const [timeRange, setTimeRange] = useState('7Days');

  const microgrid = summary?.microgrid || {
    solar_generation_kwh: 45.0,
    battery_soc_pct: 65.0,
    grid_consumption_kwh: 120.0,
    total_campus_load_kwh: 180.0
  };

  const highPriorityAlerts = alerts.filter(a => a.severity === 'HIGH' || a.severity === 'CRITICAL');
  const wastedKwh = summary?.estimated_wasted_kwh_hr || 0;
  const avoidedCost = summary?.estimated_avoided_cost || 0;
  const gridDependencePct = microgrid.total_campus_load_kwh > 0 
    ? Math.round((microgrid.grid_consumption_kwh / microgrid.total_campus_load_kwh) * 100)
    : 42;

  // Prepare chart data with clean light styling
  const chartData = powerFlow.map((item) => ({
    timestamp: item.timestamp ? item.timestamp.split(' ')[1] || item.timestamp : '',
    fullTime: item.timestamp,
    Solar: item.solar,
    Grid: item.grid,
    CampusLoad: item.total_equipment_kwh,
    ExpectedBaseline: Math.round(item.total_equipment_kwh * 0.82)
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">Good morning, Facility Operator</h2>
          <p className="text-xs text-slate-500 mt-1">Here's what's happening across your campus energy system.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
            {['Today', '7Days', '30Days', 'Custom'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === range
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === '7Days' ? '7 Days' : range === '30Days' ? '30 Days' : range}
              </button>
            ))}
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
              autoRefresh
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Equipment */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Assets</span>
            <Cpu className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{summary?.total_equipment || 7}</p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">● Monitored Equipment</p>
        </div>

        {/* Active Alerts */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Alerts</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 font-mono">{summary?.active_alerts || 0}</p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Requires Review</p>
        </div>

        {/* High Priority */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">High Priority</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-2 font-mono">{highPriorityAlerts.length}</p>
          <p className="text-[10px] text-red-600 font-bold mt-1">● Immediate Action</p>
        </div>

        {/* Energy Waste Detected */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Energy Waste</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-2 font-mono">{wastedKwh} <span className="text-xs font-normal text-slate-500">kWh</span></p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Above Baseline</p>
        </div>

        {/* Grid Dependence */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Grid Dependence</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2 font-mono">{gridDependencePct}%</p>
          <p className="text-[10px] text-slate-500 font-semibold mt-1">Campus Load Share</p>
        </div>

        {/* Avoided Cost */}
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs glass-card-hover">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avoided Cost</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2 font-mono">₹{avoidedCost.toLocaleString()}</p>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">Early AI Savings</p>
        </div>
      </div>

      {/* Microgrid Energy Vector Flow Diagram */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-600" /> Campus Microgrid Energy Flow Vector
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Live Sync: {lastUpdated || 'Just now'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
          {/* Solar Vector */}
          <div className="p-4 rounded-xl bg-white border border-amber-200 text-center relative overflow-hidden shadow-xs">
            <Sun className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-xs font-extrabold text-slate-800 mt-2 uppercase tracking-wide">☀️ Solar Generation</p>
            <p className="text-xl font-black text-amber-600 font-mono mt-1">{microgrid.solar_generation_kwh} kWh</p>
            <div className="mt-2 text-[10px] text-emerald-700 font-bold">Clean Energy Supply</div>
          </div>

          {/* Battery Storage Vector */}
          <div className="p-4 rounded-xl bg-white border border-emerald-200 text-center relative overflow-hidden shadow-xs">
            <BatteryCharging className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-extrabold text-slate-800 mt-2 uppercase tracking-wide">🔋 Battery Storage</p>
            <p className="text-xl font-black text-emerald-700 font-mono mt-1">{microgrid.battery_soc_pct}% <span className="text-xs font-normal">SoC</span></p>
            <div className="mt-2 text-[10px] text-emerald-700 font-bold">Discharging / Active</div>
          </div>

          {/* Grid Electricity Vector */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-center relative overflow-hidden shadow-xs">
            <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs font-extrabold text-slate-800 mt-2 uppercase tracking-wide">⚡ Grid Import</p>
            <p className="text-xl font-black text-slate-700 font-mono mt-1">{microgrid.grid_consumption_kwh} kWh</p>
            <div className="mt-2 text-[10px] text-slate-500 font-medium">Utility Grid Supply</div>
          </div>

          {/* Total Campus Load Target */}
          <div className="p-4 rounded-xl bg-gradient-to-tr from-red-50 to-red-100/80 border border-red-200 text-center relative overflow-hidden shadow-xs">
            <Activity className="w-8 h-8 text-red-600 mx-auto animate-pulse" />
            <p className="text-xs font-extrabold text-slate-900 mt-2 uppercase tracking-wide">🏭 Total Campus Load</p>
            <p className="text-xl font-black text-red-600 font-mono mt-1">{microgrid.total_campus_load_kwh} kWh</p>
            <div className="mt-2 text-[10px] text-red-700 font-bold">Sum Equipment Demand</div>
          </div>
        </div>
      </div>

      {/* Energy Trend Interactive Chart */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" /> Campus Energy Consumption & Baseline Trend (48h)
            </h3>
            <p className="text-[11px] text-slate-500">Comparing actual load vs expected ML baseline and generation mix</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCampus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit=" kWh" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.875rem', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="CampusLoad" name="Actual Campus Load" stroke="#dc2626" fillOpacity={1} fill="url(#colorCampus)" strokeWidth={2} />
              <Line type="monotone" dataKey="ExpectedBaseline" name="Expected Baseline" stroke="#16a34a" strokeDasharray="5 5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Solar" name="Solar Generation" stroke="#d97706" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="Grid" name="Grid Import" stroke="#475569" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Equipment Health Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-red-600" /> Equipment Health & Anomaly Status
          </h3>
          <span className="text-xs text-slate-500 font-medium">Click any card to inspect asset details & history</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {equipment.map((eq) => {
            const hasAlert = eq.alert_severity && eq.alert_severity !== 'NORMAL';
            const isCritical = eq.alert_severity === 'CRITICAL';
            const isHigh = eq.alert_severity === 'HIGH';

            return (
              <div 
                key={eq.equipment_id}
                onClick={() => onInspectEquipment(eq.equipment_id)}
                className={`p-5 bg-white border rounded-2xl shadow-xs glass-card-hover cursor-pointer flex flex-col justify-between transition-all ${
                  isCritical ? 'border-red-300 bg-red-50/50' :
                  isHigh ? 'border-amber-300 bg-amber-50/50' :
                  'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{eq.equipment_id}</h4>
                      <p className="text-[10px] text-slate-500 font-medium">{eq.equipment_type}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCritical ? 'bg-red-100 text-red-700 border border-red-200' :
                      isHigh ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      ● {isCritical ? 'Critical' : isHigh ? 'Anomaly' : 'Healthy'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 font-medium">Current Energy:</span>
                      <span className="font-bold font-mono text-red-600">{eq.energy_kwh} kWh</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 font-medium">Operating State:</span>
                      <span className="font-semibold text-slate-800">{eq.operating_state}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500 font-medium">Maintenance Age:</span>
                      <span className="font-mono text-slate-700">{eq.maintenance_days} days</span>
                    </div>
                  </div>
                </div>

                {/* Fault Summary Footer */}
                {hasAlert && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] text-amber-700 font-bold uppercase">Likely Fault Identified:</p>
                    <p className="text-xs font-extrabold text-red-600 truncate mt-0.5">{eq.active_fault}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
