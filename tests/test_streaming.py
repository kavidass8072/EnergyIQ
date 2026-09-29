import pytest
from backend.streaming.validator import validate_and_clean_telemetry
from backend.streaming.simulator import streaming_manager

def test_streaming_validator_clean_event():
    raw_event = {
        "timestamp": "2026-06-15 12:00:00",
        "equipment_id": "Motor-01",
        "equipment_type": "Heavy Motor",
        "energy_kwh": 32.5,
        "operating_state": "ON",
        "production_output": 80.0,
        "solar_generation_kwh": 25.0,
        "battery_soc": 60.0,
        "grid_consumption_kwh": 7.5,
        "temperature": 38.0,
        "maintenance_days": 10,
        "maintenance_status": "OK"
    }
    is_valid, cleaned, issues = validate_and_clean_telemetry(raw_event)
    assert is_valid is True
    assert len(issues) == 0
    assert cleaned["energy_kwh"] == 32.5

def test_streaming_validator_imputes_missing_and_out_of_range():
    malformed_event = {
        "equipment_id": "Compressor-01",
        "energy_kwh": -15.0,  # Invalid negative
        "operating_state": "INVALID_STATE",
        "temperature": 999.0, # Out of range
        "battery_soc": 150.0  # Out of range
    }
    is_valid, cleaned, issues = validate_and_clean_telemetry(malformed_event)
    assert is_valid is False
    assert len(issues) > 0
    assert cleaned["energy_kwh"] == 0.0
    assert cleaned["operating_state"] == "OFF"
    assert cleaned["temperature"] == 25.0
    assert cleaned["battery_soc"] == 100.0

def test_streaming_manager_status():
    status = streaming_manager.get_status()
    assert "is_running" in status
    assert "connected_clients" in status
    assert "events_per_sec" in status

def test_streaming_manager_inject_fault():
    streaming_manager.inject_fault("Motor-01", "MECHANICAL_RESISTANCE")
    assert streaming_manager.active_injections.get("Motor-01") == "MECHANICAL_RESISTANCE"
    streaming_manager.clear_fault("Motor-01")
    assert "Motor-01" not in streaming_manager.active_injections
