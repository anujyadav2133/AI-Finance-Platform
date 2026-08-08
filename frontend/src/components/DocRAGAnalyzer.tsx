import React, { useState } from "react";
import { FileText, Search, Send, CheckCircle2 } from "lucide-react";
import { postRagAnalyze, RagData } from "../services/api";

interface DocRAGAnalyzerProps {
  symbol: string;
}

export function DocRAGAnalyzer({ symbol }: DocRAGAnalyzerProps) {
  const [query, setQuery] = useState("");
  const [ragData, setRagData] = useState<RagData | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    const res = await postRagAnalyze(symbol, query);
    setRagData(res);
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "20px" }}>
      {/* Search Header */}
      <div className="fin-card">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <FileText size={24} color="var(--accent-cyan)" />
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800" }}>Financial Document & SEC 10-K RAG Assistant</h2>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Contextual Retrieval-Augmented Generation for Annual Reports, Earnings Transcripts & SEC Filings
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            className="fin-input"
            style={{ flex: 1 }}
            placeholder={`Ask anything about ${symbol} SEC 10-K (e.g. "What are the main risk factors and AI investments?")`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
          />
          <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {loading ? <Search size={14} className="spin" /> : <Send size={14} />} Analyze Document
          </button>
        </div>
      </div>

      {/* RAG Results */}
      {ragData && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Extracted Key Insights */}
          <div className="fin-card">
            <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--accent-cyan)" }}>
              {ragData.doc_type} Context Extracts ({ragData.symbol})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {ragData.insights.map((insight, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", background: "#0B0E14", padding: "10px", borderRadius: "6px", border: "1px solid #1C202B", fontSize: "13px" }}>
                  <CheckCircle2 size={16} color="var(--accent-green)" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Synthesized Response */}
          <div className="fin-card" style={{ background: "linear-gradient(135deg, #0F172A 0%, #161F33 100%)" }}>
            <div style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "#E2E8F0" }}>
              Generative RAG Synthesis
            </div>
            <div style={{ whiteSpace: "pre-wrap", fontSize: "13px", lineHeight: "1.6", color: "#CBD5E1" }}>
              {ragData.rag_response}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
