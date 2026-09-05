import os
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from ml.feature_engineering import preprocess_and_engineer_features, FEATURE_COLUMNS

DEFAULT_THRESHOLDS = {
    "LOW": 50.0,
    "MEDIUM": 70.0,
    "HIGH": 82.0,
    "CRITICAL": 92.0,
    "CONTAMINATION": 0.063
}

def load_threshold_config():
    config_path = os.path.join(os.path.dirname(__file__), "..", "backend", "config", "thresholds.json")
    if os.path.exists(config_path):
        try:
            with open(config_path, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_THRESHOLDS

class ContextualIsolationForestDetector:
    """
    Context-Aware Equipment Energy Anomaly Detector powered by Isolation Forest.
    Evaluates equipment energy usage against production output, operating state,
    temperature, microgrid state, and historical baseline trends.
    """
    def __init__(self, contamination=0.063, random_state=42):
        self.contamination = contamination
        self.random_state = random_state
        self.model = IsolationForest(
            contamination=self.contamination,
            random_state=self.random_state,
            n_estimators=200,
            max_samples='auto'
        )
        self.feature_cols = FEATURE_COLUMNS
        self.is_fitted = False
        
    def fit(self, df: pd.DataFrame):
        """
        Fits the Isolation Forest on feature-engineered telemetry.
        """
        if 'rolling_mean_24h' not in df.columns:
            df = preprocess_and_engineer_features(df)
            
        X = df[self.feature_cols].copy()
        X = X.fillna(0.0)
        self.model.fit(X)
        self.is_fitted = True
        return self
        
    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Predicts anomaly scores [0, 100], severity levels, and binary predictions.
        """
        df = df.copy()
        if 'rolling_mean_24h' not in df.columns:
            df = preprocess_and_engineer_features(df)
            
        if not self.is_fitted:
            self.fit(df)
            
        X = df[self.feature_cols].copy().fillna(0.0)
        
        # Raw decision function score
        raw_scores = self.model.decision_function(X)
        min_s, max_s = raw_scores.min(), raw_scores.max()
        iso_score_norm = (max_s - raw_scores) / (max_s - min_s) * 100.0 if max_s != min_s else np.zeros(len(df))
        
        # Contextual signal from historical deviation and OFF-state leakage
        context_signal = np.where(
            df['operating_state'] == 'OFF',
            np.where(df['energy_kwh'] > 2.0, 95.0, 0.0),
            np.maximum(0.0, df['historical_dev_pct'] * 1.5)
        )
        
        # Combined anomaly score
        combined_scores = np.clip(iso_score_norm * 0.3 + context_signal * 0.7, 0.0, 100.0)
        df['anomaly_score'] = np.round(combined_scores, 2)
        
        # Thresholds loading
        thresh = load_threshold_config()
        t_low = thresh.get("LOW", 50.0)
        t_med = thresh.get("MEDIUM", 70.0)
        t_high = thresh.get("HIGH", 82.0)
        t_crit = thresh.get("CRITICAL", 92.0)
        
        # Binary prediction (1 if score >= t_low, else 0)
        df['model_pred'] = (df['anomaly_score'] >= t_low).astype(int)
        
        # Severity classification
        conditions = [
            (df['anomaly_score'] >= t_crit),
            (df['anomaly_score'] >= t_high),
            (df['anomaly_score'] >= t_med),
            (df['anomaly_score'] >= t_low)
        ]
        choices = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
        df['severity'] = np.select(conditions, choices, default='NORMAL')
        
        return df
