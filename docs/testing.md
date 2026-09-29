# EnergyIQ — Automated Testing & Test Coverage Architecture

This document provides granular technical documentation on the EnergyIQ test strategy, test coverage matrix, test modules, input/output validation methods, and failure recovery drills.

---

## 1. Testing Strategy Overview

EnergyIQ employs a multi-layered testing strategy combining:
1. **Unit Testing**: Testing individual algorithms, estimators, feature transformers, and utility functions in isolation.
2. **API Integration Testing**: Testing FastAPI router endpoints, status codes, query parameters, request body schemas, and JSON responses using `starlette.testclient.TestClient`.
3. **Authentication & RBAC Testing**: Validating JWT bearer token encoding/decoding, password hashing, and role permission enforcement (`ADMIN`, `FACILITY_OPERATOR`, `TECHNICAL_ENGINEER`).
4. **Machine Learning Pipeline Testing**: Verifying Isolation Forest predictions, score thresholds, fault-linking rules, and model registry activation/rollback.
5. **Streaming & Ingestion Testing**: Validating WebSocket framing, telemetry imputation, and 10 degradation scenario injections.
6. **Failure & Disaster Recovery Testing**: Simulating invalid tokens, malformed payloads, invalid IDs, and database hot-backups.
7. **End-to-End Lifecycle Testing**: Exercising multi-role user journeys from login to alert triage and maintenance completion.

---

## 2. Master Test Coverage Matrix

| Subsystem / Area | Test File | Test Functions | Test Scope & Validation Method |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | `tests/test_auth.py` | `test_password_hashing_and_verification`<br>`test_jwt_token_generation_and_decoding`<br>`test_valid_login_endpoint`<br>`test_invalid_password_login_endpoint`<br>`test_rbac_admin_protected_endpoint_denied_for_operator`<br>`test_rbac_admin_protected_endpoint_allowed_for_admin` | Validates PBKDF2 salt hashing, JWT decoding, login HTTP 200/401 status codes, and HTTP 403 Forbidden role guards. |
| **Core FastAPI APIs** | `tests/test_api.py` | `test_health_check`<br>`test_dashboard_summary`<br>`test_get_equipment`<br>`test_get_alerts`<br>`test_edge_cases_api`<br>`test_evaluation_api`<br>`test_demo_fault_inject`<br>`test_maintenance_api`<br>`test_analytics_api`<br>`test_reports_api`<br>`test_settings_api`<br>`test_search_api` | Verifies HTTP endpoints across Dashboard, Equipment, Alerts, Maintenance, Analytics, Reports, Settings, Search, and Edge Cases. |
| **Anomaly Engine & Fault Linker**| `tests/test_anomaly_detector.py` | `test_anomaly_detector_predict`<br>`test_fault_linking_off_leakage`<br>`test_edge_cases` | Validates Isolation Forest predictions, decision function scores, OFF state leakage rules, and edge case scenarios. |
| **Feature Engineering** | `tests/test_feature_engineering.py` | `test_feature_engineering` | Verifies rolling mean, standard deviation, and production context ratios computation. |
| **Synthetic Dataset Generator** | `tests/test_synthetic_generator.py` | `test_generate_campus_dataset` | Validates 60-day hourly synthetic telemetry generation across 7 building assets. |
| **Streaming & Scenario Engine** | `tests/test_streaming.py`<br>`tests/test_scenarios.py` | `test_streaming_validator_clean_event`<br>`test_streaming_validator_imputes_missing_and_out_of_range`<br>`test_streaming_manager_status`<br>`test_scenario_normal_telemetry`<br>`test_scenario_missing_packet`<br>`test_scenario_duplicate_packet`<br>`test_scenario_burst_traffic`<br>`test_scenario_power_spike` | Validates WebSocket packet validation, missing value imputation, and telemetry degradation scenario behavior. |
| **ML Model Registry** | `tests/test_model_registry.py` | `test_list_all_models`<br>`test_get_model_by_id`<br>`test_get_model_by_id_not_found`<br>`test_activate_model`<br>`test_model_registry_api_endpoints` | Tests model metadata listing, activation of `mod-cif-v120`, and HTTP 404 responses for non-existent model IDs. |
| **Model Drift Monitoring** | `tests/test_drift_monitor.py` | `test_calculate_psi_identical_distributions`<br>`test_calculate_psi_shifted_distributions`<br>`test_compute_model_drift_metrics`<br>`test_model_drift_api_endpoint` | Validates Population Stability Index (PSI) calculation for identical distributions (PSI ≈ 0) vs shifted distributions (PSI > 0.25). |
| **Data Quality & Notifications** | `tests/test_data_quality.py` | `test_compute_data_quality_metrics`<br>`test_data_quality_summary_api`<br>`test_notifications_api` | Tests completeness percentage, outlier count, and notification read/unread lifecycle endpoints. |
| **Alert Correlation** | `tests/test_alert_correlation.py` | `test_compute_correlated_alerts`<br>`test_correlated_alerts_api` | Tests co-occurring alert clustering algorithm and `/api/alerts/correlated` endpoint. |
| **Benchmark Evaluation** | `tests/test_benchmark.py` | `test_synthetic_dataset_adapter`<br>`test_ashrae_dataset_adapter`<br>`test_benchmark_evaluation_labeled`<br>`test_benchmark_evaluation_unsupervised_ashrae` | Tests synthetic ground-truth metrics (Precision/Recall) vs ASHRAE unsupervised anomaly rate diagnostics. |
| **System Health & Backup** | `tests/test_health_score.py`<br>`tests/test_system_health.py` | `test_equipment_health_history_endpoint`<br>`test_maintenance_overview_priority_fields`<br>`test_system_metrics_observability_endpoint`<br>`test_database_backup_and_restore_script`<br>`test_historical_model_version_retention`<br>`test_system_health_endpoint` | Tests equipment health trends, observability metrics, online database hot-backup script, and `/api/system/health`. |
| **Milestone 5 Hardening** | `tests/test_milestone5.py` | `test_system_readiness_endpoint`<br>`test_data_export_json_alerts`<br>`test_data_export_csv_telemetry`<br>`test_model_rollback_api`<br>`test_reproducible_experiment_runner_execution`<br>`test_streaming_load_test_execution`<br>`test_rate_limiter_functional_check`<br>`test_export_invalid_resource_denied`<br>`test_export_unauthenticated_denied` | Tests container readiness probes, JSON/CSV export, model rollback, reproducible experiment runner, load test script, and rate limiting. |
| **Failure Recovery** | `tests/test_failure_recovery.py` | `test_failure_invalid_jwt_token`<br>`test_failure_expired_jwt_token`<br>`test_failure_malformed_telemetry_payload`<br>`test_failure_missing_telemetry_fields`<br>`test_failure_invalid_model_activation_id`<br>`test_failure_invalid_alert_review_status`<br>`test_failure_streaming_invalid_scenario` | Verifies safe HTTP error status codes (401, 404, 400, 422) for invalid inputs, expired tokens, and malformed payloads. |
| **End-to-End Workflow** | `tests/test_e2e_workflow.py` | `test_full_end_to_end_lifecycle_workflow` | Exercises full user lifecycle: login -> dashboard -> alert review -> maintenance creation -> status completion -> audit verification. |

---

## 3. Detailed Test Module Breakdown

### 3.1 Authentication & RBAC (`tests/test_auth.py`)
- **Purpose**: Ensure stateless JWT security, password hashing, and role permission guards operate correctly.
- **Input**: User login credentials (`admin` / `admin123`, `operator` / `operator123`), expired bearer tokens, invalid passwords.
- **Expected Output**: HTTP 200 with JWT access token for valid login; HTTP 401 for invalid credentials; HTTP 403 for unauthorized role access.
- **Validation**: Assert response status codes and token payload claims.

### 3.2 Machine Learning & Fault Linker (`tests/test_anomaly_detector.py`)
- **Purpose**: Verify anomaly predictions and rule-based fault mapping.
- **Input**: Operational telemetry features (energy kWh, temperature, state, production context).
- **Expected Output**: Binary anomaly flag (`0` or `1`), anomaly score (`0.0` to `1.0`), and assigned fault label (e.g., `MECHANICAL_RESISTANCE`).
- **Validation**: Assert predictions match ground-truth edge case rules.

### 3.3 Failure & Boundary Testing (`tests/test_failure_recovery.py`)
- **Purpose**: Verify backend error handling when receiving corrupted, malformed, or unauthorized input payloads.
- **Input**: Expired JWT tokens, missing telemetry fields, invalid model activation IDs, unsupported scenario names.
- **Expected Output**: HTTP 401 (Unauthorized), HTTP 404 (Not Found), HTTP 400 (Bad Request), or HTTP 422 (Unprocessable Entity).
- **Validation**: Assert no unhandled server exceptions (500) occur and error messages are clean.

---

## 4. Test Suite Execution Command

```bash
python -m pytest tests/ -v
```

*Current Pass Rate*: **75 / 75 PASSED (100% Pass Rate)** in ~10.5 seconds.
