import { useScene } from "../../context/SceneContext";

const MOCK_RESULTS = {
  totalArea: { value: "12.4", unit: "km²", style: "" },
  changedArea: { value: "1.87", unit: "km²", style: "accent" },
  changePercent: { value: "15.1", unit: "%", style: "warning" },
  confidence: { value: "94.2", unit: "%", style: "success" },
  detectedObjects: { value: "23", unit: "objects", style: "" },
  processingTime: { value: "4.8", unit: "sec", style: "" },
};

function StatCard({ label, value, unit, variant }) {
  return (
    <div className={`stat-card ${variant ? `stat-card--${variant}` : ""}`}>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">
        {value}
        <span className="stat-card__unit">{unit}</span>
      </div>
    </div>
  );
}

export default function ResultsSection() {
  const {
    detectionStatus,
    selectedVillage,
    t1Scene,
    t2Scene,
    inputMode,
    uploadedFiles,
  } = useScene();


  const isInputValid =
    inputMode === "directory"
      ? Boolean(selectedVillage && t1Scene && t2Scene)
      : uploadedFiles.length > 0;

  
  const isComplete = detectionStatus === "complete" && isInputValid;
  const isRunning = detectionStatus === "running";

  return (
    <section className="results-section" id="results-section">
      <div className="results-section__header">
        <div className="results-section__title">
          <span>📊</span>
          Detection Results
        </div>
        {isComplete && (
          <span className="results-section__badge results-section__badge--complete">
            Complete
          </span>
        )}
        {isRunning && (
          <span className="results-section__badge results-section__badge--pending">
            Processing…
          </span>
        )}
        {!isComplete && !isRunning && (
          <span
            className="results-section__badge"
            style={{
              background: "var(--bg-elevated)",
              color: "var(--text-dim)",
            }}
          >
            Waiting
          </span>
        )}
      </div>

      {isComplete ? (
        <div className="stat-grid">
          <StatCard
            label="Total Area"
            value={MOCK_RESULTS.totalArea.value}
            unit={MOCK_RESULTS.totalArea.unit}
          />
          <StatCard
            label="Changed Area"
            value={MOCK_RESULTS.changedArea.value}
            unit={MOCK_RESULTS.changedArea.unit}
            variant="accent"
          />
          <StatCard
            label="Change %"
            value={MOCK_RESULTS.changePercent.value}
            unit={MOCK_RESULTS.changePercent.unit}
            variant="warning"
          />
          <StatCard
            label="Confidence"
            value={MOCK_RESULTS.confidence.value}
            unit={MOCK_RESULTS.confidence.unit}
            variant="success"
          />
          <StatCard
            label="Detected Objects"
            value={MOCK_RESULTS.detectedObjects.value}
            unit={MOCK_RESULTS.detectedObjects.unit}
          />
          <StatCard
            label="Processing Time"
            value={MOCK_RESULTS.processingTime.value}
            unit={MOCK_RESULTS.processingTime.unit}
          />
        </div>
      ) : (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            color: "var(--text-dim)",
            fontSize: "0.8125rem",
          }}
        >
          {isRunning
            ? "Processing satellite imagery…"
            : "No detection results yet. Select Village, T1 & T2 scenes and run detection to see results."}
        </div>
      )}
    </section>
  );
}
