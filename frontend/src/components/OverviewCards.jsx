import React from 'react';
import { ShieldAlert, AlertOctagon, ZapOff, IndianRupee } from 'lucide-react';

export default function OverviewCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: "Active Anomalies",
      value: summary.active_alerts,
      subtext: `${summary.total_equipment} Monitored Campus Assets`,
      icon: ShieldAlert,
      bgAccent: "bg-red-50/80",
      borderColor: "border-red-200",
      textColor: "text-red-600",
      badgeText: summary.active_alerts > 0 ? "ATTENTION NEEDED" : "NOMINAL",
      badgeBg: summary.active_alerts > 0 ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    {
      title: "High & Critical Alerts",
      value: summary.high_priority_alerts + summary.critical_alerts,
      subtext: `${summary.critical_alerts} Critical Breakdown Risk`,
      icon: AlertOctagon,
      bgAccent: "bg-rose-50/80",
      borderColor: "border-rose-200",
      textColor: "text-rose-600",
      badgeText: "PRIORITY 1",
      badgeBg: "bg-rose-100 text-rose-700 border-rose-200"
    },
    {
      title: "Estimated Waste Rate",
      value: `${summary.estimated_wasted_kwh_hr} kWh/h`,
      subtext: "Excess power draw above baseline",
      icon: ZapOff,
      bgAccent: "bg-amber-50/80",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      badgeText: "LIVE METRIC",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200"
    },
    {
      title: "Potential Cost Savings",
      value: `${summary.currency}${summary.estimated_avoided_cost.toLocaleString()}`,
      subtext: "Avoided early intervention savings",
      icon: IndianRupee,
      bgAccent: "bg-emerald-50/80",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      badgeText: "ESTIMATED SAVINGS",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-card p-5 bg-white border ${card.borderColor} glass-card-hover relative overflow-hidden rounded-2xl shadow-xs`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                {card.title}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-black rounded-full border ${card.badgeBg}`}>
                {card.badgeText}
              </span>
            </div>

            <div className="mt-4 flex items-baseline justify-between">
              <div className={`text-2xl font-black font-mono tracking-tight ${card.textColor}`}>
                {card.value}
              </div>
              <div className={`p-2.5 rounded-xl ${card.bgAccent} ${card.textColor} border ${card.borderColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500 font-medium">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
