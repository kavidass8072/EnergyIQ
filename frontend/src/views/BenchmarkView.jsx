import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, BarChart3, Info, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { fetchBenchmarkAdapters, runBenchmarkEvaluation } from '../services/api';

export default function BenchmarkView() {
  const [adapters, setAdapters] = useState([]);
  const [selectedAdapter, setSelectedAdapter] = useState('synthetic');
  const [evalResult, setEvalResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAdapters();
    executeEval('synthetic');
  }, []);

  const loadAdapters = async () => {
    try {
      const list = await fetchBenchmarkAdapters();
      setAdapters(list);
    } catch (err) {
      console.error("Failed adapters load:", err);
    }
  };

  const executeEval = async (adapterId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await runBenchmarkEvaluation(adapterId);
      setEvalResult(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Evaluation failed");
    }
  };

  const handleAdapterChange = (id) => {
    setSelectedAdapter(id);
    executeEval(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full mb-2 border border-red-200">
            <Database className="w-3.5 h-3.5 text-red-600" /> Real-World & Public Dataset Benchmark Engine
          </div>
          <h1 className="text-xl font-black text-slate-900">Benchmark Model Evaluation</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Evaluates Contextual Isolation Forest on synthetic telemetry vs public real-world datasets (e.g., ASHRAE Great Energy Predictor III).
          </p>
        </div>

        <button
          onClick={() => executeEval(selectedAdapter)}
          disabled={loading}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Re-Run Benchmark</span>
        </button>
      </div>

      {/* Adapter Selector Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adapters.map((a) => (
          <div
            key={a.id}
            onClick={() => handleAdapterChange(a.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              selectedAdapter === a.id
                ? 'bg-red-50/60 border-red-500 shadow-md ring-2 ring-red-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{a.dataset_name}</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                a.has_ground_truth_labels ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {a.has_ground_truth_labels ? 'Ground-Truth Labeled' : 'Unsupervised Benchmark'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 font-medium">{a.description}</p>
            <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500 font-bold">
              <span>Source: {a.source}</span>
              <span>Assets: {a.canonical_assets}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Executing Benchmark Dataset Pipeline...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs font-bold text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Display */}
      {!loading && evalResult && (
        <div className="space-y-6">
          {/* Diagnostic Note */}
          {evalResult.note && (
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900">Unsupervised Dataset Methodology Note</p>
                <p className="text-xs text-amber-800 mt-0.5 font-medium">{evalResult.note}</p>
              </div>
            </div>
          )}

          {/* Unsupervised Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Records Evaluated</p>
              <p className="text-xl font-black text-slate-900 mt-1">{evalResult.record_count.toLocaleString()}</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Anomalies Detected</p>
              <p className="text-xl font-black text-red-600 mt-1">
                {evalResult.unsupervised_metrics.anomaly_detected_count}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                ({evalResult.unsupervised_metrics.anomaly_percentage}% of dataset)
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Mean Anomaly Score</p>
              <p className="text-xl font-black text-slate-900 mt-1">
                {evalResult.unsupervised_metrics.mean_anomaly_score} / 100
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Max Outlier Score</p>
              <p className="text-xl font-black text-amber-600 mt-1">
                {evalResult.unsupervised_metrics.max_anomaly_score} / 100
              </p>
            </div>
          </div>

          {/* Supervised Benchmark Results if Labeled */}
          {evalResult.supervised_metrics && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Supervised Ground-Truth Metrics
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Precision</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {evalResult.supervised_metrics.precision_pct}%
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">Recall (Detection)</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {evalResult.supervised_metrics.recall_pct}%
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-800 uppercase">F1-Score</p>
                  <p className="text-2xl font-black text-emerald-700 mt-1">
                    {evalResult.supervised_metrics.f1_score_pct}%
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-600 uppercase">False Alarm Rate (FPR)</p>
                  <p className="text-2xl font-black text-slate-800 mt-1">
                    {evalResult.supervised_metrics.fpr_pct}%
                  </p>
                </div>
              </div>

              {/* Confusion Matrix Table */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-2">Confusion Matrix Breakdown</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs font-bold">
                  <div className="p-3 bg-slate-100 rounded-lg">TP: {evalResult.supervised_metrics.confusion_matrix.TP}</div>
                  <div className="p-3 bg-slate-100 rounded-lg">FP: {evalResult.supervised_metrics.confusion_matrix.FP}</div>
                  <div className="p-3 bg-slate-100 rounded-lg">FN: {evalResult.supervised_metrics.confusion_matrix.FN}</div>
                  <div className="p-3 bg-slate-100 rounded-lg">TN: {evalResult.supervised_metrics.confusion_matrix.TN}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
