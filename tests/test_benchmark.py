import pytest
from ml.benchmark.adapters import SyntheticDatasetAdapter, ASHRAEDatasetAdapter
from ml.benchmark.evaluator import evaluate_benchmark_dataset

def test_synthetic_dataset_adapter():
    adapter = SyntheticDatasetAdapter()
    meta = adapter.get_metadata()
    assert meta["has_ground_truth_labels"] is True
    
    df = adapter.load_data()
    assert len(df) > 0
    assert "energy_kwh" in df.columns
    assert "is_anomaly" in df.columns

def test_ashrae_dataset_adapter():
    adapter = ASHRAEDatasetAdapter(sample_size=100)
    meta = adapter.get_metadata()
    assert meta["has_ground_truth_labels"] is False
    
    df_raw = adapter.load_data()
    assert len(df_raw) > 0
    assert "meter_reading" in df_raw.columns
    
    df_norm = adapter.normalize_schema(df_raw)
    assert "energy_kwh" in df_norm.columns
    assert df_norm["is_anomaly"].isnull().all()

def test_benchmark_evaluation_labeled():
    adapter = SyntheticDatasetAdapter()
    res = evaluate_benchmark_dataset(adapter)
    assert res["metadata"]["has_ground_truth_labels"] is True
    assert "supervised_metrics" in res
    assert res["supervised_metrics"]["precision_pct"] > 50.0
    assert res["supervised_metrics"]["recall_pct"] > 50.0

def test_benchmark_evaluation_unsupervised_ashrae():
    adapter = ASHRAEDatasetAdapter(sample_size=100)
    res = evaluate_benchmark_dataset(adapter)
    assert res["metadata"]["has_ground_truth_labels"] is False
    assert res["supervised_metrics"] is None
    assert "unsupervised_metrics" in res
    assert "anomaly_detected_count" in res["unsupervised_metrics"]
