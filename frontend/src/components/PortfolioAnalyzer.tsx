import React, { useState } from "react";
import { postPortfolio } from "../services/api";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PieChart, Plus, Trash2, RefreshCw, CheckCircle2, Download, Upload } from "lucide-react";

const COLORS = ["#00F2FE", "#4FACFE", "#00E676", "#FFB300", "#7F00FF", "#FF5252"];

export const PortfolioAnalyzer: React.FC = () => {
  const [holdings, setHoldings] = useState([
    { symbol: "AAPL", amount: 10000 },
    { symbol: "MSFT", amount: 8000 },
    { symbol: "NVDA", amount: 7000 },
    { symbol: "TSLA", amount: 5000 }
  ]);

  const [newSymbol, setNewSymbol] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAddHolding = () => {
    if (newSymbol.trim() && newAmount && !isNaN(Number(newAmount))) {
      setHoldings([
        ...holdings,
        { symbol: newSymbol.trim().toUpperCase(), amount: parseFloat(newAmount) }
      ]);
      setNewSymbol("");
      setNewAmount("");
    }
  };

  const handleRemoveHolding = (index: number) => {
    setHoldings(holdings.filter((_, idx) => idx !== index));
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const lines = text.split("\n");
          const imported: { symbol: string; amount: number }[] = [];
          lines.forEach(line => {
            const parts = line.split(",");
            if (parts.length >= 2) {
              const sym = parts[0].trim().toUpperCase();
              const amt = parseFloat(parts[1].trim());
              if (sym && !isNaN(amt) && sym !== "SYMBOL" && sym !== "TICKER") {
                imported.push({ symbol: sym, amount: amt });
              }
            }
          });
          if (imported.length > 0) {
            setHoldings(imported);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleRunOptimization = async () => {
    setLoading(true);
    const res = await postPortfolio(holdings);
    setAnalysisResult(res);
    setLoading(false);
  };

  const handleDownloadReport = () => {
    if (!analysisResult) return;
    const reportText = `# EXECUTIVE PORTFOLIO QUANTITATIVE REPORT
Generated at: ${new Date().toLocaleString()}

## Portfolio Summary
- Total Portfolio Value: $${analysisResult.total_portfolio_value}
- Total Assets: ${analysisResult.asset_count}
- Diversification Score: ${analysisResult.diversification_score} / 100 (${analysisResult.diversification_rating})
- Expected CAGR: ${analysisResult.expected_cagr_pct}%
- Portfolio Volatility: ${analysisResult.portfolio_volatility_pct}%
- Portfolio Sharpe Ratio: ${analysisResult.portfolio_sharpe_ratio}

## Asset Allocations & Target Rebalance
${analysisResult.current_allocations.map((h: any, i: number) => `
- ${h.symbol}: Current $${h.amount} (${h.current_weight_pct}%) | Target: ${analysisResult.optimal_rebalance_recommendations[i]?.target_weight_pct || 25}% | Action: ${analysisResult.optimal_rebalance_recommendations[i]?.action || "BALANCED"}
`).join("")}

## Markowitz Efficient Frontier Model Optimization
Calculated using Mean-Variance Equal Risk Contribution + Momentum Tilt.
`;

    const blob = new Blob([reportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Portfolio_Executive_Report_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  React.useEffect(() => {
    handleRunOptimization();
  }, []);

  const pieData = holdings.map(h => ({ name: h.symbol, value: h.amount }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", padding: "20px" }}>
      {/* Left Column: Asset Entry & Current Holdings */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="fin-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700" }}>
              <PieChart size={20} color="var(--accent-cyan)" /> Enter Portfolio Holdings
            </div>

            {/* CSV Import Button */}
            <div>
              <input type="file" accept=".csv" onChange={handleCsvUpload} id="port-csv" style={{ display: "none" }} />
              <label htmlFor="port-csv" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", padding: "6px 12px", background: "#1C202B", borderRadius: "6px", color: "var(--accent-cyan)", border: "1px solid var(--accent-cyan)" }}>
                <Upload size={14} /> Import Portfolio CSV
              </label>
            </div>
          </div>

          {/* Add Holding Form */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Ticker (e.g. AMZN)"
              className="fin-input"
              style={{ flex: 1 }}
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount ($)"
              className="fin-input"
              style={{ flex: 1 }}
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
            <button className="btn-primary" onClick={handleAddHolding} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Holdings Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1C202B", color: "var(--text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "8px" }}>Symbol</th>
                  <th style={{ padding: "8px" }}>Holding Value ($)</th>
                  <th style={{ padding: "8px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((h, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #141722" }}>
                    <td style={{ padding: "10px", fontWeight: "700" }}>{h.symbol}</td>
                    <td style={{ padding: "10px" }}>${h.amount.toLocaleString()}</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>
                      <button
                        onClick={() => handleRemoveHolding(idx)}
                        style={{ background: "transparent", border: "none", color: "var(--accent-red)", cursor: "pointer" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
            <button className="btn-primary" onClick={handleRunOptimization} disabled={loading} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <RefreshCw size={16} className={loading ? "spin" : ""} /> Run Portfolio Optimization
            </button>

            {analysisResult && (
              <button onClick={handleDownloadReport} className="btn-primary" style={{ background: "#1C202B", color: "var(--accent-cyan)", border: "1px solid var(--accent-cyan)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Download size={16} /> Download Report
              </button>
            )}
          </div>
        </div>

        {/* Current Weight Breakdown Pie Chart */}
        <div className="fin-card" style={{ height: "300px" }}>
          <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>Asset Allocation Pie</div>
          <ResponsiveContainer width="100%" height="80%">
            <RePieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `$${value}`} />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right Column: AI Optimization Output */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {analysisResult && (
          <>
            {/* Executive Risk Metrics */}
            <div className="fin-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Portfolio Value</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "#FFF" }}>${analysisResult.total_portfolio_value?.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Diversification Score</div>
                <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--accent-cyan)" }}>
                  {analysisResult.diversification_score} / 100
                </div>
                <span className="badge-bullish">{analysisResult.diversification_rating}</span>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Projected Portfolio CAGR</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--accent-green)" }}>+{analysisResult.expected_cagr_pct}%</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Portfolio Sharpe Ratio</div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "var(--accent-cyan)" }}>{analysisResult.portfolio_sharpe_ratio}</div>
              </div>
            </div>

            {/* Optimal Rebalance Target Allocations */}
            <div className="fin-card">
              <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} color="var(--accent-green)" /> Markowitz Optimal Rebalance Recommendations
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {analysisResult.optimal_rebalance_recommendations.map((rec: any, idx: number) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0B0E14", padding: "12px", borderRadius: "6px", border: "1px solid #1C202B" }}>
                    <div>
                      <span style={{ fontWeight: "800", fontSize: "15px" }}>{rec.symbol}</span>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Target Weight: {rec.target_weight_pct}%</div>
                    </div>
                    <span className="badge-bullish" style={{ background: rec.action.includes("BUY") ? "rgba(0, 230, 118, 0.1)" : "rgba(255, 179, 0, 0.1)", color: rec.action.includes("BUY") ? "var(--accent-green)" : "#FFB300" }}>
                      {rec.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
