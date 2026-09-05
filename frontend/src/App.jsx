import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Toast from './components/Toast';
import AlertDetailModal from './components/AlertDetailModal';
import DemoControlPanel from './components/DemoControlPanel';

import DashboardView from './views/DashboardView';
import LiveEnergyView from './views/LiveEnergyView';
import EquipmentView from './views/EquipmentView';
import AlertsView from './views/AlertsView';
import AnalyticsView from './views/AnalyticsView';
import MaintenanceView from './views/MaintenanceView';
import AIInsightsView from './views/AIInsightsView';
import EvaluationView from './components/EvaluationView';
import EdgeCaseWorkbenchView from './views/EdgeCaseWorkbenchView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';

import { 
  fetchDashboardSummary, 
  fetchPowerFlowHistory, 
  fetchAllEquipment, 
  fetchAlerts 
} from './services/api';

import { RefreshCw } from 'lucide-react';

export default function App() {
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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadDashboardData = async () => {
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
    loadDashboardData();
  }, []);

  // Periodic Auto-refresh interval (every 15s if enabled)
  useEffect(() => {
    let interval = null;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadDashboardData();
      }, 15000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleInspectEquipment = (equipmentId) => {
    setSelectedEquipmentId(equipmentId);
    setActiveTab('equipment');
  };

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
          />

          {/* Main Workspace Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {loading ? (
              <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3 text-slate-500 font-semibold">
                <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
                <p className="text-xs">Connecting to FastAPI Backend & Telemetry Pipeline...</p>
              </div>
            ) : (
              <>
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

                {/* 8. Edge Cases Workbench Tab */}
                {activeTab === 'edge-cases' && (
                  <EdgeCaseWorkbenchView />
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
              </>
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
