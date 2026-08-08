import React, { useState } from "react";
import { postBacktest } from "../services/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { ShieldAlert, Play, Target, Award, ArrowUpRight } from "lucide-react";

interface BacktesterLabProps {
  symbol: string;
}

export const BacktesterLab: React.FC<BacktesterLabProps> = ({ symbol }) => {
  const [strategy, setStrategy] = useState("SMA_CROSSOVER");
  const [capital, setCapital] = useState(10000);
  const [backtestResult, setBacktestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRunBacktest = async () => {
    setLoading(true);
    const res = await postBacktest(symbol, strategy, capital);
    setBacktestResult(res);
    setLoading(false);
  };

  React.useEffect(() => {
    handleRunBacktest();
  }, [symbol]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "20px" }}>
      {/* Strategy Control Bar */}
      <div className="fin-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ShieldAlert size={24} color="var(--accent-cyan)" />
          <div>
            <div style={{ fontSize: "16px", fontWeight: "700" }}>Quantitative Strategy Backtest Engine</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Simulating historical algorithm performance on {symbol}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="fin-input"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            style={{ width: "200px" }}
          >
            <option value="SMA_CROSSOVER">SMA 20/50 Crossover</option>
            <option value="RSI_REVERSAL">RSI 30/70 Mean Reversal</option>
            <option value="MACD_MOMENTUM">MACD Signal Line Trigger</option>
          </select>

          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
            className="fin-input"
            style={{ width: "120px" }}
          />

          <button className="fin-btn" onClick={handleRunBacktest} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Play size={16} /> Execute Backtest
          </button>
        </div>
      </div>

      {backtestResult && (
        <>
          {/* Key Metric Badges */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div className="fin-card">
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Net Strategy ROI</div>
              <div className="mono" style={{ fontSize: "24px", fontWeight: "800", color: "var(--accent-green)", marginTop: "4px" }}>
                +{backtestResult.net_roi_pct}%
              </div>
            </div>

            <div className="fin-card">
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Win Rate</div>
              <div className="mono" style={{ fontSize: "24px", fontWeight: "800", color: "var(--accent-cyan)", marginTop: "4px" }}>
                {backtestResult.win_rate_pct}%
              </div>
            </div>

            <div className="fin-card">
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Total Trades Executed</div>
              <div className="mono" style={{ fontSize: "24px", fontWeight: "800", marginTop: "4px" }}>
                {backtestResult.total_trades}
              </div>
            </div>

            <div className="fin-card">
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Max Drawdown</div>
              <div className="mono" style={{ fontSize: "24px", fontWeight: "800", color: "var(--accent-red)", marginTop: "4px" }}>
                {backtestResult.max_drawdown_pct}%
              </div>
            </div>
          </div>

          {/* Equity Curve Graph */}
          <div className="fin-card">
            <div style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>
              Equity Growth vs Benchmark ($)
            </div>
            <div style={{ width: "100%", height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={backtestResult.equity_curve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1C202B" />
                  <XAxis dataKey="date" stroke="#525666" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#525666" tick={{ fontSize: 11 }} orientation="right" />
                  <Tooltip contentStyle={{ background: "#131722", borderColor: "#2A2E39", color: "#FFF" }} />
                  <Line type="monotone" dataKey="equity" stroke="#00E676" strokeWidth={2.5} dot={false} name="Strategy Capital ($)" />
                  <Line type="monotone" dataKey="benchmark" stroke="#525666" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Buy & Hold Benchmark ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
