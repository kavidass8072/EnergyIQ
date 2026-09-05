const API_BASE_URL = "http://localhost:8000/api";

export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE_URL}/dashboard/summary`);
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function fetchPowerFlowHistory(hours = 48) {
  const res = await fetch(`${API_BASE_URL}/dashboard/power-flow?hours=${hours}`);
  if (!res.ok) throw new Error("Failed to fetch power flow");
  return res.json();
}

export async function fetchAllEquipment() {
  const res = await fetch(`${API_BASE_URL}/equipment`);
  if (!res.ok) throw new Error("Failed to fetch equipment list");
  return res.json();
}

export async function fetchEquipmentHistory(equipmentId, hours = 72) {
  const res = await fetch(`${API_BASE_URL}/equipment/${equipmentId}/history?hours=${hours}`);
  if (!res.ok) throw new Error("Failed to fetch equipment history");
  return res.json();
}

export async function fetchAlerts(status = null, severity = null, equipmentId = null) {
  let url = `${API_BASE_URL}/alerts?`;
  if (status) url += `status=${status}&`;
  if (severity) url += `severity=${severity}&`;
  if (equipmentId) url += `equipment_id=${equipmentId}&`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function fetchAlertDetail(alertId) {
  const res = await fetch(`${API_BASE_URL}/alerts/${alertId}`);
  if (!res.ok) throw new Error("Failed to fetch alert detail");
  return res.json();
}

export async function reviewAlert(alertId, status, notes = "") {
  const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, resolution_notes: notes })
  });
  if (!res.ok) throw new Error("Failed to update alert review status");
  return res.json();
}

export async function fetchEvaluationReport() {
  const res = await fetch(`${API_BASE_URL}/evaluation/compare`);
  if (!res.ok) throw new Error("Failed to fetch evaluation report");
  return res.json();
}

export async function runEdgeCases() {
  const res = await fetch(`${API_BASE_URL}/edge-cases/run`);
  if (!res.ok) throw new Error("Failed to run edge cases");
  return res.json();
}

export async function reseedDataset(days = 60) {
  const res = await fetch(`${API_BASE_URL}/admin/reseed?days=${days}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reseed dataset");
  return res.json();
}

export async function injectDemoFault(equipmentId = "Motor-01", faultType = "MECHANICAL_RESISTANCE") {
  const res = await fetch(`${API_BASE_URL}/demo/inject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ equipment_id: equipmentId, fault_type: faultType })
  });
  if (!res.ok) throw new Error("Failed to inject demo fault");
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE_URL}/demo/reset`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset demo data");
  return res.json();
}

export async function fetchMaintenanceOverview() {
  const res = await fetch(`${API_BASE_URL}/maintenance`);
  if (!res.ok) throw new Error("Failed to fetch maintenance data");
  return res.json();
}

export async function createMaintenanceTask(taskData) {
  const res = await fetch(`${API_BASE_URL}/maintenance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error("Failed to create maintenance task");
  return res.json();
}

export async function updateMaintenanceTaskStatus(taskId, status) {
  const res = await fetch(`${API_BASE_URL}/maintenance/${taskId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Failed to update maintenance task status");
  return res.json();
}

export async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE_URL}/analytics/summary`);
  if (!res.ok) throw new Error("Failed to fetch analytics summary");
  return res.json();
}

export async function generateReport(reportType = "system_health") {
  const res = await fetch(`${API_BASE_URL}/reports/generate?type=${reportType}`);
  if (!res.ok) throw new Error("Failed to generate report");
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE_URL}/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function saveSettings(settingsData) {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settingsData)
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

export async function globalSearch(query) {
  const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to execute search");
  return res.json();
}
