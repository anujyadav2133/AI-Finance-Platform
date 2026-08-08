import numpy as np
import pandas as pd
from typing import Tuple

from .indicators import (
    compute_sma, compute_ema, compute_rsi,
    compute_macd, compute_bollinger_bands, compute_atr
)

def build_quant_feature_store(df: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms raw OHLCV DataFrame into a 30+ Quantitative Feature Store.
    Features engineered:
    - Technicals: SMA_10, SMA_20, SMA_50, SMA_200, EMA_12, EMA_26
    - RSI_14, MACD, MACD_Signal, MACD_Hist
    - BB_Upper, BB_Lower, BB_Width, BB_PctB
    - ATR_14
    - Returns: Return_1D, Return_5D, Return_10D, Log_Return
    - Rolling Volatility: Volatility_10D, Volatility_30D
    - Lags: Close_Lag1, Close_Lag2, Close_Lag3, Close_Lag5
    - Price Ratios: Price_to_SMA20, Price_to_SMA50, Price_to_SMA200
    - Volume: Volume_SMA20, Volume_Ratio, Volume_ZScore, OBV
    - Momentum: ROC_10, Stochastic_K, Stochastic_D
    """
    df = df.copy()
    close = df['close']
    high = df['high']
    low = df['low']
    volume = df['volume']

    # 1. Moving Averages & Price Ratios
    df['sma_10'] = compute_sma(close, 10)
    df['sma_20'] = compute_sma(close, 20)
    df['sma_50'] = compute_sma(close, 50)
    df['sma_200'] = compute_sma(close, 200)
    df['ema_12'] = compute_ema(close, 12)
    df['ema_26'] = compute_ema(close, 26)

    df['ratio_sma_20'] = close / df['sma_20'].replace(0, np.nan)
    df['ratio_sma_50'] = close / df['sma_50'].replace(0, np.nan)
    df['ratio_sma_200'] = close / df['sma_200'].replace(0, np.nan)

    # 2. Oscillators & Volatility
    df['rsi_14'] = compute_rsi(close, 14)
    macd_dict = compute_macd(close)
    df['macd'] = macd_dict['macd']
    df['macd_signal'] = macd_dict['signal']
    df['macd_hist'] = macd_dict['histogram']

    bb_dict = compute_bollinger_bands(close)
    df['bb_upper'] = bb_dict['upper']
    df['bb_lower'] = bb_dict['lower']
    df['bb_width'] = (bb_dict['upper'] - bb_dict['lower']) / bb_dict['middle'].replace(0, np.nan)
    df['bb_pct_b'] = (close - bb_dict['lower']) / (bb_dict['upper'] - bb_dict['lower']).replace(0, np.nan)

    df['atr_14'] = compute_atr(high, low, close, 14)

    # 3. Returns & Rolling Volatility
    df['return_1d'] = close.pct_change(1)
    df['return_5d'] = close.pct_change(5)
    df['return_10d'] = close.pct_change(10)
    df['log_return'] = np.log(close / close.shift(1))

    df['volatility_10d'] = df['return_1d'].rolling(10).std()
    df['volatility_30d'] = df['return_1d'].rolling(30).std()

    # 4. Lag Features
    df['lag_1'] = close.shift(1)
    df['lag_2'] = close.shift(2)
    df['lag_3'] = close.shift(3)
    df['lag_5'] = close.shift(5)

    # 5. Volume Indicators
    df['volume_sma_20'] = compute_sma(volume, 20)
    df['volume_ratio'] = volume / df['volume_sma_20'].replace(0, np.nan)
    vol_mean = volume.rolling(20).mean()
    vol_std = volume.rolling(20).std().replace(0, np.nan)
    df['volume_zscore'] = (volume - vol_mean) / vol_std

    # On-Balance Volume (OBV)
    obv = (np.sign(close.diff()) * volume).fillna(0).cumsum()
    df['obv'] = obv

    # 6. Momentum Indicators
    df['roc_10'] = ((close - close.shift(10)) / close.shift(10).replace(0, np.nan)) * 100
    low_14 = low.rolling(14).min()
    high_14 = high.rolling(14).max()
    df['stoch_k'] = 100 * ((close - low_14) / (high_14 - low_14).replace(0, np.nan))
    df['stoch_d'] = df['stoch_k'].rolling(3).mean()

    # Drop early NaN rows from rolling computations
    return df.dropna()

def prepare_train_test_data(
    df_features: pd.DataFrame,
    target_horizon: int = 5,
    test_size: float = 0.2
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, list]:
    """
    Creates target variable (N-day future price return) and splits into time-series train/test sets.
    """
    df = df_features.copy()
    # Target: N-day future price
    df['target'] = df['close'].shift(-target_horizon)
    df = df.dropna()

    exclude_cols = ['target', 'open', 'high', 'low', 'close', 'volume']
    feature_cols = [c for c in df.columns if c not in exclude_cols]

    X = df[feature_cols]
    y = df['target']

    split_idx = int(len(X) * (1 - test_size))
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

    return X_train, X_test, y_train, y_test, feature_cols
