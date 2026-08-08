import React, { useState, useEffect } from "react";
import { Users, ShieldCheck, TrendingUp, Newspaper, PieChart, Target, RefreshCw } from "lucide-react";
import { fetchMultiAgent, MultiAgentData } from "../services/api";

interface MultiAgentHubProps {
  symbol: string;
}

export function MultiAgentHub({ symbol }: MultiAgentHubProps) {
  const [data, setData] = useState<MultiAgentData | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    const res = await fetchMultiAgent(symbol);
    setData(res);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [symbol]);

  if (loading || !data) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        <RefreshCw size={32} className="spin" style={{ marginBottom: "12px" }} />
        <div>Executing 5-Agent Quantitative Decision Consensus for {symbol}...</div>
      </div>
    );
  }

  const getAgentIcon = (id: string) => {
    if (id.includes("market")) return <TrendingUp size={20} color="var(--accent-cyan)" />;
    if (id.includes("sentiment")) return <Newspaper size={20} color="#7F00FF" />;
    if (id.includes("risk")) return <ShieldCheck size={20} color="var(--accent-green)" />;
    if (id.includes("portfolio")) return <PieChart size={20} color="#FFB300" />;
    return <Target size={20} color="var(--accent-red)" />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "20px" }}>
      {/* Header Executive Consensus Card */}
      <div className="fin-card" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E2638 100%)", border: "1px solid #1E293B" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={28} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: "22px", fontWeight: "800" }}>5-Agent AI Decision Consensus</h2>
              <span className="badge-bullish">{data.symbol}</span>
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              Multi-Agent Orchestration Engine | Autonomous Financial Consensus Synthesis
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Consensus Score</div>
              <div style={{ fontSize: "28px", fontWeight: "900", color: data.consensus_score > 70 ? "var(--accent-green)" : "var(--accent-cyan)" }}>
                {data.consensus_score} <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--text-muted)" }}>/ 100</span>
              </div>
            </div>

            <button className="btn-primary" onClick={loadData} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={14} /> Re-Run Consensus
            </button>
          </div>
        </div>

        {/* Executive Action Banner */}
        <div style={{ marginTop: "20px", padding: "16px", background: "rgba(0, 242, 254, 0.05)", borderLeft: "4px solid var(--accent-cyan)", borderRadius: "4px" }}>
          <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "4px" }}>
            Final Consensus Rating: {data.final_recommendation}
          </div>
          <div style={{ fontSize: "14px", color: "#E2E8F0" }}>{data.executive_action_plan}</div>
        </div>
      </div>

      {/* Grid of 5 Autonomous Agents */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {data.agents.map((agent) => (
          <div key={agent.agent_id} className="fin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ padding: "8px", background: "#1E2638", borderRadius: "8px" }}>{getAgentIcon(agent.agent_id)}</div>
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "15px" }}>{agent.agent_name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{agent.role}</div>
                  </div>
                </div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: agent.score > 70 ? "var(--accent-green)" : "#00F2FE" }}>
                  {agent.score}
                </div>
              </div>

              <div style={{ fontSize: "13px", color: "#CBD5E1", background: "#0B0E14", padding: "12px", borderRadius: "6px", border: "1px solid #1C202B", marginBottom: "16px" }}>
                "{agent.key_insight}"
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #1C202B", paddingTop: "12px", marginTop: "8px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Agent Stance</span>
              <span className="badge-bullish" style={{ fontSize: "11px" }}>{agent.stance}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
