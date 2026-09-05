import numpy as np
import pandas as pd
from typing import Dict, Any
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, accuracy_score
from ml.baseline import BaselineZScoreDetector
from ml.anomaly_detector import ContextualIsolationForestDetector
from ml.feature_engineering import preprocess_and_engineer_features

TARGET_METRICS = {
    "precision": 80.0,
    "recall": 75.0,
    "f1_score": 77.0,
    "high_priority_precision": 85.0,
    "detection_rate": 80.0,
    "false_alarm_rate": 5.0
}

def evaluate_models(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Evaluates Baseline Z-score detector and Proposed Isolation Forest model
    against ground-truth fault labels. Returns complete metrics comparison.
    """
    df = df.copy()
    if 'rolling_mean_24h' not in df.columns:
        df = preprocess_and_engineer_features(df)
        
    y_true = df['is_anomaly'].values
    
    # 1. Evaluate Baseline
    baseline_model = BaselineZScoreDetector(z_threshold=3.0)
    df_base = baseline_model.predict(df)
    y_pred_base = df_base['baseline_pred'].values
    
    tn_b, fp_b, fn_b, tp_b = confusion_matrix(y_true, y_pred_base, labels=[0, 1]).ravel()
    prec_b = precision_score(y_true, y_pred_base, zero_division=0) * 100.0
    rec_b = recall_score(y_true, y_pred_base, zero_division=0) * 100.0
    f1_b = f1_score(y_true, y_pred_base, zero_division=0) * 100.0
    acc_b = accuracy_score(y_true, y_pred_base) * 100.0
    far_b = (fp_b / (fp_b + tn_b) * 100.0) if (fp_b + tn_b) > 0 else 0.0
    
    # Baseline High priority precision
    high_base_mask = df_base['baseline_severity'].isin(['HIGH', 'CRITICAL'])
    high_base_tp = (df_base.loc[high_base_mask, 'is_anomaly'] == 1).sum()
    high_base_total = high_base_mask.sum()
    high_prec_b = (high_base_tp / high_base_total * 100.0) if high_base_total > 0 else 0.0
    
    # Baseline detection delay (avg hours between ground truth onset and first detection per fault block)
    delay_b = calculate_avg_detection_delay(df_base, 'baseline_pred')
    
    # 2. Evaluate Proposed Model
    proposed_model = ContextualIsolationForestDetector(contamination=0.05)
    df_prop = proposed_model.predict(df)
    y_pred_prop = df_prop['model_pred'].values
    
    tn_p, fp_p, fn_p, tp_p = confusion_matrix(y_true, y_pred_prop, labels=[0, 1]).ravel()
    prec_p = precision_score(y_true, y_pred_prop, zero_division=0) * 100.0
    rec_p = recall_score(y_true, y_pred_prop, zero_division=0) * 100.0
    f1_p = f1_score(y_true, y_pred_prop, zero_division=0) * 100.0
    acc_p = accuracy_score(y_true, y_pred_prop) * 100.0
    far_p = (fp_p / (fp_p + tn_p) * 100.0) if (fp_p + tn_p) > 0 else 0.0
    
    # Proposed High priority precision
    high_prop_mask = df_prop['severity'].isin(['HIGH', 'CRITICAL'])
    high_prop_tp = (df_prop.loc[high_prop_mask, 'is_anomaly'] == 1).sum()
    high_prop_total = high_prop_mask.sum()
    high_prec_p = (high_prop_tp / high_prop_total * 100.0) if high_prop_total > 0 else 0.0
    
    delay_p = calculate_avg_detection_delay(df_prop, 'model_pred')
    
    return {
        "targets": TARGET_METRICS,
        "baseline": {
            "name": "Rolling Z-Score (Threshold=3.0)",
            "tp": int(tp_b), "tn": int(tn_b), "fp": int(fp_b), "fn": int(fn_b),
            "precision": round(prec_b, 2),
            "recall": round(rec_b, 2),
            "f1_score": round(f1_b, 2),
            "accuracy": round(acc_b, 2),
            "detection_rate": round(rec_b, 2),
            "false_alarm_rate": round(far_b, 2),
            "high_priority_precision": round(high_prec_b, 2),
            "avg_detection_delay_hours": round(delay_b, 1)
        },
        "proposed": {
            "name": "Isolation Forest + Context Linking",
            "tp": int(tp_p), "tn": int(tn_p), "fp": int(fp_p), "fn": int(fn_p),
            "precision": round(prec_p, 2),
            "recall": round(rec_p, 2),
            "f1_score": round(f1_p, 2),
            "accuracy": round(acc_p, 2),
            "detection_rate": round(rec_p, 2),
            "false_alarm_rate": round(far_p, 2),
            "high_priority_precision": round(high_prec_p, 2),
            "avg_detection_delay_hours": round(delay_p, 1)
        }
    }

def calculate_avg_detection_delay(df: pd.DataFrame, pred_col: str) -> float:
    """
    Calculates the average delay in hours between ground truth anomaly onset
    and first model prediction alert across fault episodes.
    """
    delays = []
    for eq_id, group in df.groupby('equipment_id'):
        group = group.sort_values('timestamp').reset_index(drop=True)
        in_fault = False
        start_idx = 0
        
        for idx in range(len(group)):
            gt = group.loc[idx, 'is_anomaly']
            pred = group.loc[idx, pred_col]
            
            if gt == 1 and not in_fault:
                in_fault = True
                start_idx = idx
                if pred == 1:
                    delays.append(0)
            elif gt == 1 and in_fault:
                if pred == 1 and len(delays) == 0:
                    delays.append(idx - start_idx)
            elif gt == 0 and in_fault:
                in_fault = False
                
    return float(np.mean(delays)) if delays else 0.5
