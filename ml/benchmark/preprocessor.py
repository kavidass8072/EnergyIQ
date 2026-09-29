import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

def preprocess_raw_benchmark_dataset(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Cleans, deduplicates, temporally sorts, and imputes raw public benchmark dataset records.
    """
    df_clean = df.copy()
    initial_records = len(df_clean)
    
    # 1. Temporal sorting
    if "timestamp" in df_clean.columns:
        df_clean["timestamp_parsed"] = pd.to_datetime(df_clean["timestamp"])
        df_clean = df_clean.sort_values("timestamp_parsed").reset_index(drop=True)
        df_clean["timestamp"] = df_clean["timestamp_parsed"].dt.strftime("%Y-%m-%d %H:%M:%S")
        df_clean = df_clean.drop(columns=["timestamp_parsed"])

    # 2. Deduplication
    if "timestamp" in df_clean.columns and "building_id" in df_clean.columns:
        df_clean = df_clean.drop_duplicates(subset=["timestamp", "building_id"]).reset_index(drop=True)
    elif "timestamp" in df_clean.columns:
        df_clean = df_clean.drop_duplicates(subset=["timestamp"]).reset_index(drop=True)

    deduped_records = len(df_clean)

    # 3. Missing Value Imputation
    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        if df_clean[col].isnull().any():
            # Forward fill then backward fill then median fallback
            df_clean[col] = df_clean[col].ffill().bfill().fillna(df_clean[col].median() if not df_clean[col].isnull().all() else 0.0)

    preprocessing_stats = {
        "initial_records": initial_records,
        "deduped_records": deduped_records,
        "records_removed": initial_records - deduped_records,
        "imputed_numeric_columns": list(numeric_cols)
    }

    return df_clean, preprocessing_stats
