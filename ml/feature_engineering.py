import pandas as pd
import numpy as np

def preprocess_and_engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Cleans raw telemetry data and creates contextual features for
    baseline and Isolation Forest anomaly detection models.
    """
    df = df.copy()
    
    # 1. Datetime handling & sorting
    if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
    df = df.sort_values(['equipment_id', 'timestamp']).reset_index(drop=True)
    
    # 2. Data Cleaning & Missing Value Handling
    df['energy_kwh'] = df['energy_kwh'].ffill().fillna(0.0)
    df['operating_state'] = df['operating_state'].fillna('OFF')
    df['production_output'] = df['production_output'].fillna(0.0)
    df['solar_generation_kwh'] = df['solar_generation_kwh'].fillna(0.0)
    df['battery_soc'] = df['battery_soc'].fillna(50.0)
    df['grid_consumption_kwh'] = df['grid_consumption_kwh'].fillna(0.0)
    df['temperature'] = df['temperature'].fillna(25.0)
    df['maintenance_days'] = df['maintenance_days'].fillna(0)
    
    # Clip negative energy values
    df['energy_kwh'] = np.maximum(0.0, df['energy_kwh'])
    
    # 3. Time Features
    df['hour_of_day'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    df['is_peak_hours'] = ((df['hour_of_day'] >= 9) & (df['hour_of_day'] <= 18)).astype(int)
    
    # 4. State Encodings
    state_map = {'OFF': 0, 'ON': 1, 'IDLE': 2, 'MAINTENANCE': 3}
    df['state_encoded'] = df['operating_state'].map(state_map).fillna(0).astype(int)
    
    # 5. Asset Grouped Rolling Features (24h Window)
    df['rolling_mean_24h'] = df.groupby('equipment_id')['energy_kwh'].transform(
        lambda x: x.rolling(window=24, min_periods=3).mean()
    ).fillna(df['energy_kwh'])
    
    df['rolling_std_24h'] = df.groupby('equipment_id')['energy_kwh'].transform(
        lambda x: x.rolling(window=24, min_periods=3).std()
    ).fillna(0.1)
    
    # Prevent zero std dev division issues
    df['rolling_std_24h'] = np.where(df['rolling_std_24h'] < 0.01, 0.01, df['rolling_std_24h'])
    
    # 6. Energy Deviation & Ratios
    df['z_score_24h'] = (df['energy_kwh'] - df['rolling_mean_24h']) / df['rolling_std_24h']
    df['energy_deviation'] = df['energy_kwh'] - df['rolling_mean_24h']
    df['energy_pct_deviation'] = np.where(
        df['rolling_mean_24h'] > 0.1,
        (df['energy_deviation'] / df['rolling_mean_24h']) * 100.0,
        0.0
    )
    
    # 7. Non-Fault Quantile Baseline Power (Historical reference)
    on_records = df[df['operating_state'] == 'ON']
    if not on_records.empty:
        base_on_kw_series = on_records.groupby('equipment_id')['energy_kwh'].transform(lambda x: x.quantile(0.25))
        df['base_on_kw'] = base_on_kw_series.reindex(df.index).fillna(df['rolling_mean_24h'])
    else:
        df['base_on_kw'] = df['rolling_mean_24h']
        
    df['base_on_kw'] = df['base_on_kw'].ffill().bfill().fillna(10.0)
    
    df['norm_expected_kw'] = np.where(
        df['state_encoded'] == 0, 0.3,
        np.where(df['state_encoded'] == 2, df['base_on_kw'] * 0.25, df['base_on_kw'])
    )
    df['norm_expected_kw'] = np.where(df['norm_expected_kw'] <= 0.01, 0.1, df['norm_expected_kw'])
    
    df['historical_dev_pct'] = ((df['energy_kwh'] - df['norm_expected_kw']) / df['norm_expected_kw'] * 100.0).fillna(0.0)
    df['off_state_leakage'] = np.where(df['state_encoded'] == 0, df['energy_kwh'], 0.0)
    
    # 8. Production Context Ratios
    df['energy_per_prod_unit'] = np.where(
        df['production_output'] > 0,
        df['energy_kwh'] / df['production_output'],
        df['energy_kwh']
    )
    
    # 9. Microgrid Context Ratios
    df['solar_energy_ratio'] = df['solar_generation_kwh'] / (df['energy_kwh'] + 1.0)
    df['grid_dependency_ratio'] = df['grid_consumption_kwh'] / (df['energy_kwh'] + 1.0)
    
    # 10. Maintenance Context Ratios
    df['is_maint_overdue'] = (df['maintenance_days'] > 60).astype(int)
    
    return df

FEATURE_COLUMNS = [
    'energy_kwh',
    'state_encoded',
    'production_output',
    'temperature',
    'hour_of_day',
    'day_of_week',
    'is_weekend',
    'is_peak_hours',
    'rolling_mean_24h',
    'rolling_std_24h',
    'z_score_24h',
    'historical_dev_pct',
    'off_state_leakage',
    'energy_deviation',
    'energy_per_prod_unit',
    'solar_energy_ratio',
    'grid_dependency_ratio',
    'battery_soc',
    'maintenance_days',
    'is_maint_overdue'
]
