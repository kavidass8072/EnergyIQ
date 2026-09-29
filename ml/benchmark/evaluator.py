import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from ml.benchmark.adapters import BaseDatasetAdapter
from ml.feature_engineering import preprocess_and_engineer_features
from ml.anomaly_detector import ContextualIsolationForestDetector

def evaluate_benchmark_dataset(adapter: BaseDatasetAdapter) -> Dict[str, Any]:
    """
    Executes model evaluation pipeline across specified dataset adapter.
    Handles both labeled evaluation (Precision/Recall/F1) and unsupervised evaluation (Density/Scores).
    """
    meta = adapter.get_metadata()
    df_raw = adapter.load_data()
    df_norm = adapter.normalize_schema(df_raw)
    
    # Feature engineering
    df_proc = preprocess_and_engineer_features(df_norm)
    
    detector = ContextualIsolationForestDetector(contamination=0.05)
    detector.fit(df_proc)
    df_res = detector.predict(df_proc)
    
    scores = df_res["anomaly_score"].values
    preds = df_res["model_pred"].values
    severities = df_res["severity"].values
    
    result = {
        "metadata": meta,
        "record_count": len(df_norm),
        "columns_evaluated": list(df_proc.columns),
        "unsupervised_metrics": {
            "anomaly_detected_count": int(np.sum(preds == 1)),
            "anomaly_percentage": round(float(np.mean(preds == 1) * 100.0), 2),
            "mean_anomaly_score": round(float(np.mean(scores)), 2),
            "max_anomaly_score": round(float(np.max(scores)), 2),
            "score_std_dev": round(float(np.std(scores)), 2)
        }
    }
    
    if meta["has_ground_truth_labels"]:
        y_true = df_proc["is_anomaly"].values
        y_pred = preds
        
        tp = np.sum((y_true == 1) & (y_pred == 1))
        fp = np.sum((y_true == 0) & (y_pred == 1))
        fn = np.sum((y_true == 1) & (y_pred == 0))
        tn = np.sum((y_true == 0) & (y_pred == 0))
        
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        
        result["supervised_metrics"] = {
            "precision_pct": round(precision * 100.0, 2),
            "recall_pct": round(recall * 100.0, 2),
            "f1_score_pct": round(f1 * 100.0, 2),
            "fpr_pct": round(fpr * 100.0, 2),
            "confusion_matrix": {"TP": int(tp), "FP": int(fp), "FN": int(fn), "TN": int(tn)}
        }
    else:
        result["supervised_metrics"] = None
        result["note"] = "Dataset is unlabeled. Supervised precision/recall are omitted to prevent metric fabrication."
        
    return result
