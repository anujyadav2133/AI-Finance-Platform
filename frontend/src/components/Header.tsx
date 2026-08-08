import React, { useState } from "react";
import { TrendingUp, Cpu, PieChart, ShieldAlert, Bot, Search, BarChart3, Flame } from "lucide-react";

interface HeaderProps {
  currentSymbol: string;
  onSymbolChange: (symbol: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TICKER_LIST = [
  { symbol: "AAPL", price: "$224.50", change: "+1.45%" },
  { symbol: "MSFT", price: "$448.20", change: "+2.10%" },
  { symbol: "NVDA", price: "$128.80", change: "+4.35%" },
  { symbol: "TSLA", price: "$218.40", change: "-0.85%" },
  { symbol: "GOOGL", price: "$178.60", change: "+0.92%" },
  { symbol: "AMZN", price: "$185.30", change: "+1.78%" }
];

export const Header: React.FC<HeaderProps> = ({
  currentSymbol,
  onSymbolChange,
  activeTab,
  onTabChange
}) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSymbolChange(searchInput.trim().toUpperCase());
      setSearchInput("");
    }
  };

  return (
    <header style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-dark)" }}>
      {/* Real-time Ticker Tape Ribbon */}
      <div style={{ background: "#06080C", borderBottom: "1px solid #1C202B", padding: "6px 20px", display: "flex", gap: "24px", overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--accent-cyan)", fontWeight: "700" }}>
          <Flame size={14} /> LIVE MARKETS
        </div>
        {TICKER_LIST.map((t) => (
          <div
            key={t.symbol}
            onClick={() => onSymbolChange(t.symbol)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              cursor: "pointer",
              padding: "2px 8px",
              borderRadius: "4px",
              background: t.symbol === currentSymbol ? "#1E222D" : "transparent"
            }}
          >
            <span style={{ fontWeight: "700", color: t.symbol === currentSymbol ? "var(--accent-cyan)" : "#A0A5B5" }}>{t.symbol}</span>
            <span className="mono" style={{ color: "#E0E6ED" }}>{t.price}</span>
            <span className="mono" style={{ color: t.change.startsWith("+") ? "var(--accent-green)" : "var(--accent-red)", fontWeight: "600" }}>
              {t.change}
            </span>
          </div>
        ))}
      </div>

      {/* Main Header Bar */}
      <div style={{ padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu size={24} color="#000" />
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: "800", letterSpacing: "-0.5px", background: "linear-gradient(90deg, #FFFFFF 0%, #A0C4FF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              FinAI Analytics
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>
              AI Financial Intelligence & Decision Platform
            </div>
          </div>
        </div>

        {/* Ticker Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", gap: "8px", background: "#131722", border: "1px solid var(--border-color)", padding: "4px 12px", borderRadius: "8px", width: "260px" }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search symbol (e.g. AAPL)..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#FFF", outline: "none", width: "100%", fontSize: "13px" }}
          />
        </form>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "terminal", label: "Terminal & Charts", icon: BarChart3 },
            { id: "custom-ml", label: "Model Training Workspace", icon: Cpu },
            { id: "multi-agent", label: "Multi-Agent AI Hub", icon: Cpu },
            { id: "mlops", label: "MLOps & Drift", icon: Flame },
            { id: "rag", label: "Financial RAG", icon: Search },
            { id: "predictions", label: "AI Forecast & XAI", icon: TrendingUp },
            { id: "portfolio", label: "Portfolio Optimizer", icon: PieChart },
            { id: "backtest", label: "Backtest Lab", icon: ShieldAlert },
            { id: "chat", label: "FinAI Assistant", icon: Bot }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: active ? "1px solid var(--accent-cyan)" : "1px solid transparent",
                  background: active ? "rgba(0, 242, 254, 0.1)" : "transparent",
                  color: active ? "var(--accent-cyan)" : "var(--text-muted)",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
