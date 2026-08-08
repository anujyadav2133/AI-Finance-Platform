import numpy as np
import pandas as pd
from typing import Dict, Any, List

def compute_sma(prices: pd.Series, window: int = 20) -> pd.Series:
    return prices.rolling(window=window).mean()

def compute_ema(prices: pd.Series, span: int = 20) -> pd.Series:
    return prices.ewm(span=span, adjust=False).mean()

def compute_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss.replace(0, np.nan)
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(50)

def compute_macd(prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, pd.Series]:
    ema_fast = compute_ema(prices, fast)
    ema_slow = compute_ema(prices, slow)
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return {
        "macd": macd_line,
        "signal": signal_line,
        "histogram": histogram
    }

def compute_bollinger_bands(prices: pd.Series, window: int = 20, num_std: float = 2.0) -> Dict[str, pd.Series]:
    sma = compute_sma(prices, window)
    std = prices.rolling(window=window).std()
    upper = sma + (std * num_std)
    lower = sma - (std * num_std)
    return {
        "middle": sma,
        "upper": upper,
        "lower": lower
    }

def compute_atr(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
    tr1 = high - low
    tr2 = (high - close.shift()).abs()
    tr3 = (low - close.shift()).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.rolling(window=period).mean()
    return atr.fillna(0)

def compute_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes all standard technical indicators and appends to dataframe.
    """
    df = df.copy()
    close = df['close']
    high = df.get('high', close)
    low = df.get('low', close)

    df['sma_20'] = compute_sma(close, 20)
    df['sma_50'] = compute_sma(close, 50)
    df['sma_200'] = compute_sma(close, 200)
    df['ema_12'] = compute_ema(close, 12)
    df['ema_26'] = compute_ema(close, 26)
    df['rsi_14'] = compute_rsi(close, 14)

    macd_dict = compute_macd(close)
    df['macd'] = macd_dict['macd']
    df['macd_signal'] = macd_dict['signal']
    df['macd_hist'] = macd_dict['histogram']

    bb_dict = compute_bollinger_bands(close)
    df['bb_upper'] = bb_dict['upper']
    df['bb_middle'] = bb_dict['middle']
    df['bb_lower'] = bb_dict['lower']

    df['atr_14'] = compute_atr(high, low, close)

    return df
