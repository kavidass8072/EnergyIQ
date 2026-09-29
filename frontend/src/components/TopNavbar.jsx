import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  CheckCircle2, 
  ShieldAlert, 
  Wrench, 
  Cpu, 
  X,
  ChevronDown,
  LogOut,
  Sliders,
  Menu,
  Activity,
  Radio,
  ShieldCheck
} from 'lucide-react';
import { globalSearch, fetchNotifications, markAllNotificationsRead } from '../services/api';

export default function TopNavbar({ 
  theme, 
  toggleTheme, 
  alerts = [], 
  onSelectAlert, 
  onSelectEquipment,
  setActiveTab,
  onToggleSidebar,
  currentUser,
  onLogout,
  wsConnected,
  streamStatus
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationsData, setNotificationsData] = useState({ unread_count: 0, notifications: [] });
  const searchRef = useRef(null);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.severity === 'HIGH' || a.severity === 'CRITICAL');

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const res = await globalSearch(searchQuery);
          setSearchResults(res);
          setIsSearchOpen(true);
        } catch (err) {
          console.error("Search error:", err);
        }
      } else {
        setSearchResults(null);
        setIsSearchOpen(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  // Load persisted notifications
  const loadNotifs = async () => {
    try {
      const data = await fetchNotifications();
      setNotificationsData(data);
    } catch (e) {
      // fallback
    }
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      loadNotifs();
    } catch (e) {}
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between z-20 relative transition-colors">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900"
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar */}
        <div className="relative w-48 sm:w-80 md:w-96" ref={searchRef}>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
              placeholder="Search equipment, alerts, faults, work orders..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Global Search Results Dropdown */}
          {isSearchOpen && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {searchResults.equipment?.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-red-600" /> Equipment Assets
                  </p>
                  <div className="space-y-1">
                    {searchResults.equipment.map(eq => (
                      <button
                        key={eq.equipment_id}
                        onClick={() => {
                          onSelectEquipment(eq.equipment_id);
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 transition-colors"
                      >
                        <span className="font-bold text-red-600">{eq.equipment_id}</span>
                        <span className="text-[10px] text-slate-400">{eq.equipment_type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {searchResults.alerts?.length > 0 && (
                <div className="p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3 text-red-600" /> AI Anomaly Alerts
                  </p>
                  <div className="space-y-1">
                    {searchResults.alerts.map(al => (
                      <button
                        key={al.id}
                        onClick={() => {
                          onSelectAlert(al);
                          setIsSearchOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">{al.equipment_id}</span>
                          <span className="text-[10px] text-slate-500 ml-2">{al.likely_fault}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          al.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {al.severity}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        
        {/* WebSocket Stream Indicator */}
        <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
          wsConnected 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'animate-pulse text-emerald-600' : 'text-amber-500'}`} />
          <span>{wsConnected ? 'STREAM CONNECTED' : 'STREAM DISCONNECTED'}</span>
        </div>

        {/* Dynamic System Status Badge */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
          activeAlerts.some(a => a.severity === 'CRITICAL')
            ? 'bg-red-50 border border-red-200 text-red-700'
            : activeAlerts.some(a => a.severity === 'HIGH')
            ? 'bg-amber-50 border border-amber-200 text-amber-700'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            activeAlerts.some(a => a.severity === 'CRITICAL') ? 'bg-red-600 animate-ping' :
            activeAlerts.some(a => a.severity === 'HIGH') ? 'bg-amber-500 animate-ping' :
            'bg-emerald-600 animate-pulse'
          }`}></span>
          <span>
            {activeAlerts.some(a => a.severity === 'CRITICAL') ? '● Degraded' :
             activeAlerts.some(a => a.severity === 'HIGH') ? '● Warning' :
             '● System Healthy'}
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notificationsData.unread_count > 0 && (
              <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {notificationsData.unread_count}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> System Notifications
                </h4>
                <button
                  onClick={handleMarkAllRead}
                  className="text-[10px] text-red-600 hover:underline font-bold"
                >
                  Mark all read
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notificationsData.notifications?.length > 0 ? (
                  notificationsData.notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{n.title}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          n.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                        }`}>{n.severity}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                    No unread notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-red-600 to-rose-700 flex items-center justify-center text-white text-xs font-bold shadow-xs uppercase">
              {currentUser?.username ? currentUser.username.substring(0, 2) : 'US'}
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-bold text-slate-800 leading-tight">{currentUser?.username || 'User'}</p>
              <p className="text-[10px] text-red-600 font-bold uppercase">{currentUser?.role || 'OPERATOR'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                <p className="font-bold text-slate-800">{currentUser?.username}</p>
                <span className="inline-block mt-0.5 px-2 py-0.5 bg-red-100 text-red-800 text-[9px] font-black rounded-md uppercase">
                  {currentUser?.role}
                </span>
              </div>
              <button 
                onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
              >
                <Sliders className="w-3.5 h-3.5 text-red-600" /> System Settings
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button 
                onClick={onLogout}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600 flex items-center gap-2 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
