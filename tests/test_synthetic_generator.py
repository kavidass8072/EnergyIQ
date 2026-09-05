import pytest
from ml.synthetic_generator import generate_campus_dataset

def test_generate_campus_dataset():
    df = generate_campus_dataset(days=5, seed=123)
    assert not df.empty
    assert len(df) == 5 * 24 * 7  # 5 days * 24 hours * 7 equipment
    
    expected_cols = [
        "timestamp", "equipment_id", "equipment_type", "energy_kwh",
        "operating_state", "production_output", "solar_generation_kwh",
        "battery_soc", "grid_consumption_kwh", "temperature",
        "maintenance_days", "maintenance_status", "is_anomaly", "fault_label"
    ]
    for col in expected_cols:
        assert col in df.columns
        
    assert (df["energy_kwh"] >= 0).all()
    assert (df["battery_soc"] >= 0).all()
