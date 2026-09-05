import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, IndianRupee, ShieldAlert } from 'lucide-react';
import { fetchSettings, saveSettings } from '../services/api';

export default function SettingsView({ showToast }) {
  const [settings, setSettings] = useState({
    electricity_rate: 8.50,
    currency: '₹',
    rolling_window_hours: 24,
    anomaly_sensitivity: 'HIGH',
    auto_refresh_sec: 15,
    min_alert_duration_hr: 1,
    thresholds: {
      LOW: 1.5,
      MEDIUM: 2.0,
      HIGH: 2.5,
      CRITICAL: 3.2
    }
  });

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchSettings();
        setSettings(res);
      } catch (err) {
        console.error("Fetch settings error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveSettings(settings);
      if (showToast) showToast('System settings updated and saved to SQLite DB', 'success');
    } catch (err) {
      console.error("Save settings error:", err);
      if (showToast) showToast('Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3 text-slate-500 text-xs font-semibold">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p>Loading application settings & threshold configuration...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Header & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-red-600" /> Platform Configuration & Anomaly Thresholds
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Configure ML sensitivity levels, tariff rates, windowing periods, and refresh intervals.</p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-2"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detection Severity Thresholds */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" /> Anomaly Z-Score Sensitivity Thresholds
          </h3>
          <p className="text-xs text-slate-500 font-medium">Specify standard deviation (Z-score) thresholds for alert severity classification.</p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">LOW Severity Z-Score Threshold</label>
              <input
                type="number"
                step="0.1"
                value={settings.thresholds?.LOW || 1.5}
                onChange={(e) => setSettings({
                  ...settings,
                  thresholds: { ...settings.thresholds, LOW: parseFloat(e.target.value) }
                })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">MEDIUM Severity Z-Score Threshold</label>
              <input
                type="number"
                step="0.1"
                value={settings.thresholds?.MEDIUM || 2.0}
                onChange={(e) => setSettings({
                  ...settings,
                  thresholds: { ...settings.thresholds, MEDIUM: parseFloat(e.target.value) }
                })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">HIGH Severity Z-Score Threshold</label>
              <input
                type="number"
                step="0.1"
                value={settings.thresholds?.HIGH || 2.5}
                onChange={(e) => setSettings({
                  ...settings,
                  thresholds: { ...settings.thresholds, HIGH: parseFloat(e.target.value) }
                })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">CRITICAL Severity Z-Score Threshold</label>
              <input
                type="number"
                step="0.1"
                value={settings.thresholds?.CRITICAL || 3.2}
                onChange={(e) => setSettings({
                  ...settings,
                  thresholds: { ...settings.thresholds, CRITICAL: parseFloat(e.target.value) }
                })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>
        </div>

        {/* Cost & Operational Parameters */}
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" /> Tariff & Operational Parameters
          </h3>
          <p className="text-xs text-slate-500 font-medium">Configure financial calculation rate and pipeline window parameters.</p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Electricity Tariff Rate (₹ / kWh)</label>
              <input
                type="number"
                step="0.1"
                value={settings.electricity_rate}
                onChange={(e) => setSettings({ ...settings, electricity_rate: parseFloat(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Baseline Rolling Window (Hours)</label>
              <input
                type="number"
                value={settings.rolling_window_hours}
                onChange={(e) => setSettings({ ...settings, rolling_window_hours: parseInt(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Live Telemetry Auto Refresh Rate (Seconds)</label>
              <input
                type="number"
                value={settings.auto_refresh_sec}
                onChange={(e) => setSettings({ ...settings, auto_refresh_sec: parseInt(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Anomaly Sensitivity Preset</label>
              <select
                value={settings.anomaly_sensitivity}
                onChange={(e) => setSettings({ ...settings, anomaly_sensitivity: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              >
                <option value="LOW">LOW (Fewer alarms, higher precision)</option>
                <option value="MEDIUM">MEDIUM (Balanced target standard)</option>
                <option value="HIGH">HIGH (Strict equipment safety protection)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
