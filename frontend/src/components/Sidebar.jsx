import React from 'react';
import { 
  LayoutDashboard, 
  Zap, 
  Cpu, 
  ShieldAlert, 
  BarChart3, 
  Wrench, 
  CheckCircle2, 
  FlaskConical, 
  FileText, 
  Settings, 
  Sliders, 
  Sparkles,
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck,
  Layers,
  Radio
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  activeAlertsCount = 0, 
  isCollapsed, 
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  currentUser
}) {
  const role = currentUser?.role || 'ADMIN';

  // Role Permissions filter
  const isAllowed = (id) => {
    if (role === 'ADMIN') return true;
    if (role === 'FACILITY_OPERATOR') {
      return ['overview', 'live-energy', 'equipment', 'alerts', 'maintenance', 'streaming-health', 'reports', 'settings', 'demo'].includes(id);
    }
    if (role === 'TECHNICAL_ENGINEER') {
      return ['overview', 'equipment', 'alerts', 'analytics', 'ai-insights', 'evaluation', 'benchmark', 'data-quality', 'model-registry', 'edge-cases', 'reports', 'settings'].includes(id);
    }
    return true;
  };

  const navGroups = [
    {
      title: 'MONITOR',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'live-energy', label: 'Live Energy', icon: Zap },
        { id: 'equipment', label: 'Equipment', icon: Cpu },
        { id: 'alerts', label: 'Alerts', icon: ShieldAlert, badge: activeAlertsCount },
      ].filter(item => isAllowed(item.id))
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
        { id: 'evaluation', label: 'ML Evaluation', icon: CheckCircle2 },
        { id: 'benchmark', label: 'Benchmark ML', icon: Database },
        { id: 'data-quality', label: 'Data Quality', icon: ShieldCheck },
        { id: 'model-registry', label: 'Model Registry', icon: Layers },
        { id: 'edge-cases', label: 'Edge Cases', icon: FlaskConical },
      ].filter(item => isAllowed(item.id))
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'streaming-health', label: 'Streaming Health', icon: Radio },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'demo', label: 'Demo Center', icon: Sliders, highlight: true },
      ].filter(item => isAllowed(item.id))
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ].filter(item => isAllowed(item.id))
    }
  ].filter(group => group.items.length > 0);

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      <aside className={`transition-all duration-300 z-50 flex flex-col border-r border-slate-200 bg-white ${
        isMobileOpen ? 'fixed inset-y-0 left-0 w-64 shadow-xl' : 'hidden md:flex'
      } ${isCollapsed ? 'md:w-16' : 'md:w-64'}`}>
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 bg-white">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-sm shadow-red-600/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-0.5">
                  Energy<span className="text-red-600">IQ</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Campus SaaS v2.5</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List with Category Groups */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-3 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
                  {group.title}
                </h3>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative group ${
                      isActive
                        ? 'bg-red-50 text-red-700 font-bold border-l-4 border-red-600 shadow-xs'
                        : item.highlight
                        ? 'text-amber-700 hover:bg-amber-50 border border-amber-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-red-600' : item.highlight ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-700'
                    }`} />
                    
                    {!isCollapsed && <span className="truncate">{item.label}</span>}

                    {item.badge > 0 && (
                      <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                        isCollapsed ? 'absolute top-1 right-1' : ''
                      } bg-red-100 text-red-700 border border-red-200`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Role Badge */}
        {!isCollapsed && (
          <div className="p-3 m-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
            <div className="text-[11px]">
              <p className="font-bold text-slate-800">Role: <span className="text-red-600">{role}</span></p>
              <p className="text-[10px] text-emerald-600 font-semibold">● RBAC Active</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
