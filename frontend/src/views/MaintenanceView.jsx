import React, { useState, useEffect } from 'react';
import { Wrench, Sparkles, Plus, RefreshCw } from 'lucide-react';
import { fetchMaintenanceOverview, updateMaintenanceTaskStatus, createMaintenanceTask } from '../services/api';

export default function MaintenanceView({ showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTask, setNewTask] = useState({
    equipment_id: 'HVAC-01',
    equipment_type: 'HVAC',
    priority: 'HIGH',
    issue_description: '',
    assigned_technician: 'Rajesh Kumar'
  });

  const loadData = async () => {
    try {
      const res = await fetchMaintenanceOverview();
      setData(res);
    } catch (err) {
      console.error("Maintenance load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await updateMaintenanceTaskStatus(taskId, newStatus);
      if (showToast) showToast(`Task #${taskId} updated to ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      console.error("Status update error:", err);
      if (showToast) showToast('Failed to update task status', 'error');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await createMaintenanceTask(newTask);
      if (showToast) showToast(`Maintenance task created for ${newTask.equipment_id}`, 'success');
      setShowCreateModal(false);
      setNewTask({
        equipment_id: 'HVAC-01',
        equipment_type: 'HVAC',
        priority: 'HIGH',
        issue_description: '',
        assigned_technician: 'Rajesh Kumar'
      });
      loadData();
    } catch (err) {
      console.error("Create task error:", err);
      if (showToast) showToast('Failed to create task', 'error');
    }
  };

  if (loading) {
    return (
      <div className="h-64 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col items-center justify-center space-y-3 text-slate-500 text-xs font-semibold">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin" />
        <p>Loading predictive maintenance schedule & work orders...</p>
      </div>
    );
  }

  const tasks = data?.tasks || [];
  const aiInsights = data?.ai_insights || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-red-600" /> Maintenance Planning & Predictive Work Orders
          </h2>
          <p className="text-xs text-slate-500 mt-1">Schedule equipment servicing, track overdue repairs, and act on AI preventive maintenance insights.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Maintenance Task
        </button>
      </div>

      {/* AI Predictive Maintenance Insights Section */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-600" /> AI Predictive Maintenance Insights
          </h3>
          <span className="text-[10px] text-slate-500 font-medium">Assisted AI Predictions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiInsights.length > 0 ? (
            aiInsights.map((insight, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">{insight.equipment_id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    insight.risk === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    Risk: {insight.risk}
                  </span>
                </div>
                <p className="text-xs text-red-600 font-bold">{insight.likely_issue}</p>
                <p className="text-[11px] text-slate-600 font-medium">{insight.reason}</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Confidence: <b className="text-slate-900">{insight.confidence}%</b></span>
                  <span className="text-amber-700 font-bold">Inspect within 24h</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 col-span-3 font-medium">No active AI predictive maintenance alerts currently flagged.</p>
          )}
        </div>
      </div>

      {/* Maintenance Tasks Table */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          Active & Completed Maintenance Schedule
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Task ID</th>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Assigned Tech</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {tasks.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">#{t.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{t.equipment_id}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.priority === 'HIGH' || t.priority === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs truncate font-medium">{t.issue_description}</td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{t.assigned_technician}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{t.due_date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      t.status === 'OVERDUE' ? 'bg-red-100 text-red-700 border border-red-200' :
                      t.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {t.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleStatusUpdate(t.id, 'COMPLETED')}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 transition-all shadow-xs"
                      >
                        Mark Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Maintenance Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Create New Maintenance Task</h3>
            <form onSubmit={handleTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Equipment Asset ID</label>
                <select
                  value={newTask.equipment_id}
                  onChange={(e) => setNewTask({ ...newTask, equipment_id: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="HVAC-01">HVAC-01 (HVAC)</option>
                  <option value="HVAC-02">HVAC-02 (HVAC)</option>
                  <option value="Motor-01">Motor-01 (Heavy Motor)</option>
                  <option value="Compressor-01">Compressor-01 (Industrial Compressor)</option>
                  <option value="Pump-01">Pump-01 (Fluid Pump)</option>
                  <option value="Production-Line-01">Production-Line-01 (Assembly Line)</option>
                  <option value="Cooling-Unit-01">Cooling-Unit-01 (Chiller)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Assigned Technician</label>
                <input
                  type="text"
                  value={newTask.assigned_technician}
                  onChange={(e) => setNewTask({ ...newTask, assigned_technician: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Issue Description & Maintenance Reason</label>
                <textarea
                  value={newTask.issue_description}
                  onChange={(e) => setNewTask({ ...newTask, issue_description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 h-20 font-medium focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  placeholder="Describe maintenance scope..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold hover:bg-red-700 shadow-xs text-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
