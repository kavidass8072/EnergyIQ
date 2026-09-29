import pytest
from backend.streaming.scenarios import scenario_engine, STREAMING_SCENARIOS

def test_scenario_engine_set_valid_scenario():
    assert scenario_engine.set_scenario("DELAYED_PACKET") is True
    assert scenario_engine.active_scenario == "DELAYED_PACKET"
    # Reset
    scenario_engine.set_scenario("NORMAL_TELEMETRY")

def test_scenario_engine_set_invalid_scenario():
    assert scenario_engine.set_scenario("INVALID_SCENARIO_XYZ") is False

def test_scenario_normal_telemetry():
    scenario_engine.set_scenario("NORMAL_TELEMETRY")
    raw = {"equipment_id": "Motor-01", "energy_kwh": 45.0, "temperature": 65.0}
    res = scenario_engine.apply_scenario(raw)
    assert len(res) == 1
    assert res[0]["energy_kwh"] == 45.0

def test_scenario_missing_packet():
    scenario_engine.set_scenario("MISSING_PACKET")
    raw = {"equipment_id": "Motor-01", "energy_kwh": 45.0}
    res = scenario_engine.apply_scenario(raw)
    assert len(res) == 0
    scenario_engine.set_scenario("NORMAL_TELEMETRY")

def test_scenario_duplicate_packet():
    scenario_engine.set_scenario("DUPLICATE_PACKET")
    raw = {"equipment_id": "Motor-01", "energy_kwh": 45.0}
    res = scenario_engine.apply_scenario(raw)
    assert len(res) == 2
    scenario_engine.set_scenario("NORMAL_TELEMETRY")

def test_scenario_burst_traffic():
    scenario_engine.set_scenario("BURST_TRAFFIC")
    raw = {"equipment_id": "Motor-01", "energy_kwh": 45.0}
    res = scenario_engine.apply_scenario(raw)
    assert len(res) == 3
    scenario_engine.set_scenario("NORMAL_TELEMETRY")

def test_scenario_power_spike():
    scenario_engine.set_scenario("SUDDEN_POWER_SPIKE")
    raw = {"equipment_id": "Motor-01", "energy_kwh": 10.0}
    res = scenario_engine.apply_scenario(raw)
    assert res[0]["energy_kwh"] == 22.0
    scenario_engine.set_scenario("NORMAL_TELEMETRY")
