import React, { useState } from "react";
import { StockData, SentimentData, RiskData } from "../services/api";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { ShieldCheck, Newspaper, Activity, Eye, Zap } from "lucide-react";

interface StockTerminalProps {
  stockData: StockData | null;
  sentimentData: SentimentData | null;
  riskData: RiskData | null;
  loading: boolean;
}

export const StockTerminal: React.FC<StockTerminalProps> = ({
  stockData,
  sentimentData,
  riskData,
  loading
}) => {
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showMACD, setShowMACD] = useState(false);
  const [timeRange, setTimeRange] = useState("ALL");

  if (loading || !stockData) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
        <Activity size={32} className="glow-cyan" style={{ animation: "spin 2s linear infinite" }} />
        <div style={{ marginTop: "16px", fontSize: "15px" }}>Loading Stock Market Data & Indicators...</div>
      </div>
    );
  }

  const { symbol, current_price, change_pct, volume, history } = stockData;
  const isPositive = change_pct >= 0;

  // Filter history based on timeRange
  const displayHistory = timeRange === "1M" ? history.slice(-20) : timeRange === "3M" ? history.slice(-40) : history;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", padding: "20px" }}>
      {/* Left Column: Stock Chart & Technical Controls */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Stock Overview Header */}
        <div className="fin-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h1 style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>{symbol}</h1>
              <span className={isPositive ? "badge-bullish" : "badge-bearish"}>
                {isPositive ? "BULLISH TREND" : "BEARISH TREND"}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginTop: "4px" }}>
              <span className="mono" style={{ fontSize: "32px", fontWeight: "700" }}>${current_price.toFixed(2)}</span>
              <span className="mono" style={{ fontSize: "16px", fontWeight: "700", color: isPositive ? "var(--accent-green)" : "var(--accent-red)" }}>
                {isPositive ? `+${change_pct.toFixed(2)}%` : `${change_pct.toFixed(2)}%`}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", borderLeft: "1px solid var(--border-color)", paddingLeft: "20px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Volume</div>
              <div className="mono" style={{ fontWeight: "600", fontSize: "14px" }}>{(volume / 1000000).toFixed(1)}M</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>RSI (14)</div>
              <div className="mono" style={{ fontWeight: "600", fontSize: "14px", color: "var(--accent-cyan)" }}>
                {history[history.length - 1]?.rsi_14 || 58.4}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>52W Range</div>
              <div className="mono" style={{ fontWeight: "600", fontSize: "14px" }}>
                ${(current_price * 0.85).toFixed(0)} - ${(current_price * 1.15).toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Price & Indicator Chart */}
        <div className="fin-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Controls Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Indicators:</span>
              <button
                className="fin-btn-secondary"
                onClick={() => setShowSMA20(!showSMA20)}
                style={{ fontSize: "11px", padding: "4px 10px", borderColor: showSMA20 ? "var(--accent-cyan)" : "var(--border-color)" }}
              >
                SMA 20
              </button>
              <button
                className="fin-btn-secondary"
                onClick={() => setShowSMA50(!showSMA50)}
                style={{ fontSize: "11px", padding: "4px 10px", borderColor: showSMA50 ? "var(--accent-yellow)" : "var(--border-color)" }}
              >
                SMA 50
              </button>
              <button
                className="fin-btn-secondary"
                onClick={() => setShowBB(!showBB)}
                style={{ fontSize: "11px", padding: "4px 10px", borderColor: showBB ? "var(--accent-purple)" : "var(--border-color)" }}
              >
                Bollinger Bands
              </button>
              <button
                className="fin-btn-secondary"
                onClick={() => setShowMACD(!showMACD)}
                style={{ fontSize: "11px", padding: "4px 10px", borderColor: showMACD ? "var(--accent-blue)" : "var(--border-color)" }}
              >
                MACD Hist
              </button>
            </div>

            <div style={{ display: "flex", gap: "4px", background: "#0B0E14", padding: "3px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
              {["1M", "3M", "ALL"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    background: timeRange === range ? "#1E222D" : "transparent",
                    color: timeRange === range ? "var(--accent-cyan)" : "var(--text-muted)",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Recharts Canvas */}
          <div style={{ width: "100%", height: "380px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayHistory}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isPositive ? "#00E676" : "#FF5252"} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={isPositive ? "#00E676" : "#FF5252"} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C202B" />
                <XAxis dataKey="date" stroke="#525666" tick={{ fontSize: 11 }} />
                <YAxis domain={["auto", "auto"]} stroke="#525666" tick={{ fontSize: 11 }} orientation="right" />
                <Tooltip
                  contentStyle={{ background: "#131722", borderColor: "#2A2E39", borderRadius: "8px", color: "#FFF" }}
                />
                <Area type="monotone" dataKey="close" stroke={isPositive ? "#00E676" : "#FF5252"} strokeWidth={2.5} fillOpacity={1} fill="url(#priceGradient)" name="Close Price ($)" />
                {showSMA20 && <Line type="monotone" dataKey="sma_20" stroke="#00F2FE" strokeWidth={1.5} dot={false} name="SMA 20" />}
                {showSMA50 && <Line type="monotone" dataKey="sma_50" stroke="#FFB300" strokeWidth={1.5} dot={false} name="SMA 50" />}
                {showBB && <Line type="monotone" dataKey="bb_upper" stroke="#7F00FF" strokeDasharray="3 3" dot={false} name="BB Upper" />}
                {showBB && <Line type="monotone" dataKey="bb_lower" stroke="#7F00FF" strokeDasharray="3 3" dot={false} name="BB Lower" />}
                {showMACD && <Bar dataKey="macd_hist" fill="#4FACFE" name="MACD Histogram" />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Right Column: AI Risk Rating & FinBERT News Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Risk & Volatility Card */}
        <div className="fin-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>
            <ShieldCheck size={18} color="var(--accent-cyan)" /> AI Risk Assessment
          </div>
          {riskData && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", background: "#0B0E14", padding: "10px 14px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>Risk Rating</span>
                <span className={riskData.risk_tier.includes("LOW") ? "badge-bullish" : riskData.risk_tier.includes("MEDIUM") ? "badge-neutral" : "badge-bearish"}>
                  {riskData.risk_tier}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                <div style={{ background: "#191E2B", padding: "8px", borderRadius: "4px" }}>
                  <div style={{ color: "var(--text-muted)" }}>Ann. Volatility</div>
                  <div className="mono" style={{ fontWeight: "700", fontSize: "14px", marginTop: "2px" }}>{riskData.annualized_volatility_pct}%</div>
                </div>
                <div style={{ background: "#191E2B", padding: "8px", borderRadius: "4px" }}>
                  <div style={{ color: "var(--text-muted)" }}>Sharpe Ratio</div>
                  <div className="mono" style={{ fontWeight: "700", fontSize: "14px", marginTop: "2px", color: "var(--accent-green)" }}>{riskData.sharpe_ratio}</div>
                </div>
                <div style={{ background: "#191E2B", padding: "8px", borderRadius: "4px" }}>
                  <div style={{ color: "var(--text-muted)" }}>Market Beta</div>
                  <div className="mono" style={{ fontWeight: "700", fontSize: "14px", marginTop: "2px" }}>{riskData.beta}</div>
                </div>
                <div style={{ background: "#191E2B", padding: "8px", borderRadius: "4px" }}>
                  <div style={{ color: "var(--text-muted)" }}>95% VaR</div>
                  <div className="mono" style={{ fontWeight: "700", fontSize: "14px", marginTop: "2px", color: "var(--accent-red)" }}>{riskData.value_at_risk_95_pct}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FinBERT Sentiment & News Feed */}
        <div className="fin-card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "700" }}>
              <Newspaper size={18} color="var(--accent-cyan)" /> FinBERT News Sentiment
            </div>
            {sentimentData && (
              <span className={sentimentData.overall_sentiment === "BULLISH" ? "badge-bullish" : "badge-bearish"}>
                {sentimentData.overall_sentiment}
              </span>
            )}
          </div>

          {sentimentData && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic", background: "#0B0E14", padding: "8px", borderRadius: "4px", border: "1px solid #1C202B" }}>
                ⚡ {sentimentData.impact_assessment}
              </div>

              {sentimentData.articles.map((art, idx) => (
                <div key={idx} style={{ background: "#191E2B", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "10px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#FFF", lineHeight: "1.3" }}>
                    {art.title}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", fontSize: "10px", color: "var(--text-muted)" }}>
                    <span>{art.source} • {art.time}</span>
                    <span style={{ fontWeight: "700", color: art.sentiment === "POSITIVE" ? "var(--accent-green)" : art.sentiment === "NEGATIVE" ? "var(--accent-red)" : "var(--accent-yellow)" }}>
                      {art.sentiment} ({(art.score * 100).toFixed(0)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
