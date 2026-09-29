import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Toast from './components/Toast';
import AlertDetailModal from './components/AlertDetailModal';
import DemoControlPanel from './components/DemoControlPanel';
import LoginView from './components/LoginView';
import ErrorBoundary from './components/ErrorBoundary';

import DashboardView from './views/DashboardView';
import LiveEnergyView from './views/LiveEnergyView';
import EquipmentView from './views/EquipmentView';
import AlertsView from './views/AlertsView';
import AnalyticsView from './views/AnalyticsView';
import MaintenanceView from './views/MaintenanceView';
import AIInsightsView from './views/AIInsightsView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';

// Lazy-loaded routes for code-splitting and bundle size optimization
const EvaluationView = lazy(() => import('./components/EvaluationView'));
const EdgeCaseWorkbenchView = lazy(() => import('./views/EdgeCaseWorkbenchView'));
const BenchmarkView = lazy(() => import('./views/BenchmarkView'));
const DataQualityView = lazy(() => import('./views/DataQualityView'));
const ModelRegistryView = lazy(() => import('./views/ModelRegistryView'));
const StreamingHealthView = lazy(() => import('./views/StreamingHealthView'));

import { 
  fetchDashboardSummary, 
  fetchPowerFlowHistory, 
  fetchAllEquipment, 
  fetchAlerts,
  clearAuthToken,
  fetchCurrentUser,
  fetchStreamingStatus
} from './services/api';

import { RefreshCw } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("energyiq_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [theme, setTheme] = useState('light');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const [summary, setSummary] = useState(null);
  const [powerFlow, setPowerFlow] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [alerts, setAlerts] = useState([]);
  
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [toast, setToast] = useState(null);

  // WebSocket Streaming State
  const [wsConnected, setWsConnected] = useState(false);
  const [streamStatus, setStreamStatus] = useState(null);
  const wsRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadDashboardData = async () => {
    if (!currentUser) return;
    try {
      const [sumData, flowData, eqData, alertData] = await Promise.all([
        fetchDashboardSummary(),
        fetchPowerFlowHistory(48),
        fetchAllEquipment(),
        fetchAlerts(null, null, null)
      ]);

      setSummary(sumData);
      setPowerFlow(flowData.history || []);
      setEquipment(eqData.equipment || []);
      setAlerts(alertData.alerts || []);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  // Periodic Auto-refresh interval (every 15s if enabled)
  useEffect(() => {
    let interval = null;
    if (autoRefresh && currentUser) {
      interval = setInterval(() => {
        loadDashboardData();
      }, 15000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, currentUser]);

  // WebSocket Streaming connection setup
  useEffect(() => {
    if (!currentUser) return;

    let socket = null;
    const connectWS = () => {
      try {
        const envUrl = import.meta.env && import.meta.env.VITE_API_BASE_URL;
        let wsUrl = "ws://localhost:8000/api/streaming/ws";
        if (envUrl) {
          const wsProto = envUrl.startsWith("https") ? "wss" : "ws";
          wsUrl = envUrl.replace(/^https?:\/\//, `${wsProto}://`) + "/streaming/ws";
        }
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setWsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const frame = JSON.parse(event.data);
            if (frame.type === "TELEMETRY_TICK") {
              if (frame.stats) setStreamStatus(frame.stats);
              if (frame.alert) {
                showToast(`Anomaly Alert: ${frame.alert.equipment_id} - ${frame.alert.likely_fault}`, 'warning');
                loadDashboardData();
              }
            }
          } catch (e) {}
        };

        socket.onclose = () => {
          setWsConnected(false);
          // Reconnect attempt after 5s
          setTimeout(connectWS, 5000);
        };

        socket.onerror = () => {
          setWsConnected(false);
        };
      } catch (e) {
        setWsConnected(false);
      }
    };

    connectWS();

    return () => {
      if (socket) socket.close();
    };
  }, [currentUser]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleInspectEquipment = (equipmentId) => {
    setSelectedEquipmentId(equipmentId);
    setActiveTab('equipment');
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
    showToast("Signed out successfully", "info");
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => { setCurrentUser(user); showToast(`Welcome back, ${user.username}!`, "success"); }} />;
  }

  const activeAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col font-sans selection:bg-red-500 selection:text-white">
      <div className="flex flex-1 min-h-screen">
        {/* Sidebar Shell */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAlertsCount={activeAlertsCount}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          currentUser={currentUser}
        />

        {/* Main Content Shell */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navbar */}
          <TopNavbar
            theme={theme}
            toggleTheme={toggleTheme}
            alerts={alerts}
            onSelectAlert={(al) => setSelectedAlert(al)}
            onSelectEquipment={handleInspectEquipment}
            setActiveTab={setActiveTab}
            onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
            currentUser={currentUser}
            onLogout={handleLogout}
            wsConnected={wsConnected}
            streamStatus={streamStatus}
          />

          {/* Main Workspace Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {loading ? (
              <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3 text-slate-500 font-semibold">
                <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
                <p className="text-xs">Connecting to FastAPI Backend & Telemetry Pipeline...</p>
              </div>
            ) : (
              <ErrorBoundary key={activeTab}>
                <Suspense fallback={
                  <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3 text-slate-500 font-semibold">
                    <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
                    <p className="text-xs">Loading EnergyIQ View Module...</p>
                  </div>
                }>
                  {/* 1. Dashboard Overview Tab */}
                  {activeTab === 'overview' && (
                    <DashboardView
                      summary={summary}
                      powerFlow={powerFlow}
                      equipment={equipment}
                      alerts={alerts}
                      onInspectEquipment={handleInspectEquipment}
                      onInspectAlert={(al) => setSelectedAlert(al)}
                      onRefresh={loadDashboardData}
                      autoRefresh={autoRefresh}
                      setAutoRefresh={setAutoRefresh}
                      lastUpdated={lastUpdated}
                    />
                  )}

                  {/* 2. Live Energy Tab */}
                  {activeTab === 'live-energy' && (
                    <LiveEnergyView
                      summary={summary}
                      powerFlow={powerFlow}
                      equipment={equipment}
                    />
                  )}

                  {/* 3. Equipment & Health Tab */}
                  {activeTab === 'equipment' && (
                    <EquipmentView
                      equipmentList={equipment}
                      selectedEquipmentId={selectedEquipmentId}
                      onSelectEquipment={(id) => setSelectedEquipmentId(id)}
                      onInspectAlert={(al) => setSelectedAlert(al)}
                    />
                  )}

                  {/* 4. Alert Center Tab */}
                  {activeTab === 'alerts' && (
                    <AlertsView
                      alerts={alerts}
                      onInspectAlert={(al) => setSelectedAlert(al)}
                    />
                  )}

                  {/* 5. Analytics Tab */}
                  {activeTab === 'analytics' && (
                    <AnalyticsView />
                  )}

                  {/* 6. Maintenance Tab */}
                  {activeTab === 'maintenance' && (
                    <MaintenanceView showToast={showToast} />
                  )}

                  {/* 6b. AI Insights Tab */}
                  {activeTab === 'ai-insights' && (
                    <AIInsightsView
                      onInspectEquipment={handleInspectEquipment}
                      onInspectAlert={(al) => setSelectedAlert(al)}
                    />
                  )}

                  {/* 7. ML Evaluation Tab */}
                  {activeTab === 'evaluation' && (
                    <EvaluationView />
                  )}

                  {/* 7b. Benchmark Evaluation Tab */}
                  {activeTab === 'benchmark' && (
                    <BenchmarkView />
                  )}

                  {/* 7c. Data Quality Tab */}
                  {activeTab === 'data-quality' && (
                    <DataQualityView />
                  )}

                  {/* 7d. Model Registry Tab */}
                  {activeTab === 'model-registry' && (
                    <ModelRegistryView showToast={showToast} />
                  )}

                  {/* 8. Edge Cases Workbench Tab */}
                  {activeTab === 'edge-cases' && (
                    <EdgeCaseWorkbenchView />
                  )}

                  {/* 8b. Streaming Health Tab */}
                  {activeTab === 'streaming-health' && (
                    <StreamingHealthView showToast={showToast} />
                  )}

                  {/* 9. Executive Reports Tab */}
                  {activeTab === 'reports' && (
                    <ReportsView />
                  )}

                  {/* 10. System Settings Tab */}
                  {activeTab === 'settings' && (
                    <SettingsView showToast={showToast} />
                  )}

                  {/* 11. Demo Controls Tab */}
                  {activeTab === 'demo' && (
                    <DemoControlPanel
                      onDataUpdated={loadDashboardData}
                      showToast={showToast}
                    />
                  )}
                </Suspense>
              </ErrorBoundary>
            )}
          </main>
        </div>
      </div>

      {/* Alert Detail Inspection Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAlertReviewed={loadDashboardData}
          showToast={showToast}
        />
      )}

      {/* Toast Notification Stack */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
