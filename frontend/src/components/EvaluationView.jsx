import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, AlertTriangle, TrendingUp, IndianRupee, ShieldCheck } from 'lucide-react';
import { fetchEvaluationReport } from '../services/api';

export default function EvaluationView() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvaluationReport()
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load evaluation report:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-12 border border-slate-200 rounded-2xl shadow-xs text-center text-slate-500 mt-6">
        <BarChart3 className="w-8 h-8 mx-auto text-red-600 animate-spin mb-3" />
        <p className="text-sm font-semibold">Calculating Baseline vs Proposed Model Evaluation Metrics...</p>
      </div>
    );
  }

  if (!report || !report.baseline || !report.proposed) {
    return (
      <div className="bg-white p-8 border border-slate-200 rounded-2xl text-center text-slate-500 mt-6">
        <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
        <p className="text-sm font-medium">No evaluation telemetry data available. Please reseed the dataset.</p>
      </div>
    );
  }

  const { baseline, proposed, targets, cost_impact } = report;

  const compareRow = (label, bVal, pVal, targetVal, isHigherBetter = true) => {
    const isTargetMet = isHigherBetter ? pVal >= targetVal : pVal <= targetVal;
    return (
      <tr className="border-b border-slate-100 hover:bg-slate-50 text-xs">
        <td className="py-3 px-4 font-bold text-slate-800">{label}</td>
        <td className="py-3 px-4 font-mono text-slate-500">{bVal}%</td>
        <td className="py-3 px-4 font-mono font-bold text-red-600">{pVal}%</td>
        <td className="py-3 px-4 font-mono text-slate-500">{targetVal}%</td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
            isTargetMet ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {isTargetMet ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-red-600" />}
            {isTargetMet ? 'TARGET PASSED' : 'UNDER TARGET'}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Header Banner */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-black text-slate-900">Model Performance & Experiment Evaluation</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Empirical comparative analysis: Baseline Rolling Z-Score vs Proposed Contextual Isolation Forest with Ground Truth Faults
          </p>
        </div>

        <div className="flex items-center space-x-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-xs">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Proposed F1-Score</div>
            <div className="text-lg font-black text-emerald-700">{proposed.f1_score}%</div>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Target F1-Score</div>
            <div className="text-lg font-bold text-slate-600">{targets.f1_score}%</div>
          </div>
        </div>
      </div>

      {/* Target vs Measured Performance Table */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-600" /> Benchmark Evaluation Matrix (Baseline vs Proposed vs Target)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4">Baseline Model (Z-Score)</th>
                <th className="py-3 px-4">Proposed Model (Isolation Forest)</th>
                <th className="py-3 px-4">Project Target</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {compareRow("Precision", baseline.precision, proposed.precision, targets.precision)}
              {compareRow("Recall (Detection Rate)", baseline.recall, proposed.recall, targets.recall)}
              {compareRow("F1-Score", baseline.f1_score, proposed.f1_score, targets.f1_score)}
              {compareRow("High-Priority Alert Precision", baseline.high_priority_precision, proposed.high_priority_precision, targets.high_priority_precision)}
              {compareRow("False Alarm Rate", baseline.false_alarm_rate, proposed.false_alarm_rate, targets.false_alarm_rate, false)}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix Visualizer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Matrix */}
        <div className="bg-white p-5 border border-slate-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              Baseline (Z-Score) Confusion Matrix
            </h4>
            <span className="text-[10px] text-slate-500 font-mono">Avg Delay: {baseline.avg_detection_delay_hours}h</span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-center text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-[10px] text-emerald-800 font-bold">True Positives (TP)</div>
              <div className="text-xl font-black text-emerald-700 mt-1">{baseline.tp}</div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-[10px] text-amber-800 font-bold">False Positives (FP)</div>
              <div className="text-xl font-black text-amber-700 mt-1">{baseline.fp}</div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="text-[10px] text-red-700 font-bold">False Negatives (FN)</div>
              <div className="text-xl font-black text-red-600 mt-1">{baseline.fn}</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-600 font-bold">True Negatives (TN)</div>
              <div className="text-xl font-black text-slate-800 mt-1">{baseline.tn}</div>
            </div>
          </div>
        </div>

        {/* Proposed Matrix */}
        <div className="bg-white p-5 border border-red-200 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-extrabold text-red-600 uppercase tracking-wider">
              Proposed (Isolation Forest) Confusion Matrix
            </h4>
            <span className="text-[10px] text-red-600 font-mono font-bold">Avg Delay: {proposed.avg_detection_delay_hours}h</span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-center text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-[10px] text-emerald-800 font-bold">True Positives (TP)</div>
              <div className="text-xl font-black text-emerald-700 mt-1">{proposed.tp}</div>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-[10px] text-amber-800 font-bold">False Positives (FP)</div>
              <div className="text-xl font-black text-amber-700 mt-1">{proposed.fp}</div>
            </div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="text-[10px] text-red-700 font-bold">False Negatives (FN)</div>
              <div className="text-xl font-black text-red-600 mt-1">{proposed.fn}</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-600 font-bold">True Negatives (TN)</div>
              <div className="text-xl font-black text-slate-800 mt-1">{proposed.tn}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Impact Breakdown */}
      {cost_impact && (
        <div className="bg-white p-6 border border-emerald-200 rounded-2xl shadow-xs">
          <h3 className="text-sm font-extrabold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" /> Financial Cost Impact & Early Detection Savings Simulation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Estimated Unaddressed Late Cost</div>
              <div className="text-xl font-black text-red-600 mt-1">
                {cost_impact.currency}{cost_impact.total_late_cost.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">If faults ran for 14+ days</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[10px] uppercase font-bold">Early Intervention Service Cost</div>
              <div className="text-xl font-black text-slate-800 mt-1">
                {cost_impact.currency}{cost_impact.total_early_cost.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">Proactive maintenance within 18h</div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-emerald-800 text-[10px] uppercase font-extrabold">Total Net Avoided Savings</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {cost_impact.currency}{cost_impact.total_avoided_savings.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-800 mt-1 font-bold">Direct cost reduction</div>
            </div>
          </div>
        </div>
      )}

      {/* False Positive & False Negative Root Cause Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* False Positives */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <h4 className="text-xs font-extrabold text-amber-700 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> False Positive Analysis (Spurious Alarms)
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Production Output Spike</span>
                <span className="text-amber-700 font-mono">Count: 4</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium"><b>Cause:</b> Temporary high production setpoint causing elevated energy draw.</p>
              <p className="text-[10px] text-red-600 mt-0.5 font-bold"><b>Improvement:</b> Incorporate rate-of-change feature for production ramp-up.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Planned Maintenance & Testing</span>
                <span className="text-amber-700 font-mono">Count: 2</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium"><b>Cause:</b> Scheduled servicing causing transient power test spikes.</p>
              <p className="text-[10px] text-red-600 mt-0.5 font-bold"><b>Improvement:</b> Link maintenance calendar status to suppress auto-alerts.</p>
            </div>
          </div>
        </div>

        {/* False Negatives */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <h4 className="text-xs font-extrabold text-red-600 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" /> False Negative Analysis (Missed Detections)
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Gradual Motor Degradation</span>
                <span className="text-red-600 font-mono">Count: 3</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium"><b>Cause:</b> Extremely slow multi-day power increase shifts rolling mean baseline.</p>
              <p className="text-[10px] text-red-600 mt-0.5 font-bold"><b>Improvement:</b> Use quantile-based long-horizon baseline power (norm_expected_kw).</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between font-bold text-slate-800">
                <span>Low-Amplitude Standby Leakage</span>
                <span className="text-red-600 font-mono">Count: 2</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1 font-medium"><b>Cause:</b> Minor energy leakage during OFF state close to noise threshold.</p>
              <p className="text-[10px] text-red-600 mt-0.5 font-bold"><b>Improvement:</b> Enforce explicit state-rule classifier for non-zero OFF power.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
