import React from "react";
import { ForecastData, ShapData } from "../services/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { Cpu, TrendingUp, Sparkles, HelpCircle, Layers } from "lucide-react";

interface PredictionsXAIProps {
  symbol: string;
  forecastData: ForecastData | null;
  shapData: ShapData | null;
  loading: boolean;
}

export const PredictionsXAI: React.FC<PredictionsXAIProps> = ({
  symbol,
  forecastData,
  shapData,
  loading
}) => {
  if (loading || !forecastData || !shapData) {
    return (
      <div style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
        <Cpu size={32} className="glow-cyan" style={{ animation: "spin 2s linear infinite" }} />
        <div style={{ marginTop: "16px" }}>Running XGBoost & Prophet Multi-Horizon Prediction Models...</div>
      </div>
    );
  }

  const { horizons, future_curve, current_price } = forecastData;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "20px" }}>
      {/* Horizon Summary Header Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {["1D", "7D", "30D"].map((hKey) => {
          const item = horizons[hKey];
          if (!item) return null;
          const isPos = item.pct_change >= 0;

          return (
            <div key={hKey} className="fin-card" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  {hKey === "1D" ? "1-Day Forecast" : hKey === "7D" ? "7-Day Forecast" : "30-Day Target"}
                </span>
                <span className={isPos ? "badge-bullish" : "badge-bearish"}>
                  {item.direction}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginTop: "12px" }}>
                <span className="mono" style={{ fontSize: "28px", fontWeight: "800" }}>${item.predicted_price.toFixed(2)}</span>
                <span className="mono" style={{ fontSize: "14px", fontWeight: "700", color: isPos ? "var(--accent-green)" : "var(--accent-red)" }}>
                  {isPos ? `+${item.pct_change.toFixed(2)}%` : `${item.pct_change.toFixed(2)}%`}
                </span>
              </div>

              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>
                95% Confidence Interval: <span className="mono" style={{ color: "#FFF" }}>${item.lower_bound} - ${item.upper_bound}</span>
              </div>

              <div style={{ marginTop: "12px", background: "#0B0E14", borderRadius: "4px", padding: "4px 8px", display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                <span style={{ color: "var(--text-muted)" }}>Model Confidence</span>
                <span className="mono" style={{ fontWeight: "700", color: "var(--accent-cyan)" }}>{item.confidence_score}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 30-Day Projected Curve Chart */}
      <div className="fin-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: "700" }}>
            <TrendingUp size={20} color="var(--accent-cyan)" /> 30-Day AI Price Trajectory & Confidence Interval
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Engine: <span style={{ color: "var(--accent-cyan)", fontWeight: "600" }}>{forecastData.model_used}</span>
          </div>
        </div>

        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={future_curve}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00F2FE" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1C202B" />
              <XAxis dataKey="date" stroke="#525666" tick={{ fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} stroke="#525666" tick={{ fontSize: 11 }} orientation="right" />
              <Tooltip contentStyle={{ background: "#131722", borderColor: "#2A2E39", color: "#FFF" }} />
              <Area type="monotone" dataKey="upper" stroke="transparent" fill="#1E2638" name="Upper 95% CI ($)" />
              <Area type="monotone" dataKey="predicted" stroke="#00F2FE" strokeWidth={2.5} fill="url(#forecastGrad)" name="AI Forecast ($)" />
              <Area type="monotone" dataKey="lower" stroke="transparent" fill="transparent" name="Lower 95% CI ($)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SHAP Explainable AI (XAI) Attribution Bar Chart */}
      <div className="fin-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", fontWeight: "700", marginBottom: "8px" }}>
          <Sparkles size={20} color="var(--accent-purple)" /> Explainable AI (SHAP) Feature Attribution
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
          {shapData.explanation_summary}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
          <div style={{ width: "100%", height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapData.shap_features} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1C202B" />
                <XAxis type="number" stroke="#525666" tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" stroke="#E0E6ED" tick={{ fontSize: 11 }} width={180} />
                <Tooltip contentStyle={{ background: "#131722", borderColor: "#2A2E39", color: "#FFF" }} />
                <Bar dataKey="impact_value" name="SHAP Contribution (%)">
                  {shapData.shap_features.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.impact_value >= 0 ? "#00E676" : "#FF5252"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "#0B0E14", padding: "12px", borderRadius: "6px", border: "1px solid #1C202B" }}>
            <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-cyan)" }}>Feature Rationale</div>
            {shapData.shap_features.map((f, idx) => (
              <div key={idx} style={{ fontSize: "11px", borderBottom: "1px solid #191E2B", paddingBottom: "6px" }}>
                <div style={{ color: "#FFF", fontWeight: "600" }}>{f.feature}</div>
                <div style={{ color: "var(--text-muted)", marginTop: "2px" }}>{f.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
