import React, { useState } from 'react';
import { Sliders, Zap, RefreshCw, RotateCcw } from 'lucide-react';
import { injectDemoFault, resetDemoData } from '../services/api';

export default function DemoControlPanel({ onDataUpdated, showToast }) {
  const [selectedAsset, setSelectedAsset] = useState('HVAC-01');
  const [isInjecting, setIsInjecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleInjectFault = async (faultType) => {
    setIsInjecting(true);
    try {
      const res = await injectDemoFault(selectedAsset, faultType);
      if (showToast) {
        showToast(`Injected ${res.fault_type} into ${selectedAsset}! Alert #${res.alert_id} generated.`, 'warning');
      }
      onDataUpdated();
    } catch (err) {
      console.error("Fault injection failed:", err);
      if (showToast) showToast("Fault injection failed", 'error');
    } finally {
      setIsInjecting(false);
    }
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      if (showToast) {
        showToast('Demo dataset successfully reset to clean default baseline state.', 'success');
      }
      setShowConfirmReset(false);
      onDataUpdated();
    } catch (err) {
      console.error("Reset failed:", err);
      if (showToast) showToast('Failed to reset demo dataset', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-red-600" />
          <h2 className="text-xl font-black text-slate-900">Interactive Demo Fault Injection Control Panel</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Demonstrate end-to-end real-time AI fault detection: Select a campus equipment asset, inject a physical fault scenario, and watch the system trigger automated ML detection, fault linking, and physical evidence calculation.
        </p>
      </div>

      {/* Control Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
        {/* Asset Selection */}
        <div>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
            Target Equipment Asset:
          </label>
          <div className="flex flex-wrap gap-2">
            {['HVAC-01', 'HVAC-02', 'Motor-01', 'Compressor-01', 'Pump-01', 'Production-Line-01', 'Cooling-Unit-01'].map(id => (
              <button
                key={id}
                onClick={() => setSelectedAsset(id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                  selectedAsset === id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Injection Action Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Available Fault Injection Scenarios:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fault 1: Mechanical Resistance */}
            <div className="p-5 rounded-2xl bg-red-50/50 border border-red-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-red-700 uppercase">HIGH SEVERITY</span>
                <h5 className="font-black text-sm text-slate-900 mt-1">Inject Mechanical Resistance</h5>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">Simulates bearing wear and shaft misalignment (+62% power draw during normal production).</p>
              </div>
              <button
                disabled={isInjecting}
                onClick={() => handleInjectFault('MECHANICAL_RESISTANCE')}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                {isInjecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Inject Fault
              </button>
            </div>

            {/* Fault 2: Standby Leakage */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-amber-800 uppercase">CRITICAL SEVERITY</span>
                <h5 className="font-black text-sm text-slate-900 mt-1">Inject Standby Leakage</h5>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">Simulates non-zero power consumption while equipment is switched OFF.</p>
              </div>
              <button
                disabled={isInjecting}
                onClick={() => handleInjectFault('STANDBY_LEAKAGE')}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                {isInjecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Inject Fault
              </button>
            </div>

            {/* Fault 3: Production Anomaly */}
            <div className="p-5 rounded-2xl bg-red-50/50 border border-red-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-red-700 uppercase">HIGH SEVERITY</span>
                <h5 className="font-black text-sm text-slate-900 mt-1">Inject Production Mismatch</h5>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">Simulates high power consumption while production output reads 0 units/hr.</p>
              </div>
              <button
                disabled={isInjecting}
                onClick={() => handleInjectFault('PRODUCTION_ANOMALY')}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                {isInjecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Inject Fault
              </button>
            </div>

            {/* Fault 4: Electrical Spike */}
            <div className="p-5 rounded-2xl bg-red-50/50 border border-red-200 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black text-red-700 uppercase">CRITICAL SEVERITY</span>
                <h5 className="font-black text-sm text-slate-900 mt-1">Inject Electrical Spike</h5>
                <p className="text-[11px] text-slate-600 mt-1 font-medium">Simulates sudden overcurrent/voltage surge (+175% energy spike).</p>
              </div>
              <button
                disabled={isInjecting}
                onClick={() => handleInjectFault('ELECTRICAL_SPIKE')}
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                {isInjecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                Inject Fault
              </button>
            </div>
          </div>
        </div>

        {/* Reset Dataset Section */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            <h5 className="text-xs font-extrabold text-slate-900">Reset Demo Data</h5>
            <p className="text-[11px] text-slate-500 font-medium">Regenerate simulated campus telemetry dataset and restore system to clean baseline.</p>
          </div>
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Reset Demo Data
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Confirm Reset Demo Data</h3>
            <p className="text-slate-600 font-medium">
              This will regenerate the 60-day simulated campus dataset, re-run ML anomaly detection, and restore all equipment telemetry and alerts to clean default baseline state.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-xs border border-slate-200"
              >
                Cancel
              </button>
              <button
                disabled={isResetting}
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-extrabold hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 text-xs"
              >
                {isResetting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
