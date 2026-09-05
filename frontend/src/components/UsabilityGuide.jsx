import React from 'react';
import { BookOpen, CheckCircle, ArrowRight, ShieldAlert, Cpu, Activity, Wrench } from 'lucide-react';

export default function UsabilityGuide() {
  const steps = [
    {
      step: 1,
      title: "Executive Dashboard Review",
      description: "Non-technical campus staff log in and check top-level KPIs (Active Anomalies, Solar/Battery/Grid status, Wasted Energy).",
      icon: Activity
    },
    {
      step: 2,
      title: "Equipment Status Monitoring",
      description: "Browse live equipment status cards. Assets operating normally display green baseline indicators, while suspicious units highlight risk scores.",
      icon: Cpu
    },
    {
      step: 3,
      title: "Anomaly Alert Notification",
      description: "When an equipment anomaly is flagged, the system categorizes it with a clear severity level (LOW, MEDIUM, HIGH, CRITICAL).",
      icon: ShieldAlert
    },
    {
      step: 4,
      title: "Click Alert & Open Inspector",
      description: "Clicking the alert opens the Alert Inspector drawer, presenting 48h Actual vs Expected energy graphs and production context.",
      icon: ArrowRight
    },
    {
      step: 5,
      title: "Review Diagnostic Evidence",
      description: "Read plain-language bullet points explaining WHY the alert fired (e.g. +57% energy surge, normal production, 74d since last service).",
      icon: BookOpen
    },
    {
      step: 6,
      title: "Inspect Linked Fault & Recommendation",
      description: "View the estimated root cause (e.g. Mechanical Resistance, Motor Inefficiency) and clear step-by-step recommended actions.",
      icon: Wrench
    },
    {
      step: 7,
      title: "Acknowledge & Record Maintenance",
      description: "Click 'Mark as Reviewed' to log operator review in the SQLite database and dispatch campus maintenance technicians.",
      icon: CheckCircle
    }
  ];

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-black text-slate-900">Non-Technical Operator Usability Walkthrough</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Designed specifically for small campus staff with limited technical or ML expertise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-full bg-red-50 text-red-700 font-extrabold font-mono text-xs flex items-center justify-center border border-red-200">
                    0{s.step}
                  </span>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                    <Icon className="w-4 h-4 text-red-600" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
