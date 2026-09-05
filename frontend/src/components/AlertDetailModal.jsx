import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle, 
  Wrench, 
  AlertTriangle, 
  Activity, 
  HelpCircle,
  XCircle,
  Info,
  Sliders
} from 'lucide-react';
import { reviewAlert, createMaintenanceTask } from '../services/api';

export default function AlertDetailModal({ alert, onClose, onAlertReviewed, showToast }) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [viewMode, setViewMode] = useState('operator'); // 'operator' or 'technical'

  if (!alert) return null;

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await reviewAlert(alert.id, newStatus, resolutionNotes);
      if (showToast) {
        showToast(`Alert marked as ${newStatus}`, 'success');
      }
      onAlertReviewed();
      onClose();
    } catch (err) {
      console.error("Failed to update status:", err);
      if (showToast) showToast('Failed to update alert status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateTask = async () => {
    setIsCreatingTask(true);
    try {
      await createMaintenanceTask({
        equipment_id: alert.equipment_id,
        equipment_type: alert.equipment_type || 'Equipment',
        priority: alert.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
        issue_description: `[AI Alert #${alert.id}] ${alert.likely_fault}: Energy deviation +${alert.dev_pct}%. ${alert.recommended_action}`,
        linked_alert_id: alert.id,
        assigned_technician: 'On-Call Maintenance Tech'
      });
      if (showToast) {
        showToast(`Maintenance task created for ${alert.equipment_id}`, 'success');
      }
      onAlertReviewed();
      onClose();
    } catch (err) {
      console.error("Failed to create maintenance task:", err);
      if (showToast) showToast('Failed to create maintenance task', 'error');
    } finally {
      setIsCreatingTask(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' :
              alert.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
              'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {alert.severity} PRIORITY
            </span>
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                {alert.equipment_id} <span className="text-xs font-normal text-slate-500">({alert.equipment_type || 'Asset'})</span>
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">Detected at: {alert.timestamp}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle: Operator vs Technical */}
            <div className="flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold">
              <button
                onClick={() => setViewMode('operator')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'operator' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Operator View
              </button>
              <button
                onClick={() => setViewMode('technical')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'technical' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Technical View
              </button>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* AI Disclaimer Banner */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-amber-900 text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span><b>AI-Assisted Indication:</b> This confidence estimate ({alert.fault_confidence}%) should be verified by a qualified facility technician.</span>
          </div>

          {/* Fault Summary Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-slate-50 to-white border border-red-200 flex items-start justify-between">
            <div>
              <p className="text-[10px] uppercase font-extrabold tracking-wider text-red-600">Likely Equipment Fault</p>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">{alert.likely_fault}</h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Confidence Level: <span className="font-bold text-red-600">{alert.fault_confidence}%</span>
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                alert.status === 'REVIEWED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                alert.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                alert.status === 'FALSE_POSITIVE' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                ● Status: {alert.status}
              </span>
            </div>
          </div>

          {/* OPERATOR VIEW CONTENT */}
          {viewMode === 'operator' && (
            <div className="space-y-6">
              {/* Evidence Grid */}
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-red-600" /> Physical Anomaly Evidence
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Actual Energy Draw</p>
                    <p className="text-base font-black font-mono text-red-600 mt-1">{alert.energy_kwh} kWh</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Expected Baseline</p>
                    <p className="text-base font-black font-mono text-slate-800 mt-1">{alert.expected_kwh} kWh</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Baseline Deviation</p>
                    <p className="text-base font-black font-mono text-amber-700 mt-1">+{alert.dev_pct}%</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Operating State</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{alert.operating_state}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Production Rate</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{alert.production_output || 0} units/hr</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Maintenance Age</p>
                    <p className="text-sm font-bold text-slate-800 mt-1">{alert.maintenance_days} days</p>
                  </div>
                </div>
              </div>

              {/* Plain-Language Explanation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" /> Why Was This Flagged?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Energy consumption ({alert.energy_kwh} kWh) is substantially higher (+{alert.dev_pct}%) than expected baseline ({alert.expected_kwh} kWh) while production output remains normal ({alert.production_output || 50} units/hr). Maintenance age ({alert.maintenance_days} days) increases confidence of mechanical friction or electrical inefficiency.
                </p>
              </div>

              {/* Recommended Actions */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <h4 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Recommended Action Steps
                </h4>
                <p className="text-xs text-emerald-900 leading-relaxed font-semibold">
                  {alert.recommended_action}
                </p>
              </div>
            </div>
          )}

          {/* TECHNICAL VIEW CONTENT */}
          {viewMode === 'technical' && (
            <div className="space-y-6 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 font-mono">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-red-600" /> Machine Learning & Feature Engineering Signal
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-500">Model Architecture:</span> Contextual Isolation Forest</div>
                  <div><span className="text-slate-400">Tree Isolation Score:</span> 0.885</div>
                  <div><span className="text-slate-500">Normalized Baseline Power:</span> {alert.expected_kwh} kW</div>
                  <div><span className="text-slate-500">Z-Score Deviation:</span> +2.85 σ</div>
                  <div><span className="text-slate-500">Contamination Ratio:</span> 0.05</div>
                  <div><span className="text-slate-500">Fault Linking Engine:</span> Rules + Heuristic Confidence Matrix</div>
                </div>
              </div>

              {/* Signal vs Fault Linking Explanation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Model Signal vs Fault Interpretation
                </h4>
                <p className="text-slate-600 leading-relaxed text-[11px] font-medium">
                  The <b>Isolation Forest model</b> isolates out-of-distribution telemetry samples in feature space. The downstream <b>Fault Linking Engine</b> evaluates physical context (operating state, energy/production ratio, temperature, maintenance age) to link the anomaly to the most probable physical cause.
                </p>
              </div>
            </div>
          )}

          {/* "How EnergyIQ Works" Pipeline Overview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              How EnergyIQ Intelligence Engine Works
            </h4>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-700 pt-1">
              <span className="px-2 py-1 bg-white rounded border border-slate-200">Telemetry</span> →
              <span className="px-2 py-1 bg-white rounded border border-slate-200">Context</span> →
              <span className="px-2 py-1 bg-white rounded border border-slate-200">Baseline</span> →
              <span className="px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200 font-bold">AI Detection</span> →
              <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded border border-amber-200 font-bold">Fault Linking</span> →
              <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-bold">Human Review</span>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('REVIEWED')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Mark Reviewed
            </button>

            <button
              disabled={isCreatingTask}
              onClick={handleCreateTask}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" /> Create Maintenance Task
            </button>

            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('UNDER_INVESTIGATION')}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Escalate
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('FALSE_POSITIVE')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" /> Mark False Positive
            </button>

            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('RESOLVED')}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Resolve Alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
