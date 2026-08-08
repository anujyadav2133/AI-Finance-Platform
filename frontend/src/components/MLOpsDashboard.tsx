import React, { useState, useEffect } from "react";
import { Cpu, RefreshCw, AlertTriangle, CheckCircle, BarChart2, Layers } from "lucide-react";
import { fetchMlopsPipeline, fetchMlopsDrift, MlopsPipelineData, MlopsDriftData } from "../services/api";

interface MLOpsDashboardProps {
  symbol: string;
}

export function MLOpsDashboard({ symbol }: MLOpsDashboardProps) {
  const [pipeline, setPipeline] = useState<MlopsPipelineData | null>(null);
  const [drift, setDrift] = useState<MlopsDriftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);

  async function loadData() {
    setLoading(true);
    const [pData, dData] = await Promise.all([
      fetchMlopsPipeline(symbol),
      fetchMlopsDrift(symbol)
    ]);
    setPipeline(pData);
    setDrift(dData);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [symbol]);

  async function handleTriggerRetrain() {
    setRetraining(true);
    await fetchMlopsPipeline(symbol);
    await loadData();
    setRetraining(false);
  }

  if (loading || !pipeline || !drift) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        <RefreshCw size={32} className="spin" style={{ marginBottom: "12px" }} />
        <div>Training 30+ Feature Store & Evaluating Machine Learning Models for {symbol}...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "20px" }}>
      {/* Overview Top Bar */}
      <div className="fin-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Cpu size={28} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: "22px", fontWeight: "800" }}>Enterprise MLOps Model Registry</h2>
            <span className="badge-bullish">{pipeline.symbol}</span>
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            30+ Feature Store | XGBoost vs. Random Forest vs. Gradient Boosting vs. Ridge
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-primary" onClick={handleTriggerRetrain} disabled={retraining} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <RefreshCw size={14} className={retraining ? "spin" : ""} /> {retraining ? "Retraining Models..." : "Trigger Auto-Retrain"}
          </button>
        </div>
      </div>

      {/* Grid: Drift Monitor & Champion Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Champion Model Card */}
        <div className="fin-card" style={{ borderLeft: "4px solid var(--accent-green)" }}>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Champion Model Selected</div>
          <div style={{ fontSize: "22px", fontWeight: "900", color: "#E2E8F0", margin: "6px 0" }}>{pipeline.champion_model}</div>
          <div style={{ display: "flex", gap: "20px", marginTop: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target Price ({pipeline.forecast_horizon_days}D)</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "var(--accent-green)" }}>${pipeline.predicted_price} ({pipeline.projected_change_pct > 0 ? "+" : ""}{pipeline.projected_change_pct}%)</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Feature Count</div>
              <div style={{ fontSize: "18px", fontWeight: "700" }}>{pipeline.feature_count} Features</div>
            </div>
          </div>
        </div>

        {/* Concept Drift Monitor Card */}
        <div className="fin-card" style={{ borderLeft: `4px solid ${drift.drift_detected ? "var(--accent-red)" : "var(--accent-cyan)"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Concept Drift Status</div>
            {drift.drift_detected ? <AlertTriangle size={18} color="var(--accent-red)" /> : <CheckCircle size={18} color="var(--accent-green)" />}
          </div>

          <div style={{ fontSize: "22px", fontWeight: "900", color: drift.drift_detected ? "var(--accent-red)" : "var(--accent-cyan)", margin: "6px 0" }}>
            {drift.auto_retrain_status}
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Kolmogorov-Smirnov Test: {drift.drifted_features_pct}% drifted features | Baseline Samples: {drift.baseline_sample_size}
          </div>
        </div>
      </div>

      {/* Model Leaderboard Table */}
      <div className="fin-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
          <BarChart2 size={20} color="var(--accent-cyan)" /> Model Performance Comparison Leaderboard
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1C202B", color: "var(--text-muted)", textAlign: "left" }}>
              <th style={{ padding: "10px" }}>Model Name</th>
              <th style={{ padding: "10px" }}>MAE ($)</th>
              <th style={{ padding: "10px" }}>RMSE ($)</th>
              <th style={{ padding: "10px" }}>MAPE (%)</th>
              <th style={{ padding: "10px" }}>R² Score</th>
              <th style={{ padding: "10px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pipeline.leaderboard.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #141722", background: idx === 0 ? "rgba(0, 230, 118, 0.04)" : "transparent" }}>
                <td style={{ padding: "12px", fontWeight: idx === 0 ? "800" : "500", color: idx === 0 ? "var(--accent-green)" : "#E2E8F0" }}>
                  {item.model_name} {idx === 0 ? "🏆 (Champion)" : ""}
                </td>
                <td style={{ padding: "12px" }}>${item.mae}</td>
                <td style={{ padding: "12px" }}>${item.rmse}</td>
                <td style={{ padding: "12px" }}>{item.mape_pct}%</td>
                <td style={{ padding: "12px", fontWeight: "700", color: "var(--accent-cyan)" }}>{item.r2_score}</td>
                <td style={{ padding: "12px" }}><span className="badge-bullish">{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feature Importance Store Bar Breakdown */}
      <div className="fin-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
          <Layers size={20} color="#7F00FF" /> Feature Store Attribution (Top Factors)
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {pipeline.feature_importances.map((f, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ fontWeight: "600", textTransform: "uppercase" }}>{f.feature}</span>
                <span style={{ color: "var(--accent-cyan)" }}>{(f.importance * 100).toFixed(1)}%</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#1C202B", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ width: `${f.importance * 100 * 2.5}%`, height: "100%", background: "linear-gradient(90deg, #00F2FE 0%, #7F00FF 100%)" }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
