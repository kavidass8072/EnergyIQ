import React from 'react';
import { 
  Activity, 
  Cpu, 
  AlertTriangle, 
  BarChart3, 
  ShieldAlert, 
  BookOpen, 
  FileCheck,
  RefreshCw,
  Zap
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onReseed, isReseeding }) {
  const tabs = [
    { id: 'overview', label: 'Executive Dashboard', icon: Activity },
    { id: 'equipment', label: 'Equipment Health', icon: Cpu },
    { id: 'alerts', label: 'Anomaly Alerts', icon: AlertTriangle },
    { id: 'evaluation', label: 'Model Benchmark', icon: BarChart3 },
    { id: 'edge-cases', label: 'Edge Case Workbench', icon: ShieldAlert },
    { id: 'guide', label: 'Operator Guide', icon: BookOpen },
    { id: 'ethics', label: 'Ethics & Checklist', icon: FileCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 py-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand Logo & Microgrid Indicator */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-red-600 to-red-500 rounded-xl shadow-xs text-white">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Energy<span className="text-red-600">IQ</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-50 text-red-700 border border-red-200 rounded-full">
                COMMERCIAL CAMPUS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Equipment Energy Anomaly Detector & Fault Linking System
            </p>
          </div>
        </div>

        {/* Action Controls & System Status */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onReseed}
            disabled={isReseeding}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition-all"
            title="Re-generate telemetry and re-run ML model pipeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReseeding ? 'animate-spin text-red-600' : ''}`} />
            <span>{isReseeding ? 'Reseeding Data...' : 'Reseed Dataset & Pipeline'}</span>
          </button>
          
          <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs text-emerald-800 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
            <span>System Online (Local)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <nav className="flex space-x-1 mt-3 overflow-x-auto pb-1 no-scrollbar border-t border-slate-100 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
