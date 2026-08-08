import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False

def fetch_stock_df(symbol: str = "AAPL", days: int = 365) -> pd.DataFrame:
    """
    Fetches real stock OHLCV data via yfinance if available,
    or generates realistic stochastic price series if offline.
    """
    symbol_clean = symbol.upper().strip()
    
    if YFINANCE_AVAILABLE:
        try:
            ticker = yf.Ticker(symbol_clean)
            df = ticker.history(period=f"{days}d")
            if not df.empty and len(df) >= 30:
                df = df[['Open', 'High', 'Low', 'Close', 'Volume']].rename(columns={
                    'Open': 'open', 'High': 'high', 'Low': 'low', 'Close': 'close', 'Volume': 'volume'
                })
                df.index = pd.to_datetime(df.index).date
                return df
        except Exception:
            pass

    # Fallback Stochastic Geometric Brownian Motion data generator
    base_prices = {"AAPL": 225.0, "MSFT": 445.0, "NVDA": 130.0, "TSLA": 220.0, "AMZN": 185.0, "GOOGL": 175.0}
    start_price = base_prices.get(symbol_clean, 150.0)

    np.random.seed(sum(ord(c) for c in symbol_clean))
    daily_returns = np.random.normal(0.0007, 0.016, days)
    price_series = [start_price]

    for r in daily_returns:
        price_series.append(max(price_series[-1] * (1 + r), 5.0))

    dates = [(datetime.now() - timedelta(days=days-i)).strftime("%Y-%m-%d") for i in range(days + 1)]
    
    df = pd.DataFrame({
        "open": [p * (1 - 0.003) for p in price_series],
        "high": [p * (1 + 0.008) for p in price_series],
        "low": [p * (1 - 0.007) for p in price_series],
        "close": price_series,
        "volume": [int(np.random.uniform(15000000, 60000000)) for _ in range(days + 1)]
    }, index=pd.to_datetime(dates).date)

    return df
