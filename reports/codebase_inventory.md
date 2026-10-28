# EnergyIQ — Comprehensive Codebase Inventory & Purpose Classification

## Overview

This document provides a line-by-line purpose classification and audit status for all 220 tracked files in the EnergyIQ repository.

| File Path | Lines | Purpose / Responsibility | Category | Audit Status |
|---|:---:|---|---|:---:|
| `.dockerignore` | 15 | Project configuration or manifest file | Deployment & CI/CD | AUDITED |
| `.env.example` | 18 | Project configuration or manifest file | Documentation / Reports | AUDITED |
| `.github/workflows/ci.yml` | 64 | Project configuration or manifest file | Deployment & CI/CD | AUDITED |
| `.gitignore` | 55 | Project configuration or manifest file | Documentation / Reports | AUDITED |
| `CHANGELOG.md` | 38 | Top-level documentation or user guide | Documentation / Reports | AUDITED |
| `CONTRIBUTING.md` | 42 | Top-level documentation or user guide | Documentation / Reports | AUDITED |
| `Dockerfile` | 28 | Containerization, deployment orchestration, or reverse proxy configuration | Deployment & CI/CD | AUDITED |
| `Dockerfile.backend` | 14 | Containerization, deployment orchestration, or reverse proxy configuration | Deployment & CI/CD | AUDITED |
| `LICENSE` | 21 | Project configuration or manifest file | Documentation / Reports | AUDITED |
| `README.md` | 266 | Top-level documentation or user guide | Documentation / Reports | AUDITED |
| `backend/api/admin.py` | 37 | REST API route definitions, request validation, and HTTP handlers for admin | Backend Core & API | AUDITED |
| `backend/api/alerts.py` | 107 | REST API route definitions, request validation, and HTTP handlers for alerts | Backend Core & API | AUDITED |
| `backend/api/analytics.py` | 106 | REST API route definitions, request validation, and HTTP handlers for analytics | Backend Core & API | AUDITED |
| `backend/api/auth.py` | 144 | REST API route definitions, request validation, and HTTP handlers for auth | Backend Core & API | AUDITED |
| `backend/api/benchmark.py` | 37 | REST API route definitions, request validation, and HTTP handlers for benchmark | Backend Core & API | AUDITED |
| `backend/api/dashboard.py` | 151 | REST API route definitions, request validation, and HTTP handlers for dashboard | Backend Core & API | AUDITED |
| `backend/api/data_quality.py` | 19 | REST API route definitions, request validation, and HTTP handlers for data_quality | Backend Core & API | AUDITED |
| `backend/api/demo.py` | 170 | REST API route definitions, request validation, and HTTP handlers for demo | Backend Core & API | AUDITED |
| `backend/api/edge_cases.py` | 17 | REST API route definitions, request validation, and HTTP handlers for edge_cases | Backend Core & API | AUDITED |
| `backend/api/equipment.py` | 141 | REST API route definitions, request validation, and HTTP handlers for equipment | Backend Core & API | AUDITED |
| `backend/api/evaluation.py` | 40 | REST API route definitions, request validation, and HTTP handlers for evaluation | Backend Core & API | AUDITED |
| `backend/api/export.py` | 47 | REST API route definitions, request validation, and HTTP handlers for export | Backend Core & API | AUDITED |
| `backend/api/maintenance.py` | 130 | REST API route definitions, request validation, and HTTP handlers for maintenance | Backend Core & API | AUDITED |
| `backend/api/ml_registry.py` | 40 | REST API route definitions, request validation, and HTTP handlers for ml_registry | Backend Core & API | AUDITED |
| `backend/api/notifications.py` | 59 | REST API route definitions, request validation, and HTTP handlers for notifications | Backend Core & API | AUDITED |
| `backend/api/rate_limiter.py` | 37 | REST API route definitions, request validation, and HTTP handlers for rate_limiter | Backend Core & API | AUDITED |
| `backend/api/reports.py` | 66 | REST API route definitions, request validation, and HTTP handlers for reports | Backend Core & API | AUDITED |
| `backend/api/search.py` | 52 | REST API route definitions, request validation, and HTTP handlers for search | Backend Core & API | AUDITED |
| `backend/api/settings.py` | 77 | REST API route definitions, request validation, and HTTP handlers for settings | Backend Core & API | AUDITED |
| `backend/api/streaming.py` | 82 | REST API route definitions, request validation, and HTTP handlers for streaming | Backend Core & API | AUDITED |
| `backend/api/system_health.py` | 72 | REST API route definitions, request validation, and HTTP handlers for system_health | Backend Core & API | AUDITED |
| `backend/api/system_metrics.py` | 50 | REST API route definitions, request validation, and HTTP handlers for system_metrics | Backend Core & API | AUDITED |
| `backend/auth/security.py` | 139 | PBKDF2-HMAC-SHA256 password hashing, JWT token lifecycle, role checkers, and audit logger | Backend Core & API | AUDITED |
| `backend/config/thresholds.json` | 11 | Runtime configurable threshold parameters for LOW/MEDIUM/HIGH/CRITICAL anomaly severities | Backend Core & API | AUDITED |
| `backend/database/db.py` | 287 | SQLite connection factory (foreign keys & WAL enabled), DDL schema definition, and table seeder | Backend Core & API | AUDITED |
| `backend/fault_linking/engine.py` | 128 | Deterministic rule-based fault diagnostic engine mapping anomalies to 10 physical equipment faults | Backend Core & API | AUDITED |
| `backend/main.py` | 112 | FastAPI application entrypoint, lifespan event hooks, CORS policy, timing middleware, and router mount point | Backend Core & API | AUDITED |
| `backend/models/user.py` | 32 | Pydantic data schemas for authentication, token contracts, and user administration | Backend Core & API | AUDITED |
| `backend/services/alert_correlation.py` | 54 | Backend service domain logic, analytical computations, and data pipeline for alert_correlation | Backend Core & API | AUDITED |
| `backend/services/data_loader.py` | 145 | Backend service domain logic, analytical computations, and data pipeline for data_loader | Backend Core & API | AUDITED |
| `backend/services/data_quality.py` | 105 | Backend service domain logic, analytical computations, and data pipeline for data_quality | Backend Core & API | AUDITED |
| `backend/services/drift_monitor.py` | 126 | Backend service domain logic, analytical computations, and data pipeline for drift_monitor | Backend Core & API | AUDITED |
| `backend/services/model_registry.py` | 74 | Backend service domain logic, analytical computations, and data pipeline for model_registry | Backend Core & API | AUDITED |
| `backend/streaming/scenarios.py` | 95 | Real-time streaming telemetry ingestion, degradation scenarios, and validation (scenarios) | Backend Core & API | AUDITED |
| `backend/streaming/simulator.py` | 342 | Real-time streaming telemetry ingestion, degradation scenarios, and validation (simulator) | Backend Core & API | AUDITED |
| `backend/streaming/validator.py` | 116 | Real-time streaming telemetry ingestion, degradation scenarios, and validation (validator) | Backend Core & API | AUDITED |
| `data/benchmark/ashrae_sample.csv` | 25 | Sample CSV dataset for training and validation | Datasets | AUDITED |
| `data/synthetic/campus_telemetry.csv` | 841 | Sample CSV dataset for training and validation | Datasets | AUDITED |
| `deploy/nginx.conf` | 55 | Containerization, deployment orchestration, or reverse proxy configuration | Deployment & CI/CD | AUDITED |
| `docker-compose.prod.yml` | 41 | Containerization, deployment orchestration, or reverse proxy configuration | Deployment & CI/CD | AUDITED |
| `docker-compose.yml` | 22 | Containerization, deployment orchestration, or reverse proxy configuration | Deployment & CI/CD | AUDITED |
| `docs/api.md` | 232 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/architecture.md` | 114 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/architecture/system_architecture.md` | 78 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/authentication.md` | 45 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/backup_recovery.md` | 21 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/benchmark_evaluation.md` | 18 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/data_model.md` | 86 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/database_migration.md` | 36 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/database_schema.md` | 140 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/demo_guide.md` | 63 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/deployment.md` | 46 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/explainability.md` | 22 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/functionality_audit.md` | 25 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/ml_pipeline.md` | 62 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/model_drift.md` | 22 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/model_registry.md` | 18 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/observability.md` | 23 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/performance.md` | 20 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/production_validation.md` | 28 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/rbac.md` | 25 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/release_notes.md` | 32 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/security.md` | 23 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/streaming.md` | 55 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `docs/testing.md` | 71 | Technical documentation and architecture specification | Documentation / Reports | AUDITED |
| `experiments/results/benchmark_experiment_20260929_151211.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20260929_151228.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20260929_151431.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20260929_151517.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20260929_161250.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20260929_162817.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20260929_163616.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20260929_172037.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20260929_172743.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20261028_145146.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20261028_145923.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20261028_150516.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20261028_151158.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20261028_153821.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20261028_154057.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20261028_160014.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_experiment_20261028_160258.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/results/benchmark_latest.json` | 141 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `experiments/run_benchmark.py` | 62 | Reproducible benchmark experiment runner and recorded metrics | Benchmarking & Experiments | AUDITED |
| `frontend/.gitignore` | 24 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/.oxlintrc.json` | 8 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/Dockerfile` | 20 | Containerization, deployment orchestration, or reverse proxy configuration | Frontend Configuration & Services | AUDITED |
| `frontend/Dockerfile.frontend` | 12 | Containerization, deployment orchestration, or reverse proxy configuration | Frontend Configuration & Services | AUDITED |
| `frontend/README.md` | 16 | Top-level documentation or user guide | Frontend Configuration & Services | AUDITED |
| `frontend/index.html` | 14 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/package-lock.json` | 2387 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/package.json` | 27 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/public/favicon.svg` | 1 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/public/icons.svg` | 24 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/src/App.css` | 184 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/src/App.jsx` | 373 | Main React application root shell, navigation router, live WebSocket listener, and toast coordinator | Frontend Configuration & Services | AUDITED |
| `frontend/src/assets/hero.png` | 98 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/src/assets/react.svg` | 1 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/src/assets/vite.svg` | 1 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/src/components/AlertDetailModal.jsx` | 297 | Reusable UI component (AlertDetailModal) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/DemoControlPanel.jsx` | 202 | Reusable UI component (DemoControlPanel) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/EdgeCaseWorkbench.jsx` | 127 | Reusable UI component (EdgeCaseWorkbench) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/EquipmentGrid.jsx` | 145 | Reusable UI component (EquipmentGrid) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/ErrorBoundary.jsx` | 68 | Reusable UI component (ErrorBoundary) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/EthicsDeploymentModal.jsx` | 108 | Reusable UI component (EthicsDeploymentModal) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/EvaluationView.jsx` | 266 | Reusable UI component (EvaluationView) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/LoginView.jsx` | 154 | Reusable UI component (LoginView) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/Navbar.jsx` | 90 | Reusable UI component (Navbar) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/OverviewCards.jsx` | 89 | Reusable UI component (OverviewCards) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/PowerFlowCard.jsx` | 141 | Reusable UI component (PowerFlowCard) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/Sidebar.jsx` | 191 | Reusable UI component (Sidebar) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/Toast.jsx` | 30 | Reusable UI component (Toast) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/TopNavbar.jsx` | 331 | Reusable UI component (TopNavbar) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/components/UsabilityGuide.jsx` | 88 | Reusable UI component (UsabilityGuide) for presentation and user interaction | Frontend Components | AUDITED |
| `frontend/src/index.css` | 128 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `frontend/src/main.jsx` | 10 | React DOM mounting entrypoint with root rendering | Frontend Configuration & Services | AUDITED |
| `frontend/src/services/api.js` | 357 | Frontend HTTP and WebSocket communication client, auth token state, and API service wrappers | Frontend Configuration & Services | AUDITED |
| `frontend/src/views/AIInsightsView.jsx` | 130 | Single Page Application full view component for AIInsightsView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/AlertsView.jsx` | 166 | Single Page Application full view component for AlertsView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/AnalyticsView.jsx` | 137 | Single Page Application full view component for AnalyticsView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/BenchmarkView.jsx` | 209 | Single Page Application full view component for BenchmarkView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/DashboardView.jsx` | 321 | Single Page Application full view component for DashboardView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/DataQualityView.jsx` | 162 | Single Page Application full view component for DataQualityView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/EdgeCaseWorkbenchView.jsx` | 105 | Single Page Application full view component for EdgeCaseWorkbenchView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/EquipmentView.jsx` | 236 | Single Page Application full view component for EquipmentView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/LiveEnergyView.jsx` | 110 | Single Page Application full view component for LiveEnergyView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/MaintenanceView.jsx` | 288 | Single Page Application full view component for MaintenanceView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/ModelRegistryView.jsx` | 355 | Single Page Application full view component for ModelRegistryView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/ReportsView.jsx` | 151 | Single Page Application full view component for ReportsView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/SettingsView.jsx` | 205 | Single Page Application full view component for SettingsView dashboard screen | Frontend Views | AUDITED |
| `frontend/src/views/StreamingHealthView.jsx` | 332 | Single Page Application full view component for StreamingHealthView dashboard screen | Frontend Views | AUDITED |
| `frontend/vite.config.js` | 11 | Project configuration or manifest file | Frontend Configuration & Services | AUDITED |
| `ml/anomaly_detector.py` | 110 | Machine learning pipeline component (anomaly_detector) for energy intelligence | Machine Learning Engine | AUDITED |
| `ml/baseline.py` | 35 | Machine learning pipeline component (baseline) for energy intelligence | Machine Learning Engine | AUDITED |
| `ml/benchmark/adapters.py` | 122 | Public benchmark dataset adaptation, preprocessing, and model evaluation (adapters) | Machine Learning Engine | AUDITED |
| `ml/benchmark/evaluator.py` | 66 | Public benchmark dataset adaptation, preprocessing, and model evaluation (evaluator) | Machine Learning Engine | AUDITED |
| `ml/benchmark/preprocessor.py` | 41 | Public benchmark dataset adaptation, preprocessing, and model evaluation (preprocessor) | Machine Learning Engine | AUDITED |
| `ml/benchmark/validator.py` | 61 | Public benchmark dataset adaptation, preprocessing, and model evaluation (validator) | Machine Learning Engine | AUDITED |
| `ml/cost_analysis.py` | 90 | Machine learning pipeline component (cost_analysis) for energy intelligence | Machine Learning Engine | AUDITED |
| `ml/edge_cases.py` | 241 | Machine learning pipeline component (edge_cases) for energy intelligence | Machine Learning Engine | AUDITED |
| `ml/evaluation.py` | 124 | Machine learning pipeline component (evaluation) for energy intelligence | Machine Learning Engine | AUDITED |
| `ml/feature_engineering.py` | 117 | Machine learning pipeline component (feature_engineering) for energy intelligence | Machine Learning Engine | AUDITED |
| `ml/synthetic_generator.py` | 179 | Machine learning pipeline component (synthetic_generator) for energy intelligence | Machine Learning Engine | AUDITED |
| `reports/70_percent_project_completion_report.md` | 432 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/70_percent_project_completion_summary.md` | 54 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/backup_restore_validation.md` | 30 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/bug_fix_log.md` | 218 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/ci_validation.md` | 13 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/container_security_audit.md` | 16 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/database_optimization.md` | 31 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/disaster_recovery_validation.md` | 18 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/final_acceptance_test.md` | 207 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/final_demo_script.md` | 194 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/final_performance_report.md` | 75 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/final_project_audit.md` | 225 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/final_project_completion_report.md` | 313 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/final_project_status.md` | 67 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/final_release_checklist.md` | 14 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/final_submission_checklist.md` | 108 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/final_test_results.md` | 124 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/final_validation_report.md` | 212 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/full_codebase_audit.md` | 115 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/full_system_validation_report.md` | 185 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/long_duration_streaming.md` | 17 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/milestone2_baseline_audit.md` | 89 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/milestone2_validation_report.md` | 48 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/milestone3_baseline_audit.md` | 74 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/milestone3_validation_report.md` | 83 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/milestone4_baseline_audit.md` | 70 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/milestone4_validation_report.md` | 69 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/milestone5_baseline_audit.md` | 58 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/milestone5_validation_report.md` | 47 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/milestone6_baseline_audit.md` | 25 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/milestone6_validation_report.md` | 87 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/ml_experiment_report.md` | 37 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/performance_benchmark.md` | 45 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/postgresql_validation.md` | 27 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/project_completion_matrix.md` | 31 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/public_dataset_validation.md` | 28 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/reproducibility_validation.md` | 44 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/review2_upgrade_audit.md` | 28 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/review2_upgrade_report.md` | 35 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/security_dependency_audit.md` | 27 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/security_validation.md` | 14 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `reports/streaming_load_test.md` | 29 | Audit report, validation matrix, or project milestone deliverable | Documentation / Reports | AUDITED |
| `requirements.txt` | 12 | Project configuration or manifest file | Documentation / Reports | AUDITED |
| `run_app.bat` | 19 | Project configuration or manifest file | Documentation / Reports | AUDITED |
| `run_app.ps1` | 16 | Project configuration or manifest file | Documentation / Reports | AUDITED |
| `scripts/backup_db.py` | 54 | Operational automation script for backup_db | Operational Scripts | AUDITED |
| `scripts/load_test_streaming.py` | 66 | Operational automation script for load_test_streaming | Operational Scripts | AUDITED |
| `scripts/measure_performance.py` | 103 | Operational automation script for measure_performance | Operational Scripts | AUDITED |
| `tests/test_alert_correlation.py` | 22 | Automated test suite verifying test_alert_correlation contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_anomaly_detector.py` | 39 | Automated test suite verifying test_anomaly_detector contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_api.py` | 103 | Automated test suite verifying test_api contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_audit_hardening.py` | 192 | Automated test suite verifying test_audit_hardening contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_auth.py` | 52 | Automated test suite verifying test_auth contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_benchmark.py` | 42 | Automated test suite verifying test_benchmark contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_data_quality.py` | 33 | Automated test suite verifying test_data_quality contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_drift_monitor.py` | 40 | Automated test suite verifying test_drift_monitor contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_e2e_workflow.py` | 149 | Automated test suite verifying test_e2e_workflow contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_failure_recovery.py` | 66 | Automated test suite verifying test_failure_recovery contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_feature_engineering.py` | 14 | Automated test suite verifying test_feature_engineering contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_final_e2e.py` | 251 | Automated test suite verifying test_final_e2e contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_health_score.py` | 58 | Automated test suite verifying test_health_score contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_milestone5.py` | 77 | Automated test suite verifying test_milestone5 contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_model_registry.py` | 63 | Automated test suite verifying test_model_registry contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_scenarios.py` | 46 | Automated test suite verifying test_scenarios contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_streaming.py` | 51 | Automated test suite verifying test_streaming contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_synthetic_generator.py` | 19 | Automated test suite verifying test_synthetic_generator contract and regression prevention | Automated Test Suite | AUDITED |
| `tests/test_system_health.py` | 16 | Automated test suite verifying test_system_health contract and regression prevention | Automated Test Suite | AUDITED |
