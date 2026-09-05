import React from 'react';
import { Cpu, AlertTriangle, CheckCircle, ArrowUpRight } from 'lucide-react';

export default function EquipmentGrid({ equipmentList, onInspectEquipment, onInspectAlert }) {
  if (!equipmentList || equipmentList.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl mt-6">
        <Cpu className="w-8 h-8 mx-auto text-red-600 mb-2 animate-bounce" />
        <p className="text-sm font-semibold">Loading campus equipment telemetry...</p>
      </div>
    );
  }

  const getStateBadge = (state) => {
    switch (state) {
      case 'ON':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OFF':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'IDLE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MAINTENANCE':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-red-600" /> Monitored Campus Assets ({equipmentList.length})
        </h3>
        <span className="text-xs text-slate-500 font-medium">Click any asset to view 72h telemetry & evidence</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {equipmentList.map((item) => {
          const isAnomaly = item.severity && item.severity !== 'NORMAL';
          return (
            <div
              key={item.equipment_id}
              className={`p-5 bg-white border rounded-2xl shadow-xs transition-all duration-200 glass-card-hover flex flex-col justify-between ${
                isAnomaly ? 'border-amber-300 bg-amber-50/40' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      {item.equipment_id}
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {item.equipment_type}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStateBadge(item.operating_state)}`}>
                    {item.operating_state}
                  </span>
                </div>

                {/* Telemetry Row */}
                <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Current Power</div>
                    <div className="text-sm font-black text-red-600 font-mono">
                      {item.energy_kwh} <span className="text-[10px] text-slate-500 font-normal">kWh</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Production</div>
                    <div className="text-sm font-bold text-slate-800 font-mono">
                      {item.production_output} <span className="text-[10px] text-slate-500 font-normal">units</span>
                    </div>
                  </div>
                </div>

                {/* Anomaly Gauge & Status */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Anomaly Risk Score:</span>
                    <span className={`font-mono font-bold ${isAnomaly ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {item.anomaly_score} / 100
                    </span>
                  </div>

                  {/* Meter Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.anomaly_score > 75
                          ? 'bg-red-600'
                          : item.anomaly_score > 55
                          ? 'bg-amber-500'
                          : item.anomaly_score > 35
                          ? 'bg-slate-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, item.anomaly_score))}%` }}
                    ></div>
                  </div>

                  {/* Active Fault Tag */}
                  {item.active_fault ? (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs flex items-center justify-between text-red-700 font-semibold">
                      <span className="truncate flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        {item.active_fault}
                      </span>
                      <span className="font-mono text-[10px] bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-full font-bold">
                        {item.fault_confidence}%
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Operational Baseline Normal</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-medium">
                  Maint: {item.maintenance_days}d ago
                </span>
                <button
                  onClick={() => onInspectEquipment(item.equipment_id)}
                  className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-bold transition-colors"
                >
                  <span>Inspect Telemetry</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
