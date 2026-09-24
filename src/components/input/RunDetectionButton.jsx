import { useScene } from "../../context/SceneContext";

export default function RunDetectionButton() {
  const {
    detectionStatus,
    runDetection,
    t1Scene,
    t2Scene,
    selectedVillage,
    inputMode,
    uploadedFiles,
  } = useScene();

  const isInputValid =
    inputMode === "directory"
      ? Boolean(selectedVillage && t1Scene && t2Scene)
      : Boolean(
          selectedVillage &&
          (uploadedFiles.length >= 2 || (t1Scene && t2Scene)),
        );

  const isRunning = detectionStatus === "running";
  const isComplete = detectionStatus === "complete";

  return (
    <div className="run-detection" id="run-detection">
      <button
        className={`run-detection-btn ${isRunning ? "run-detection-btn--running" : ""}`}
        onClick={runDetection}
        disabled={!isInputValid || isRunning}
      >
        <span className="run-detection-btn__icon">
          {isRunning ? "⏳" : isComplete ? "✅" : "🔍"}
        </span>
        {isRunning
          ? "Running Detection…"
          : isComplete
            ? "Job Submitted"
            : "Run AI Detection"}
      </button>
    </div>
  );
}
