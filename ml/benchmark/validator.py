import pandas as pd
from typing import Dict, Any, Tuple, List

REQUIRED_COLUMNS = ["timestamp", "meter_reading"]

def validate_raw_benchmark_dataset(df: pd.DataFrame) -> Tuple[bool, Dict[str, Any], List[str]]:
    """
    Validates a raw public benchmark dataset before preprocessing and feature engineering.
    Checks column presence, missing percentages, duplicates, and temporal sorting.
    """
    issues = []
    total_records = len(df)
    
    if total_records == 0:
        return False, {"total_records": 0}, ["Dataset is empty"]

    # Column presence check
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        issues.append(f"Missing required columns: {missing_cols}")

    # Missing value percentages
    null_counts = df.isnull().sum().to_dict()
    null_percentages = {col: round((cnt / total_records) * 100.0, 2) for col, cnt in null_counts.items()}
    total_null_pct = round((df.isnull().sum().sum() / (total_records * len(df.columns))) * 100.0, 2)

    # Duplicate timestamp check
    if "timestamp" in df.columns:
        dup_cnt = df.duplicated(subset=["timestamp"]).sum()
        dup_pct = round((dup_cnt / total_records) * 100.0, 2)
        if dup_cnt > 0:
            issues.append(f"Found {dup_cnt} ({dup_pct}%) duplicate timestamp records")
    else:
        dup_pct = 0.0

    # Temporal sorting check
    is_sorted = True
    if "timestamp" in df.columns:
        try:
            ts_series = pd.to_datetime(df["timestamp"])
            is_sorted = ts_series.is_monotonic_increasing
            if not is_sorted:
                issues.append("Timestamps are not strictly in chronological order")
        except Exception:
            issues.append("Unable to parse timestamps for temporal sorting check")

    is_valid = len(missing_cols) == 0

    validation_summary = {
        "is_valid": is_valid,
        "total_records": total_records,
        "column_count": len(df.columns),
        "columns": list(df.columns),
        "null_percentages": null_percentages,
        "total_null_percentage": total_null_pct,
        "duplicate_percentage": dup_pct,
        "is_chronologically_sorted": is_sorted,
        "issues": issues
    }

    return is_valid, validation_summary, issues
