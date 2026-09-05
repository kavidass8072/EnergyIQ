import numpy as np
import pandas as pd
from ml.feature_engineering import preprocess_and_engineer_features

class BaselineZScoreDetector:
    """
    Baseline Anomaly Detector using Rolling Mean + Z-score thresholding.
    Used as the benchmark against the proposed Isolation Forest model.
    """
    def __init__(self, z_threshold: float = 2.2):
        self.z_threshold = z_threshold
        
    def predict(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculates baseline anomaly predictions based purely on Z-score thresholding.
        """
        df = df.copy()
        if 'z_score_24h' not in df.columns:
            df = preprocess_and_engineer_features(df)
            
        # Anomaly if z_score >= z_threshold
        df['baseline_score'] = np.abs(df['z_score_24h'])
        df['baseline_pred'] = (df['baseline_score'] >= self.z_threshold).astype(int)
        
        # Severity classification for baseline
        conditions = [
            (df['baseline_score'] >= 4.0),
            (df['baseline_score'] >= 3.2),
            (df['baseline_score'] >= 2.6),
            (df['baseline_score'] >= 2.2)
        ]
        choices = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
        df['baseline_severity'] = np.select(conditions, choices, default='NORMAL')
        
        return df
