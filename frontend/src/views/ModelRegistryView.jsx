import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Layers, 
  Activity, 
  Sliders, 
  Zap, 
  Gauge, 
  ShieldCheck, 
  FileText 
} from 'lucide-react';
import { fetchModelRegistry, activateModel, fetchModelDrift } from '../services/api';

export default function ModelRegistryView({ showToast }) {
  const [models, setModels] = useState([]);
  const [driftData, setDriftData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState(null);
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' | 'drift'

  const loadData = async () => {
    setLoading(true);
    try {
      const [modelList, drift] = await Promise.all([
        fetchModelRegistry(),
        fetchModelDrift()
      ]);
      setModels(modelList || []);
      setDriftData(drift || null);
    } catch (err) {
      console.error("Failed to load Model Registry data:", err);
      if (showToast) showToast("Failed to load Model Registry data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActivate = async (modelId) => {
    setActivatingId(modelId);
    try {
      const res = await activateModel(modelId);
      setModels(res.models || []);
      if (showToast) showToast(`Activated model ${modelId} successfully!`, "success");
    } catch (err) {
      console.error("Failed to activate model:", err);
      if (showToast) showToast(`Activation failed: ${err.message}`, "error");
    } finally {
      setActivatingId(null);
    }
  };

  const activeModel = models.find(m => m.is_active) || models[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-sm shadow-red-600/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                ML Model Registry & Population Drift Monitor
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage deployed anomaly detection algorithms, model versions, hyperparameter configs, and monitor Population Stability Index (PSI) drift.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('registry')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'registry'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Model Registry ({models.length})
          </button>
          <button
            onClick={() => setActiveTab('drift')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'drift'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Drift Monitor
            {driftData && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                driftData.status === 'STABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {driftData.status}
              </span>
            )}
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 bg-white border border-slate-200 rounded-2xl flex items-center justify-center space-x-2 text-slate-500 text-xs font-semibold">
          <RefreshCw className="w-4 h-4 text-red-600 animate-spin" />
          <span>Fetching Model Registry and Drift metrics...</span>
        </div>
      ) : (
        <>
          {/* Active Model Summary Banner */}
          {activeModel && (
            <div className="p-5 bg-gradient-to-r from-red-50 to-white border border-red-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-600 text-white rounded-xl shadow-xs">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                      ● Active Production Engine
                    </span>
                    <span className="text-xs font-extrabold text-slate-500">{activeModel.id}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">{activeModel.name}</h3>
                  <p className="text-xs text-slate-600 font-medium">{activeModel.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center bg-white p-3 rounded-xl border border-red-100 shadow-2xs">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">F1-Score</p>
                  <p className="text-sm font-black text-slate-900">{(activeModel.metrics.f1 * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Precision</p>
                  <p className="text-sm font-black text-emerald-600">{(activeModel.metrics.precision * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Recall</p>
                  <p className="text-sm font-black text-slate-900">{(activeModel.metrics.recall * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Registry List */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase text-slate-400">
                Registered Anomaly Detection Models
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {models.map((model) => (
                  <div 
                    key={model.id}
                    className={`p-6 bg-white rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                      model.is_active 
                        ? 'border-red-500 shadow-md ring-2 ring-red-500/20' 
                        : 'border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-400">{model.id}</span>
                        {model.is_active ? (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            Standby
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-black text-slate-900 text-base">{model.name}</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                          {model.description}
                        </p>
                      </div>

                      {/* Performance Indicators */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Precision:</span>
                          <span className="font-extrabold text-slate-900">{(model.metrics.precision * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-semibold">Recall:</span>
                          <span className="font-extrabold text-slate-900">{(model.metrics.recall * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500 font-semibold">F1 Score:</span>
                          <span className="font-extrabold text-red-600">{(model.metrics.f1 * 100).toFixed(1)}%</span>
                        </div>
                        {model.metrics.false_alarm_rate !== undefined && (
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 font-semibold">False Alarm Rate:</span>
                            <span className="font-extrabold text-emerald-600">{(model.metrics.false_alarm_rate * 100).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>

                      {/* Model Hyperparameters */}
                      <div className="text-[11px] space-y-1">
                        <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px]">Hyperparameters:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(model.parameters || {}).map(([key, val]) => (
                            <span key={key} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md font-mono">
                              {key}: {String(val)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-400">
                        Version {model.version}
                      </span>

                      {!model.is_active && (
                        <button
                          disabled={activatingId === model.id}
                          onClick={() => handleActivate(model.id)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          {activatingId === model.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Zap className="w-3.5 h-3.5" />
                          )}
                          Activate Engine
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Drift Monitor */}
          {activeTab === 'drift' && driftData && (
            <div className="space-y-6">
              {/* Drift Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Overall PSI Score</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{driftData.overall_psi.toFixed(3)}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Population Stability Index</p>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Drift Status</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                      driftData.status === 'STABLE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      {driftData.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Threshold: PSI &lt; 0.10</p>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Monitored Features</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{driftData.feature_count}</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Telemetry telemetry streams</p>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">Reference Baseline</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{driftData.baseline_sample_size} samples</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Target vs Baseline</p>
                </div>
              </div>

              {/* Feature-level PSI Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-900">Feature-Level Drift Breakdown (PSI)</h3>
                  <span className="text-xs text-slate-500 font-medium">Last calculated: {driftData.calculated_at}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-400">
                        <th className="py-3 px-4">Feature Name</th>
                        <th className="py-3 px-4">Feature PSI</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {driftData.features.map((f, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{f.name}</td>
                          <td className="py-3.5 px-4 font-black font-mono text-slate-900">{f.psi.toFixed(4)}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              f.status === 'STABLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {f.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {f.psi < 0.10 ? 'No significant distribution change.' : 'Moderate shift detected in recent streaming telemetry.'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
