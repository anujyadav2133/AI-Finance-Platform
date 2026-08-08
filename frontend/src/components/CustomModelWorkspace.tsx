import React, { useState } from "react";
import { Cpu, Upload, Play, CheckCircle, BarChart2, Sliders, Layers, Rocket } from "lucide-react";
import { postCustomTrain, CustomTrainResult } from "../services/api";

export function CustomModelWorkspace() {
  const [selectedAlgo, setSelectedAlgo] = useState("XGBoost Ensemble");
  const [testSplit, setTestSplit] = useState(20);
  const [nEstimators, setNEstimators] = useState(100);
  const [learningRate, setLearningRate] = useState(0.05);
  const [maxDepth, setMaxDepth] = useState(5);
  const [fileName, setFileName] = useState<string | null>(null);

  const [training, setTraining] = useState(false);
  const [result, setResult] = useState<CustomTrainResult | null>(null);
  const [deployed, setDeployed] = useState(false);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  }

  async function handleTrainModel() {
    setTraining(true);
    setDeployed(false);
    const res = await postCustomTrain(selectedAlgo, testSplit, nEstimators, learningRate, maxDepth, fileName || "AAPL_historical_ohlcv.csv");
    setResult(res);
    setTraining(false);
  }

  function handleDeployModel() {
    setDeployed(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "20px" }}>
      {/* Header Banner */}
      <div className="fin-card" style={{ background: "linear-gradient(135deg, #0F172A 0%, #162032 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Cpu size={28} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: "22px", fontWeight: "800" }}>Custom Model Training Workspace</h2>
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
              Upload Custom Datasets, Tune Hyperparameters, Train ML Models & Deploy to Production
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Settings & Dataset Upload */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Left Card: Dataset Upload & Algorithm Selector */}
        <div className="fin-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700" }}>
            <Upload size={20} color="var(--accent-cyan)" /> 1. Dataset & Algorithm Selection
          </div>

          {/* Upload CSV Box */}
          <div style={{ border: "2px dashed #1C202B", borderRadius: "8px", padding: "24px", textAlign: "center", background: "#0B0E14", cursor: "pointer" }}>
            <input type="file" accept=".csv" onChange={handleFileUpload} id="csv-upload" style={{ display: "none" }} />
            <label htmlFor="csv-upload" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <Upload size={28} color="var(--accent-cyan)" />
              <div style={{ fontWeight: "700", fontSize: "14px" }}>{fileName ? `Uploaded: ${fileName}` : "Drag & Drop Stock CSV File"}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Supports Open, High, Low, Close, Volume CSV columns</div>
            </label>
          </div>

          {/* Algorithm Selector Buttons */}
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "10px" }}>Select Algorithm</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                "XGBoost Ensemble",
                "Random Forest",
                "Gradient Boosting",
                "Linear Ridge"
              ].map((algo) => (
                <button
                  key={algo}
                  onClick={() => setSelectedAlgo(algo)}
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: selectedAlgo === algo ? "1px solid var(--accent-cyan)" : "1px solid #1C202B",
                    background: selectedAlgo === algo ? "rgba(0, 242, 254, 0.1)" : "#0B0E14",
                    color: selectedAlgo === algo ? "var(--accent-cyan)" : "#CBD5E1",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  {algo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Card: Hyperparameter Controls */}
        <div className="fin-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700" }}>
            <Sliders size={20} color="#7F00FF" /> 2. Hyperparameter Controls
          </div>

          {/* Hyperparameter Sliders */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                <span>Train / Test Split Ratio</span>
                <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>{100 - testSplit}% Train / {testSplit}% Test</span>
              </div>
              <input type="range" min="10" max="40" step="5" value={testSplit} onChange={(e) => setTestSplit(Number(e.target.value))} style={{ width: "100%" }} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                <span>Estimators Count (n_estimators)</span>
                <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>{nEstimators} Trees</span>
              </div>
              <input type="range" min="20" max="300" step="10" value={nEstimators} onChange={(e) => setNEstimators(Number(e.target.value))} style={{ width: "100%" }} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                <span>Learning Rate</span>
                <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>{learningRate}</span>
              </div>
              <input type="range" min="0.01" max="0.3" step="0.01" value={learningRate} onChange={(e) => setLearningRate(Number(e.target.value))} style={{ width: "100%" }} />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                <span>Max Depth</span>
                <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>{maxDepth} Levels</span>
              </div>
              <input type="range" min="2" max="12" step="1" value={maxDepth} onChange={(e) => setMaxDepth(Number(e.target.value))} style={{ width: "100%" }} />
            </div>
          </div>

          <button className="btn-primary" onClick={handleTrainModel} disabled={training} style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px" }}>
            <Play size={16} className={training ? "spin" : ""} /> {training ? "Training Model..." : "Train Model"}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Metrics Overview Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            <div className="fin-card">
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Mean Absolute Error (MAE)</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "#E2E8F0" }}>${result.mae}</div>
            </div>
            <div className="fin-card">
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Root Mean Sq Error (RMSE)</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "#E2E8F0" }}>${result.rmse}</div>
            </div>
            <div className="fin-card">
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>MAPE (%)</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--accent-cyan)" }}>{result.mape_pct}%</div>
            </div>
            <div className="fin-card">
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>R² Score</div>
              <div style={{ fontSize: "24px", fontWeight: "900", color: "var(--accent-green)" }}>{result.r2_score}</div>
            </div>
          </div>

          {/* Feature Importance & Deploy Action */}
          <div className="fin-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>
                <Layers size={18} color="#7F00FF" /> Feature Importances
              </div>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {result.feature_importances.map((f, i) => (
                  <div key={i} style={{ background: "#0B0E14", padding: "8px 12px", borderRadius: "6px", border: "1px solid #1C202B", fontSize: "12px" }}>
                    <span style={{ fontWeight: "700" }}>{f.feature}:</span> <span style={{ color: "var(--accent-cyan)" }}>{(f.importance * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleDeployModel}
              disabled={deployed}
              className="btn-primary"
              style={{
                background: deployed ? "var(--accent-green)" : "linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)",
                color: "#000",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px"
              }}
            >
              {deployed ? <CheckCircle size={16} /> : <Rocket size={16} />}
              {deployed ? "Model Deployed to Production!" : "Deploy Model to Production"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
