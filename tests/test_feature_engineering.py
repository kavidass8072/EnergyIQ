import pytest
import pandas as pd
from ml.synthetic_generator import generate_campus_dataset
from ml.feature_engineering import preprocess_and_engineer_features, FEATURE_COLUMNS

def test_feature_engineering():
    df_raw = generate_campus_dataset(days=3, seed=42)
    df_proc = preprocess_and_engineer_features(df_raw)
    
    assert not df_proc.empty
    for col in FEATURE_COLUMNS:
        assert col in df_proc.columns
        
    assert not df_proc[FEATURE_COLUMNS].isnull().any().any()
