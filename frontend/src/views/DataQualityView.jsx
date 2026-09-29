import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, XCircle, Database, AlertCircle } from 'lucide-react';
import { fetchDataQualitySummary } from '../services/api';

export default function DataQualityView() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDataQualitySummary();
      setSummary(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to load data quality summary");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-2 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Automated Telemetry Quality Monitor
          </div>
          <h1 className="text-xl font-black text-slate-900">Data Quality & Health Service</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time monitoring of sensor telemetry completeness, missing values, duplicates, and range violations.
          </p>
        </div>

        <button
          onClick={loadSummary}
          disabled={loading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-700">Analyzing Telemetry Data Quality...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-xs font-bold text-red-700">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && summary && (
        <div className="space-y-6">
          {/* Main Status Indicator Banner */}
          <div className={`p-6 rounded-2xl border flex items-center justify-between ${
            summary.status === 'HEALTHY'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : summary.status === 'WARNING'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}>
            <div className="flex items-center gap-4">
              {summary.status === 'HEALTHY' ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              ) : summary.status === 'WARNING' ? (
                <AlertTriangle className="w-10 h-10 text-amber-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
              <div>
                <h2 className="text-lg font-black">
                  System Data Quality: {summary.status}
                </h2>
                <p className="text-xs font-medium mt-0.5 opacity-90">
                  Overall Telemetry Completeness Score: <span className="font-bold">{summary.completeness_pct}%</span>
                </p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
              summary.status === 'HEALTHY' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
            }`}>
              {summary.status}
            </span>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Completeness Score</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{summary.completeness_pct}%</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Target: ≥ 98%</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Null Rate</p>
              <p className={`text-2xl font-black mt-1 ${summary.null_rate_pct > 1.0 ? 'text-amber-600' : 'text-slate-900'}`}>
                {summary.null_rate_pct}%
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Target: ≤ 1.0%</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Duplicate Rate</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{summary.duplicate_rate_pct}%</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Target: 0.0%</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Invalid Range Rate</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{summary.invalid_range_rate_pct}%</p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Out of bounds values</p>
            </div>
          </div>

          {/* Quality Audit Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Quality Checklist & Diagnostics</h3>

            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Telemetry Feed Freshness</span>
                <span className={`font-bold ${summary.stale_telemetry_flag ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {summary.stale_telemetry_flag ? 'STALE (> 48h old)' : 'FRESH'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Total Telemetry Observations</span>
                <span className="font-mono font-bold text-slate-900">{summary.total_records.toLocaleString()}</span>
              </div>
            </div>

            {summary.issues?.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs font-bold text-amber-900 mb-1">Active Data Quality Issues:</p>
                <ul className="list-disc list-inside text-xs text-amber-800 space-y-1 font-medium">
                  {summary.issues.map((iss, idx) => (
                    <li key={idx}>{iss}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
