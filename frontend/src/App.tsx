import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { StockTerminal } from "./components/StockTerminal";
import { PredictionsXAI } from "./components/PredictionsXAI";
import { PortfolioAnalyzer } from "./components/PortfolioAnalyzer";
import { BacktesterLab } from "./components/BacktesterLab";
import { FinAIChatbot } from "./components/FinAIChatbot";
import { MultiAgentHub } from "./components/MultiAgentHub";
import { MLOpsDashboard } from "./components/MLOpsDashboard";
import { DocRAGAnalyzer } from "./components/DocRAGAnalyzer";
import { CustomModelWorkspace } from "./components/CustomModelWorkspace";
import {
  fetchStockData,
  fetchForecast,
  fetchSentiment,
  fetchRisk,
  fetchShap,
  StockData,
  ForecastData,
  SentimentData,
  RiskData,
  ShapData
} from "./services/api";

export function App() {
  const [currentSymbol, setCurrentSymbol] = useState("AAPL");
  const [activeTab, setActiveTab] = useState("terminal");

  const [stockData, setStockData] = useState<StockData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [shapData, setShapData] = useState<ShapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [sData, fData, sentData, rData, shData] = await Promise.all([
        fetchStockData(currentSymbol),
        fetchForecast(currentSymbol),
        fetchSentiment(currentSymbol),
        fetchRisk(currentSymbol),
        fetchShap(currentSymbol)
      ]);
      setStockData(sData);
      setForecastData(fData);
      setSentimentData(sentData);
      setRiskData(rData);
      setShapData(shData);
      setLoading(false);
    }
    loadData();
  }, [currentSymbol]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-dark)" }}>
      <Header
        currentSymbol={currentSymbol}
        onSymbolChange={(sym) => setCurrentSymbol(sym)}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      <main style={{ flex: 1 }}>
        {activeTab === "terminal" && (
          <StockTerminal
            stockData={stockData}
            sentimentData={sentimentData}
            riskData={riskData}
            loading={loading}
          />
        )}
        {activeTab === "custom-ml" && <CustomModelWorkspace />}
        {activeTab === "multi-agent" && <MultiAgentHub symbol={currentSymbol} />}
        {activeTab === "mlops" && <MLOpsDashboard symbol={currentSymbol} />}
        {activeTab === "rag" && <DocRAGAnalyzer symbol={currentSymbol} />}
        {activeTab === "predictions" && (
          <PredictionsXAI
            symbol={currentSymbol}
            forecastData={forecastData}
            shapData={shapData}
            loading={loading}
          />
        )}
        {activeTab === "portfolio" && <PortfolioAnalyzer />}
        {activeTab === "backtest" && <BacktesterLab symbol={currentSymbol} />}
        {activeTab === "chat" && <FinAIChatbot symbol={currentSymbol} />}
      </main>
    </div>
  );
}

export default App;
