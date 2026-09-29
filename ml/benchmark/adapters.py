import os
import pandas as pd
import numpy as np
from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple, Optional
from ml.benchmark.validator import validate_raw_benchmark_dataset
from ml.benchmark.preprocessor import preprocess_raw_benchmark_dataset

class BaseDatasetAdapter(ABC):
    """Abstract Base Class for EnergyIQ Dataset Adapters."""
    
    @abstractmethod
    def load_data(self) -> pd.DataFrame:
        pass

    @abstractmethod
    def normalize_schema(self, df: pd.DataFrame) -> pd.DataFrame:
        pass

    @abstractmethod
    def get_metadata(self) -> Dict[str, Any]:
        pass


class SyntheticDatasetAdapter(BaseDatasetAdapter):
    """Adapter for internal 60-day synthetic campus telemetry dataset with ground-truth fault labels."""
    
    def __init__(self, data_path: Optional[str] = None):
        self.data_path = data_path

    def load_data(self) -> pd.DataFrame:
        if self.data_path and os.path.exists(self.data_path):
            return pd.read_csv(self.data_path)
        from ml.synthetic_generator import generate_campus_dataset
        return generate_campus_dataset(days=60, seed=42)

    def normalize_schema(self, df: pd.DataFrame) -> pd.DataFrame:
        df_norm = df.copy()
        if "energy_kwh" not in df_norm.columns and "power_kw" in df_norm.columns:
            df_norm["energy_kwh"] = df_norm["power_kw"]
        return df_norm

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "dataset_name": "EnergyIQ Synthetic Campus Telemetry",
            "source": "Internal Synthetic Telemetry Generator",
            "has_ground_truth_labels": True,
            "target_field": "is_anomaly",
            "canonical_assets": 7,
            "time_resolution": "1 Hour",
            "description": "Simulated multi-source commercial microgrid telemetry with injected physical faults."
        }


class ASHRAEDatasetAdapter(BaseDatasetAdapter):
    """
    Adapter for ASHRAE Great Energy Predictor III benchmark dataset schema.
    Converts raw building meter readings (electricity, chilled water, steam) and weather context
    into standard EnergyIQ normalized feature matrices.
    """
    
    def __init__(self, sample_size: int = 1000, local_csv_path: Optional[str] = None):
        self.sample_size = sample_size
        self.local_csv_path = local_csv_path or os.path.join(os.path.dirname(__file__), "..", "..", "data", "benchmark", "ashrae_sample.csv")

    def load_data(self) -> pd.DataFrame:
        if os.path.exists(self.local_csv_path):
            df_raw = pd.read_csv(self.local_csv_path)
        else:
            np.random.seed(101)
            timestamps = pd.date_range(start="2026-01-01", periods=self.sample_size, freq="1h")
            records = []
            for i, ts in enumerate(timestamps):
                hour = ts.hour
                temp = 15.0 + 10.0 * np.sin(np.pi * (hour - 6) / 12) + np.random.normal(0, 1.0)
                meter_reading = max(5.0, 120.0 + 40.0 * np.sin(np.pi * (hour - 8) / 12) + np.random.normal(0, 5.0))
                records.append({
                    "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                    "building_id": "Building_42_Education",
                    "meter_type": "Electricity",
                    "meter_reading": round(meter_reading, 2),
                    "air_temperature": round(temp, 1),
                    "dew_temperature": round(temp - 4.0, 1),
                    "sea_level_pressure": round(1013.2 + np.random.normal(0, 2.0), 1),
                    "wind_speed": round(abs(np.random.normal(3.5, 1.2)), 1),
                    "square_feet": 75000,
                    "year_built": 1998
                })
            df_raw = pd.DataFrame(records)
            
        # Run validation and preprocessing
        is_valid, val_info, issues = validate_raw_benchmark_dataset(df_raw)
        df_clean, prep_stats = preprocess_raw_benchmark_dataset(df_raw)
        return df_clean

    def normalize_schema(self, df: pd.DataFrame) -> pd.DataFrame:
        df_norm = df.copy()
        df_norm["equipment_id"] = df_norm["building_id"] if "building_id" in df_norm.columns else "Building_42_Education"
        df_norm["equipment_type"] = "Commercial Building Facility"
        df_norm["energy_kwh"] = df_norm["meter_reading"] if "meter_reading" in df_norm.columns else 100.0
        df_norm["operating_state"] = "ON"
        df_norm["production_output"] = 50.0
        df_norm["solar_generation_kwh"] = 0.0
        df_norm["battery_soc"] = 50.0
        df_norm["grid_consumption_kwh"] = df_norm["energy_kwh"]
        df_norm["temperature"] = df_norm["air_temperature"] if "air_temperature" in df_norm.columns else 25.0
        df_norm["maintenance_days"] = 30
        df_norm["maintenance_status"] = "OK"
        df_norm["is_anomaly"] = np.nan
        df_norm["fault_label"] = "UNLABELED"
        return df_norm

    def get_metadata(self) -> Dict[str, Any]:
        return {
            "dataset_name": "ASHRAE Great Energy Predictor III (Benchmark Schema)",
            "source": "Kaggle / ASHRAE Open Benchmark Dataset",
            "has_ground_truth_labels": False,
            "target_field": None,
            "canonical_assets": 1,
            "time_resolution": "1 Hour",
            "description": "Public building energy consumption benchmark dataset. Unsupervised anomaly detection evaluation."
        }
