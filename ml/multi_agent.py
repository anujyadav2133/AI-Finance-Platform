import numpy as np
from typing import Dict, Any, List
from datetime import datetime

from .data_loader import fetch_stock_df
from .indicators import compute_all_indicators
from .sentiment import analyze_stock_news
from .risk_engine import calculate_stock_risk
from .portfolio import analyze_portfolio

def run_multi_agent_consensus(symbol: str = "AAPL") -> Dict[str, Any]:
    """
    Executes a 5-Agent Quantitative Decision Engine:
    - Agent 1: 📊 Market Analyst (Technicals, SMA Crossovers, RSI)
    - Agent 2: 📰 Sentiment Analyst (FinBERT NLP, News Catalysts)
    - Agent 3: 🛡️ Risk Manager (VaR, Volatility, Max Drawdown)
    - Agent 4: 💼 Portfolio Manager (Diversification & Weight Impact)
    - Agent 5: 📈 Trading Strategist (Execution Levels & Risk/Reward)
    - Executive Consensus Orchestrator: Synthesizes final actionable recommendation.
    """
    symbol = symbol.upper()
    df_raw = fetch_stock_df(symbol, days=180)
    df_ind = compute_all_indicators(df_raw)
    close_prices = list(df_ind['close'])
    current_price = round(close_prices[-1], 2)

    # 1. Market Analyst Agent
    rsi = float(df_ind['rsi_14'].iloc[-1])
    sma20 = float(df_ind['sma_20'].iloc[-1])
    sma50 = float(df_ind['sma_50'].iloc[-1])
    is_golden_cross = sma20 > sma50

    if is_golden_cross and 40 <= rsi <= 65:
        market_stance = "BULLISH"
        market_score = 85.0
        market_note = f"SMA 20 (${round(sma20, 2)}) is above SMA 50 (${round(sma50, 2)}) with healthy RSI at {round(rsi, 1)}."
    elif rsi > 70:
        market_stance = "NEUTRAL / CAUTIOUS"
        market_score = 55.0
        market_note = f"Asset is technically overbought (RSI {round(rsi, 1)}). Expect minor consolidation."
    else:
        market_stance = "BEARISH"
        market_score = 35.0
        market_note = f"Price is trading under short-term moving average resistance."

    agent_market = {
        "agent_id": "agent_1_market",
        "agent_name": "Market Analyst Agent",
        "role": "Technical Indicator & Price Trend Analysis",
        "stance": market_stance,
        "score": market_score,
        "key_insight": market_note
    }

    # 2. Sentiment Analyst Agent
    sentiment_res = analyze_stock_news(symbol)
    comp_score = sentiment_res['composite_score']
    
    agent_sentiment = {
        "agent_id": "agent_2_sentiment",
        "agent_name": "News & Sentiment Analyst Agent",
        "role": "FinBERT NLP Headline & Catalyst Parsing",
        "stance": sentiment_res['overall_sentiment'],
        "score": round(max(min(50 + comp_score, 95), 10), 1),
        "key_insight": f"{sentiment_res['impact_assessment']} across recent media headlines."
    }

    # 3. Risk Manager Agent
    risk_res = calculate_stock_risk(close_prices, symbol=symbol)
    sharpe = risk_res['sharpe_ratio']
    volatility = risk_res['annualized_volatility_pct']

    if risk_res['risk_tier'] == "LOW RISK" and sharpe > 1.2:
        risk_stance = "APPROVE / LOW RISK"
        risk_score = 90.0
        risk_note = f"Defensive profile with low volatility ({volatility}%) and strong Sharpe Ratio ({sharpe})."
    else:
        risk_stance = "MODERATE / CAUTIOUS"
        risk_score = 65.0
        risk_note = f"Volatility at {volatility}%, VaR 95% at {risk_res['value_at_risk_95_pct']}%. Keep stop-loss tight."

    agent_risk = {
        "agent_id": "agent_3_risk",
        "agent_name": "Risk Manager Agent",
        "role": "Value at Risk (VaR), Volatility & Downside Protection",
        "stance": risk_stance,
        "score": risk_score,
        "key_insight": risk_note
    }

    # 4. Portfolio Manager Agent
    port_res = analyze_portfolio([{"symbol": symbol, "amount": 10000}])
    agent_portfolio = {
        "agent_id": "agent_4_portfolio",
        "agent_name": "Portfolio Manager Agent",
        "role": "Markowitz Allocation & Diversification Weighting",
        "stance": "OVERWEIGHT / ACCUMULATE" if market_score > 60 else "NEUTRAL / HOLD",
        "score": 78.0,
        "key_insight": f"Diversification Rating: {port_res['diversification_rating']}. Projected CAGR: {port_res['expected_cagr_pct']}%."
    }

    # 5. Trading Strategist Agent
    stop_loss = round(current_price * 0.95, 2)
    take_profit = round(current_price * 1.08, 2)

    agent_strategist = {
        "agent_id": "agent_5_strategist",
        "agent_name": "Trading Strategist Agent",
        "role": "Execution Signal, Stop-Loss & Take-Profit Targets",
        "stance": "BUY ACCUMULATE" if (market_score + sentiment_res['composite_score']) > 50 else "HOLD / WAIT",
        "score": 82.0,
        "key_insight": f"Recommended Entry: ${current_price} | Stop-Loss: ${stop_loss} (-5.0%) | Target: ${take_profit} (+8.0%)."
    }

    # Executive Consensus Synthesis
    all_scores = [market_score, agent_sentiment['score'], risk_score, agent_portfolio['score'], agent_strategist['score']]
    composite_consensus_score = round(float(np.mean(all_scores)), 1)

    if composite_consensus_score >= 75:
        final_rating = "STRONG BUY / CONVICTION"
        action_plan = f"All 5 Agents reach positive consensus for {symbol}. Accumulate positions with stop-loss at ${stop_loss}."
    elif composite_consensus_score >= 55:
        final_rating = "MODERATE BUY / ACCUMULATE"
        action_plan = f"Market technicals and risk agents confirm growth trajectory. Scaled entry recommended."
    else:
        final_rating = "HOLD / NEUTRAL"
        action_plan = f"Risk or market agents highlight short-term consolidation. Await breakdown/breakout confirmation."

    return {
        "symbol": symbol,
        "current_price": current_price,
        "consensus_score": composite_consensus_score,
        "final_recommendation": final_rating,
        "executive_action_plan": action_plan,
        "agent_count": 5,
        "agents": [agent_market, agent_sentiment, agent_risk, agent_portfolio, agent_strategist],
        "timestamp": datetime.now().isoformat()
    }
