const API_BASE_URL = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || "http://localhost:8000/api";

export function getAuthToken() {
  return localStorage.getItem("energyiq_token");
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("energyiq_token", token);
  } else {
    localStorage.removeItem("energyiq_token");
  }
}

export function clearAuthToken() {
  localStorage.removeItem("energyiq_token");
  localStorage.removeItem("energyiq_user");
}

function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  const headers = { "Content-Type": "application/json", ...extraHeaders };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Auth APIs
export async function loginUser(username, password) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
  } catch (netErr) {
    throw new Error(`Unable to connect to EnergyIQ backend at ${API_BASE_URL}. Please ensure the backend server is running.`);
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || "Invalid username or password");
  }
  const data = await res.json();
  setAuthToken(data.access_token);
  localStorage.setItem("energyiq_user", JSON.stringify(data.user));
  return data;
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE_URL}/auth/users`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function createUser(userData) {
  const res = await fetch(`${API_BASE_URL}/auth/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export async function fetchAuditLogs(limit = 50) {
  const res = await fetch(`${API_BASE_URL}/auth/audit-logs?limit=${limit}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}

// Core Dashboard & Equipment APIs
export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE_URL}/dashboard/summary`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}

export async function fetchPowerFlowHistory(hours = 48) {
  const res = await fetch(`${API_BASE_URL}/dashboard/power-flow?hours=${hours}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch power flow");
  return res.json();
}

export async function fetchAllEquipment() {
  const res = await fetch(`${API_BASE_URL}/equipment`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch equipment list");
  return res.json();
}

export async function fetchEquipmentHistory(equipmentId, hours = 72) {
  const res = await fetch(`${API_BASE_URL}/equipment/${equipmentId}/history?hours=${hours}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch equipment history");
  return res.json();
}

export async function fetchEquipmentHealthHistory(equipmentId, days = 30) {
  const res = await fetch(`${API_BASE_URL}/equipment/${equipmentId}/health-history?days=${days}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch equipment health history");
  return res.json();
}

export async function fetchAlerts(status = null, severity = null, equipmentId = null) {
  let url = `${API_BASE_URL}/alerts?`;
  if (status) url += `status=${status}&`;
  if (severity) url += `severity=${severity}&`;
  if (equipmentId) url += `equipment_id=${equipmentId}&`;
  
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function fetchCorrelatedAlerts() {
  const res = await fetch(`${API_BASE_URL}/alerts/correlated`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch correlated alerts");
  return res.json();
}

export async function fetchAlertDetail(alertId) {
  const res = await fetch(`${API_BASE_URL}/alerts/${alertId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch alert detail");
  return res.json();
}

export async function reviewAlert(alertId, status, notes = "") {
  const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/review`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, resolution_notes: notes })
  });
  if (!res.ok) throw new Error("Failed to update alert review status");
  return res.json();
}

export async function fetchEvaluationReport() {
  const res = await fetch(`${API_BASE_URL}/evaluation/compare`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch evaluation report");
  return res.json();
}

export async function runEdgeCases() {
  const res = await fetch(`${API_BASE_URL}/edge-cases/run`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to run edge cases");
  return res.json();
}

export async function reseedDataset(days = 60) {
  const res = await fetch(`${API_BASE_URL}/admin/reseed?days=${days}`, { method: "POST", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to reseed dataset");
  return res.json();
}

export async function injectDemoFault(equipmentId = "Motor-01", faultType = "MECHANICAL_RESISTANCE") {
  const res = await fetch(`${API_BASE_URL}/demo/inject`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ equipment_id: equipmentId, fault_type: faultType })
  });
  if (!res.ok) throw new Error("Failed to inject demo fault");
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${API_BASE_URL}/demo/reset`, { method: "POST", headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to reset demo data");
  return res.json();
}

export async function fetchMaintenanceOverview() {
  const res = await fetch(`${API_BASE_URL}/maintenance`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch maintenance data");
  return res.json();
}

export async function createMaintenanceTask(taskData) {
  const res = await fetch(`${API_BASE_URL}/maintenance`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error("Failed to create maintenance task");
  return res.json();
}

export async function updateMaintenanceTaskStatus(taskId, status) {
  const res = await fetch(`${API_BASE_URL}/maintenance/${taskId}/status`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Failed to update maintenance task status");
  return res.json();
}

export async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE_URL}/analytics/summary`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch analytics summary");
  return res.json();
}

export async function generateReport(reportType = "system_health") {
  const res = await fetch(`${API_BASE_URL}/reports/generate?type=${reportType}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to generate report");
  return res.json();
}

export async function fetchSettings() {
  const res = await fetch(`${API_BASE_URL}/settings`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function saveSettings(settingsData) {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(settingsData)
  });
  if (!res.ok) throw new Error("Failed to save settings");
  return res.json();
}

export async function globalSearch(query) {
  const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to execute search");
  return res.json();
}

// Milestone 2 & 3 Feature APIs
export async function startStreaming(interval = 2.0) {
  const res = await fetch(`${API_BASE_URL}/streaming/start`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ interval })
  });
  if (!res.ok) throw new Error("Failed to start streaming");
  return res.json();
}

export async function stopStreaming() {
  const res = await fetch(`${API_BASE_URL}/streaming/stop`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to stop streaming");
  return res.json();
}

export async function fetchStreamingStatus() {
  const res = await fetch(`${API_BASE_URL}/streaming/status`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch streaming status");
  return res.json();
}

export async function setStreamingScenario(scenario) {
  const res = await fetch(`${API_BASE_URL}/streaming/scenario`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ scenario })
  });
  if (!res.ok) throw new Error("Failed to set streaming scenario");
  return res.json();
}

export async function injectStreamingFault(assetId, faultType) {
  const res = await fetch(`${API_BASE_URL}/streaming/inject`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ asset_id: assetId, fault_type: faultType })
  });
  if (!res.ok) throw new Error("Failed to inject streaming fault");
  return res.json();
}

export async function fetchBenchmarkAdapters() {
  const res = await fetch(`${API_BASE_URL}/benchmark/adapters`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch benchmark adapters");
  return res.json();
}

export async function runBenchmarkEvaluation(adapterId = "synthetic") {
  const res = await fetch(`${API_BASE_URL}/benchmark/evaluate?adapter_id=${adapterId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to run benchmark evaluation");
  return res.json();
}

export async function fetchDataQualitySummary() {
  const res = await fetch(`${API_BASE_URL}/data-quality/summary`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch data quality summary");
  return res.json();
}

export async function fetchNotifications(unreadOnly = false) {
  const res = await fetch(`${API_BASE_URL}/notifications?unread_only=${unreadOnly}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function markNotificationRead(id) {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to mark notification read");
  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to mark all notifications read");
  return res.json();
}

export async function fetchSystemHealth() {
  const res = await fetch(`${API_BASE_URL}/system/health`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch system health");
  return res.json();
}

export async function fetchSystemMetrics() {
  const res = await fetch(`${API_BASE_URL}/system/metrics`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch system metrics");
  return res.json();
}

export async function fetchModelRegistry() {
  const res = await fetch(`${API_BASE_URL}/ml/models`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch model registry");
  return res.json();
}

export async function activateModel(modelId) {
  const res = await fetch(`${API_BASE_URL}/ml/models/${modelId}/activate`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to activate model");
  return res.json();
}

export async function fetchModelDrift() {
  const res = await fetch(`${API_BASE_URL}/ml/drift`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch model drift metrics");
  return res.json();
}
