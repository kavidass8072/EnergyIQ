# 🛡️ EnergyIQ Role-Based Access Control (RBAC) Matrix

## 1. Overview
EnergyIQ enforces strict backend dependency-level role authorization. Frontend navigation elements dynamically adjust based on the authenticated user's assigned role.

---

## 2. Permission Matrix

| Navigation View / Resource | `ADMIN` | `FACILITY_OPERATOR` | `TECHNICAL_ENGINEER` |
| :--- | :---: | :---: | :---: |
| **Executive Overview** | ✅ | ✅ | ✅ |
| **Live Energy & Streaming** | ✅ | ✅ | ❌ |
| **Equipment Inventory** | ✅ | ✅ | ✅ |
| **Alert Inbox & Inspector** | ✅ | ✅ | ✅ |
| **Maintenance Work Orders** | ✅ | ✅ | ❌ |
| **Analytics Workbench** | ✅ | ❌ | ✅ |
| **AI Insights** | ✅ | ❌ | ✅ |
| **ML Model Evaluation** | ✅ | ❌ | ✅ |
| **Benchmark Dataset Engine** | ✅ | ❌ | ✅ |
| **Data Quality Service** | ✅ | ❌ | ✅ |
| **Edge Case Workbench** | ✅ | ❌ | ✅ |
| **Executive Reports** | ✅ | ✅ | ✅ |
| **Demo Fault Simulation** | ✅ | ✅ | ❌ |
| **System Settings & Users** | ✅ | ✅ (Read) | ❌ |
