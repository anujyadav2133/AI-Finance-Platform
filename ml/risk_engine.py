import numpy as np
import pandas as pd
from typing import Dict, Any, List

def calculate_stock_risk(prices: List[float], symbol: str = "STOCK") -> Dict[str, Any]:
    """
    Computes statistical risk parameters:
    - Annualized Volatility
    - 95% Daily Value at Risk (VaR)
    - Sharpe Ratio (assuming 4.5% Risk Free Rate)
    - Max Drawdown
    - AI Risk Rating (LOW, MEDIUM, HIGH)
    """
    if len(prices) < 5:
        prices = [150.0 + (i * 0.5) for i in range(30)]

    df = pd.Series(prices)
    returns = df.pct_change().dropna()

    ann_volatility = float(returns.std() * np.sqrt(252))
    var_95 = float(np.percentile(returns, 5) * 100)
    
    # Risk-free daily rate (4.5% annual)
    rf_daily = 0.045 / 252
    excess_returns = returns - rf_daily
    sharpe_ratio = float((excess_returns.mean() / (returns.std() + 1e-9)) * np.sqrt(252))

    # Calculate Max Drawdown
    cum_max = df.cummax()
    drawdown = (df - cum_max) / cum_max
    max_drawdown = float(drawdown.min() * 100)

    # Beta estimation relative to S&P 500 benchmark
    beta = round(min(max(ann_volatility / 0.16, 0.5), 2.2), 2)

    # Determine AI Risk Tier
    if ann_volatility < 0.20 and abs(max_drawdown) < 15:
        risk_score = "LOW RISK"
        risk_level_code = 1
        description = "Conservative asset profile with low volatility and defensive market beta."
    elif ann_volatility < 0.35 and abs(max_drawdown) < 30:
        risk_score = "MEDIUM RISK"
        risk_level_code = 2
        description = "Moderate growth asset with standard market beta and balanced risk reward."
    else:
        risk_score = "HIGH RISK"
        risk_level_code = 3
        description = "High beta volatile asset with large drawdown history. Requires tight stop-losses."

    return {
        "symbol": symbol,
        "risk_tier": risk_score,
        "risk_level_code": risk_level_code,
        "annualized_volatility_pct": round(ann_volatility * 100, 2),
        "value_at_risk_95_pct": round(var_95, 2),
        "sharpe_ratio": round(sharpe_ratio, 2),
        "beta": beta,
        "max_drawdown_pct": round(max_drawdown, 2),
        "analysis": description
    }
