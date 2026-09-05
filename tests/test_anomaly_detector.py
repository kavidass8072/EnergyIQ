import pytest
from ml.synthetic_generator import generate_campus_dataset
from ml.anomaly_detector import ContextualIsolationForestDetector
from backend.fault_linking.engine import analyze_and_link_fault
from ml.edge_cases import run_edge_case_tests

def test_anomaly_detector_predict():
    df_raw = generate_campus_dataset(days=4, seed=42)
    detector = ContextualIsolationForestDetector(contamination=0.05)
    df_res = detector.predict(df_raw)
    
    assert "anomaly_score" in df_res.columns
    assert "severity" in df_res.columns
    assert "model_pred" in df_res.columns
    assert (df_res["anomaly_score"] >= 0.0).all()
    assert (df_res["anomaly_score"] <= 100.0).all()

def test_fault_linking_off_leakage():
    mock_row = {
        "energy_kwh": 10.5,
        "rolling_mean_24h": 0.5,
        "operating_state": "OFF",
        "production_output": 0.0,
        "maintenance_days": 10,
        "temperature": 25.0,
        "equipment_type": "HVAC",
        "anomaly_score": 85.0
    }
    res = analyze_and_link_fault(mock_row)
    assert res["likely_fault"] == "Unexpected Standby Consumption"
    assert res["fault_confidence"] > 70.0
    assert len(res["evidence"]) > 0
    assert "recommended_action" in res

def test_edge_cases():
    results = run_edge_case_tests()
    assert len(results) == 7
    for r in results:
        assert r["status"] == "PASSED"
