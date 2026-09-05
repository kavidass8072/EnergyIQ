import React from 'react';
import { Sun, BatteryCharging, Zap, Building2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function PowerFlowCard({ microgrid, powerFlowHistory }) {
  if (!microgrid) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      {/* Power Flow Status Card */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-600" /> Microgrid Power Mix
            </h3>
            <span className="text-xs text-slate-500 font-mono">Live Telemetry</span>
          </div>

          <div className="space-y-3.5">
            {/* Solar Generation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-amber-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Solar Generation</div>
                  <div className="text-sm font-black text-amber-600 font-mono">
                    {microgrid.solar_generation_kwh} kWh
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                RENEWABLE
              </span>
            </div>

            {/* Battery SoC */}
            <div className="p-3 bg-slate-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <BatteryCharging className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Battery Storage SoC</div>
                  <div className="text-sm font-black text-emerald-700 font-mono">
                    {microgrid.battery_soc_pct}%
                  </div>
                </div>
              </div>
              <div className="w-20 bg-slate-200 rounded-full h-2 overflow-hidden border border-slate-300">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${microgrid.battery_soc_pct}%` }}
                ></div>
              </div>
            </div>

            {/* Grid Consumption */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-200 text-slate-700 rounded-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Utility Grid Draw</div>
                  <div className="text-sm font-black text-slate-800 font-mono">
                    {microgrid.grid_consumption_kwh} kWh
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                SUPPLEMENTAL
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500 font-mono font-medium">
          <span>Campus Total Load:</span>
          <span className="text-red-600 font-black">{microgrid.total_campus_load_kwh} kWh</span>
        </div>
      </div>

      {/* Microgrid Time Series Trend Chart */}
      <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Campus Microgrid Telemetry Trend (48 Hours)
          </h3>
          <div className="flex items-center space-x-3 text-xs font-medium">
            <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Solar</span>
            <span className="flex items-center gap-1 text-slate-600"><span className="w-2 h-2 rounded-full bg-slate-600"></span> Grid</span>
            <span className="flex items-center gap-1 text-red-600"><span className="w-2 h-2 rounded-full bg-red-600"></span> Equipment Load</span>
          </div>
        </div>

        <div className="h-56 w-full pt-2">
          {powerFlowHistory && powerFlowHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={powerFlowHistory}>
                <defs>
                  <linearGradient id="colorSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGrid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(ts) => ts ? ts.split(' ')[1] : ''}
                  stroke="#64748b"
                  fontSize={10}
                />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.875rem', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                />
                <Area type="monotone" dataKey="solar" name="Solar kWh" stroke="#d97706" fillOpacity={1} fill="url(#colorSolar)" />
                <Area type="monotone" dataKey="grid" name="Grid kWh" stroke="#475569" fillOpacity={1} fill="url(#colorGrid)" />
                <Area type="monotone" dataKey="total_equipment_kwh" name="Equipment Load kWh" stroke="#dc2626" fillOpacity={1} fill="url(#colorLoad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-medium">
              Loading power flow trend...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
