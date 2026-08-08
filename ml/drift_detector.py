import numpy as np
import pandas as pd
from typing import Dict, Any
from scipy.stats import ks_2samp

from .data_loader import fetch_stock_df
from .feature_store import build_quant_feature_store

def evaluate_data_and_concept_drift(symbol: str = "AAPL") -> Dict[str, Any]:
    """
    Evaluates Data & Concept Drift using the Kolmogorov-Smirnov (KS) Test
    and rolling statistical variance across baseline (historical) vs active (recent) data.
    Determines if automatic model retraining is required.
    """
    df_raw = fetch_stock_df(symbol, days=365)
    df_features = build_quant_feature_store(df_raw)

    split_point = int(len(df_features) * 0.75)
    baseline_df = df_features.iloc[:split_point]
    current_df = df_features.iloc[split_point:]

    drift_features = []
    drifted_count = 0

    test_cols = ['rsi_14', 'volatility_10d', 'volume_zscore', 'ratio_sma_20', 'macd_hist']

    for col in test_cols:
        if col in df_features.columns:
            ks_stat, p_value = ks_2samp(baseline_df[col], current_df[col])
            is_drifted = p_value < 0.05
            if is_drifted:
                drifted_count += 1

            drift_features.append({
                "feature": col,
                "ks_statistic": round(float(ks_stat), 4),
                "p_value": round(float(p_value), 4),
                "drift_detected": is_drifted,
                "status": "DRIFT DETECTED" if is_drifted else "STABLE"
            })

    drift_ratio = (drifted_count / len(test_cols)) * 100
    retrain_recommended = drift_ratio >= 30.0

    return {
        "symbol": symbol.upper(),
        "drift_detected": retrain_recommended,
        "drift_level": "HIGH" if drift_ratio >= 50 else ("MODERATE" if drift_ratio >= 20 else "LOW"),
        "drifted_features_pct": round(drift_ratio, 1),
        "baseline_sample_size": len(baseline_df),
        "current_sample_size": len(current_df),
        "feature_drift_details": drift_features,
        "auto_retrain_status": "RETRAIN TRIGGERED" if retrain_recommended else "MODEL UP TO DATE",
        "last_checked": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
    }
