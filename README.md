# 🚀 AI-Powered Financial Intelligence & Stock Analytics Platform

An enterprise-grade, full-stack quantitative financial analytics and decision support system. Built with **React**, **TypeScript**, **FastAPI**, **Recharts**, **FinBERT NLP**, and **Python ML models** (XGBoost, Prophet, SHAP, Markowitz Mean-Variance Optimization).

---

## 🌟 Major Highlights & Resume Features

1. **Multi-Horizon AI Stock Forecasting (`1D`, `7D`, `30D`)**: Predicts future price trajectories with 95% confidence bounds using ensemble XGBoost + Prophet regression models.
2. **FinBERT News Sentiment Engine**: Scrape & parse financial headlines with pre-trained FinBERT transformers to generate sentiment scores (Positive, Neutral, Negative) and stock impact assessment.
3. **AI Risk Assessment Engine**: Computes Annualized Volatility, 95% Value at Risk (VaR), Sharpe Ratio, Beta, and assigns AI Risk Rating (**LOW**, **MEDIUM**, **HIGH**).
4. **Markowitz Portfolio Optimizer**: Calculates diversification scores (Herfindahl Index), expected CAGR, portfolio Sharpe ratio, and computes optimal rebalance targets.
5. **Explainable AI (SHAP) Visualizer**: Directional feature attribution breakdown proving *why* the AI model arrived at its forecast (RSI, SMA Golden Cross, News Sentiment, Volume).
6. **Quantitative Backtesting Simulator**: Tests algorithmic trading strategies (SMA 20/50 Crossover, RSI 30/70 Reversal, MACD Momentum) against historical data with Win Rate %, Net ROI %, and Equity Curves.
7. **Interactive FinAI Chatbot**: Context-aware financial assistant that synthesizes technicals, sentiment, forecasts, and risk profiles to answer trading queries.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Recharts, Lucide Icons, Vite, High-contrast Dark Bloomberg Terminal UI
- **Backend API**: Python 3.10+, FastAPI, Pydantic, Uvicorn
- **ML / Quant Finance**: Scikit-Learn, Pandas, NumPy, XGBoost, Prophet, FinBERT, SHAP

---

## 🚦 Quick Start Guide

### 1. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

### 2. Backend Setup (FastAPI)
```bash
cd backend
pip install fastapi uvicorn pandas numpy scikit-learn
uvicorn main:app --reload --port 8000
```
*API documentation available at `http://localhost:8000/docs`*

---

## 📂 Project Directory Structure

```
AI-Finance-Platform/
├── frontend/             # Pro Dark Financial Terminal (React + TS + Recharts)
│   ├── src/
│   │   ├── components/  # StockTerminal, PredictionsXAI, PortfolioAnalyzer, BacktesterLab, FinAIChatbot
│   │   ├── services/    # API client connecting to FastAPI backend
│   │   ├── App.tsx
│   │   └── index.css    # Bloomberg dark theme design system
├── backend/              # Python FastAPI Web Server
│   └── main.py          # API Endpoints (Stocks, Predictions, Sentiment, Risk, Backtest, Chat)
└── ml/                   # Quantitative Analytics & Machine Learning Engine
    ├── indicators.py    # RSI, SMA, EMA, MACD, Bollinger Bands, ATR
    ├── forecast.py      # Multi-Horizon AI Price Predictor (1D, 7D, 30D)
    ├── sentiment.py     # FinBERT News Sentiment & Impact Engine
    ├── risk_engine.py   # VaR, Volatility, Sharpe Ratio & AI Risk Rating
    ├── portfolio.py     # Markowitz Mean-Variance Portfolio Optimizer
    ├── backtester.py    # Algorithmic Backtester & Strategy Simulator
    └── explainable.py   # SHAP Feature Attribution Generator
```
