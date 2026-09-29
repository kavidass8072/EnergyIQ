import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Play, 
  Square, 
  RefreshCw, 
  Zap, 
  Wifi, 
  WifiOff, 
  Radio, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Trash2 
} from 'lucide-react';
import { 
  fetchStreamingStatus, 
  startStreaming, 
  stopStreaming, 
  setStreamingScenario, 
  injectStreamingFault,
  resetDemoData
} from '../services/api';

const SCENARIOS = [
  { id: 'NORMAL_TELEMETRY', label: 'Normal Telemetry Flow', desc: 'Standard 1-second telemetry ticks with baseline noise' },
  { id: 'MISSING_PACKET', label: 'Packet Drop / Loss', desc: 'Simulates network packet loss (drops telemetry frames)' },
  { id: 'DELAYED_PACKET', label: 'Network Latency Delay', desc: 'Applies 150ms artificial transmission lag' },
  { id: 'DUPLICATE_PACKET', label: 'Duplicate Packet Injection', desc: 'Emits duplicate telemetry records' },
  { id: 'OUT_OF_ORDER_PACKET', label: 'Out-Of-Order Timestamps', desc: 'Injects past-dated telemetry records' },
  { id: 'SENSOR_MALFUNCTION', label: 'Zero Power Malfunction', desc: 'State ON with 0 kW power output' },
  { id: 'SUDDEN_POWER_SPIKE', label: 'Sudden Power Surge (220%)', desc: 'Instantaneous 2.2x power spike' },
  { id: 'GRADUAL_POWER_DRIFT', label: 'Gradual Thermal/Power Drift', desc: 'Continuously drifting power consumption' },
  { id: 'EXTREME_TEMPERATURE', label: 'Extreme Overheating (92.5°C)', desc: 'Temperature surge to critical threshold' },
  { id: 'BURST_TRAFFIC', label: 'High Volume Traffic Burst', desc: 'Emits 3 rapid burst events per tick' }
];

export default function StreamingHealthView({ showToast }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState('Motor-01');
  const [selectedFault, setSelectedFault] = useState('MECHANICAL_RESISTANCE');
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);

  const loadStatus = async () => {
    try {
      const data = await fetchStreamingStatus();
      setStatus(data);
    } catch (err) {
      console.error("Failed to load streaming status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Connect WS for live feed preview
  useEffect(() => {
    let socket = null;
    try {
      const envUrl = import.meta.env && import.meta.env.VITE_API_BASE_URL;
      let wsUrl = "ws://localhost:8000/api/streaming/ws";
      if (envUrl) {
        const wsProto = envUrl.startsWith("https") ? "wss" : "ws";
        wsUrl = envUrl.replace(/^https?:\/\//, `${wsProto}://`) + "/streaming/ws";
      }
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data);
          if (frame.type === "TELEMETRY_TICK") {
            setLogs((prev) => [
              {
                time: new Date().toLocaleTimeString(),
                asset: frame.payload?.equipment_id,
                kw: frame.payload?.energy_kwh,
                temp: frame.payload?.temperature,
                alert: frame.alert ? frame.alert.likely_fault : null
              },
              ...prev.slice(0, 19)
            ]);
            if (frame.stats) setStatus(frame.stats);
          }
        } catch (e) {}
      };
    } catch (e) {}

    return () => {
      if (socket) socket.close();
    };
  }, []);

  const handleStart = async () => {
    try {
      await startStreaming(1.5);
      await loadStatus();
      if (showToast) showToast("Live Telemetry Streaming Started!", "success");
    } catch (err) {
      if (showToast) showToast(err.message, "error");
    }
  };

  const handleStop = async () => {
    try {
      await stopStreaming();
      await loadStatus();
      if (showToast) showToast("Telemetry Streaming Paused", "info");
    } catch (err) {
      if (showToast) showToast(err.message, "error");
    }
  };

  const handleSelectScenario = async (scId) => {
    try {
      await setStreamingScenario(scId);
      await loadStatus();
      if (showToast) showToast(`Streaming scenario set to: ${scId}`, "success");
    } catch (err) {
      if (showToast) showToast(err.message, "error");
    }
  };

  const handleInjectFault = async () => {
    try {
      await injectStreamingFault(selectedAsset, selectedFault);
      await loadStatus();
      if (showToast) showToast(`Injected ${selectedFault} into ${selectedAsset}!`, "warning");
    } catch (err) {
      if (showToast) showToast(err.message, "error");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-sm shadow-red-600/20">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Live IoT Telemetry Streaming Engine
              </h2>
              {status?.is_running ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Streaming Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-black uppercase">
                  Paused
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time WebSocket telemetry ingestion simulator supporting network degradation, packet duplication, latency, and fault injection scenarios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {status?.is_running ? (
            <button
              onClick={handleStop}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Square className="w-3.5 h-3.5 fill-current" /> Pause Stream
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Start Streaming
            </button>
          )}
        </div>
      </div>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase">Messages Sent</p>
          <p className="text-xl font-black text-slate-900 mt-1">{status?.messages_sent || 0}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Total ticks processed</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase">Active Scenario</p>
          <p className="text-xs font-mono font-black text-red-600 mt-1 truncate">{status?.active_scenario || 'NORMAL_TELEMETRY'}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Current test condition</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase">Active Faults</p>
          <p className="text-xl font-black text-slate-900 mt-1">{Object.keys(status?.active_faults || {}).length}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Assets under fault stress</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase">Duplicate Records</p>
          <p className="text-xl font-black text-slate-900 mt-1">{status?.duplicate_count || 0}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Duplicated telemetry frames</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase">Out of Order</p>
          <p className="text-xl font-black text-slate-900 mt-1">{status?.out_of_order_count || 0}</p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">Past-dated timestamps</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scenario Selection Panel */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Sliders className="w-4 h-4 text-red-600" /> Select Streaming Simulation Scenario
            </h3>
            <span className="text-xs text-slate-400 font-medium">10 Reproducible Scenarios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SCENARIOS.map((sc) => {
              const isActive = status?.active_scenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isActive
                      ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isActive ? 'text-red-700' : 'text-slate-900'}`}>
                      {sc.label}
                    </span>
                    {isActive && <CheckCircle2 className="w-4 h-4 text-red-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                    {sc.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Real-time Fault Injector */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-700">Inject Live Fault:</span>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
              >
                {['HVAC-01', 'HVAC-02', 'Motor-01', 'Compressor-01', 'Pump-01', 'Production-Line-01', 'Cooling-Unit-01'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>

              <select
                value={selectedFault}
                onChange={(e) => setSelectedFault(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
              >
                <option value="MECHANICAL_RESISTANCE">Mechanical Resistance</option>
                <option value="STANDBY_LEAKAGE">Standby Leakage</option>
                <option value="PRODUCTION_ANOMALY">Production Anomaly</option>
                <option value="ELECTRICAL_SPIKE">Electrical Spike</option>
              </select>
            </div>

            <button
              onClick={handleInjectFault}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> Inject Telemetry Fault
            </button>
          </div>
        </div>

        {/* Real-time WebSocket Feed Terminal */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-slate-200 shadow-md flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="font-mono text-xs font-bold text-slate-100">Live WS Telemetry Stream</h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">ws://localhost:8000</span>
          </div>

          <div className="flex-1 overflow-y-auto font-mono text-[11px] space-y-2 py-3">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic">Waiting for incoming streaming telemetry frames...</p>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-slate-800/60 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{log.time}</span>
                    <span className="font-bold text-red-400">{log.asset}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-200">
                    <span>Energy: <span className="text-emerald-400 font-bold">{log.kw} kW</span></span>
                    <span>Temp: <span className="text-amber-400 font-bold">{log.temp}°C</span></span>
                  </div>
                  {log.alert && (
                    <p className="text-[10px] font-bold text-red-400 bg-red-950/50 p-1 rounded border border-red-800">
                      ⚡ ANOMALY: {log.alert}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
