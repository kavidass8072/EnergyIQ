# System Performance & Benchmark Metrics

## 1. Summary Performance Metrics
- **PyTest Unit & Integration Test Suite**: 53 / 53 PASSED (100% pass rate in ~6.7s)
- **Vite Production Build**: Built cleanly in ~0.5s with zero syntax errors.
- **API Latency**: Average request timing < 15ms for core CRUD and telemetry queries.
- **WebSocket Throughput**: Tested up to 1,000 telemetry ticks per second with < 5ms processing latency.

## 2. Model Detection Performance (Synthetic Ground-Truth)
- **Precision**: 99.41%
- **Recall**: 80.09%
- **F1-Score**: 88.71%
- **High-Priority Precision**: 92.50%
- **False Alarm Rate**: 0.05%

## 3. Database Optimization & Indexing
SQLite database `backend/data/app.db` utilizes indexes on:
- `idx_telemetry_timestamp_equip` (`telemetry(timestamp, equipment_id)`)
- `idx_alerts_status_severity` (`alerts(status, severity)`)
- `idx_audit_logs_timestamp` (`audit_logs(timestamp)`)
