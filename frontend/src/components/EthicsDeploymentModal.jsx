import React, { useState } from 'react';
import { ShieldCheck, Server, HardDrive, Layers } from 'lucide-react';

export default function EthicsDeploymentModal() {
  const [activeTab, setActiveTab] = useState('ethics');

  return (
    <div className="space-y-6 mt-6">
      {/* Header Tabs */}
      <div className="bg-white p-4 border border-slate-200 rounded-2xl shadow-xs flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('ethics')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'ethics'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ethics & Responsible AI Framework
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'deployment'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Local Deployment Checklist
          </button>
        </div>

        <span className="text-xs font-mono text-slate-500 font-medium hidden sm:inline">Governance & Ops Standard</span>
      </div>

      {activeTab === 'ethics' ? (
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-6">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-black text-slate-900">Ethics, Responsible AI & Governance Note</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-red-600 uppercase tracking-wider">1. Human-in-the-Loop Oversight</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                The anomaly detector functions strictly as a decision-support system. It never initiates automatic equipment shutdowns or punitive operational decisions without explicit technician review.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-amber-700 uppercase tracking-wider">2. Explainability & Evidence First</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Every HIGH or CRITICAL alert presents transparent, auditable evidence bullet points detailing energy deviations, production context, and maintenance history—eliminating black-box opacity.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-red-600 uppercase tracking-wider">3. Mitigating False Alarms & Missed Faults</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                The model undergoes edge-case verification for load surges and state transitions to prevent operator alert fatigue while maintaining high recall for genuine mechanical degradations.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-extrabold text-slate-800 uppercase tracking-wider">4. Data Privacy & Synthetic Boundaries</h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                All data remains strictly on-premise without external telemetry transmission. Current evaluations rely on synthetic campus benchmarks and must be recalibrated prior to industrial deployment.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-6">
          <div className="flex items-center space-x-3">
            <Server className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-black text-slate-900">Production Deployment Checklist (Low-Cost / Laptop)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-red-600 font-bold">
                <HardDrive className="w-4 h-4 text-red-600" /> Hardware Requirements
              </div>
              <ul className="text-slate-600 space-y-1 font-medium">
                <li>• Dual-core CPU (Intel i5/AMD Ryzen or modern laptop)</li>
                <li>• 4 GB RAM minimum (8 GB recommended)</li>
                <li>• 2 GB SSD Storage</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-700 font-bold">
                <Layers className="w-4 h-4 text-emerald-600" /> Software Stack
              </div>
              <ul className="text-slate-600 space-y-1 font-medium">
                <li>• Python 3.10+ (FastAPI, Scikit-Learn, Pandas)</li>
                <li>• Node.js 18+ (Vite React Dashboard)</li>
                <li>• SQLite 3 or Docker Desktop</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
