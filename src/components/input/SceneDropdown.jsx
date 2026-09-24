import { useScene } from "../../context/SceneContext";

function ScenePanel({ label, sublabel, value, onChange, id }) {
  const { scenes } = useScene();

  return (
    <div>
      <div className="scene-panel__label">
        <span>{label === "Before Image (T1)" ? "⏪" : "⏩"}</span>
        <span>{label}</span>
      </div>
      <p className="scene-panel__sublabel">{sublabel}</p>

      <div className="select-wrapper">
        <select
          className="select-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          id={id}
        >
          <option value="">— Select scene —</option>
          {scenes.map((scene) => (
            <option key={scene} value={scene}>
              {scene}
            </option>
          ))}
        </select>
        <span className="select-chevron">▾</span>
      </div>

      {value && (
        <div className="file-badge">
          <span className="file-badge__icon">✅</span>
          <span>{value}</span>
        </div>
      )}
    </div>
  );
}

export default function SceneDropdown() {
  const { t1Scene, setT1Scene, t2Scene, setT2Scene, inputMode } = useScene();

  if (inputMode !== "directory") return null;

  return (
    <div className="section" id="scene-selection">
      <div className="scene-grid">
        <ScenePanel
          label="Before Image (T1)"
          sublabel="Select T1 scene"
          value={t1Scene}
          onChange={setT1Scene}
          id="t1-scene-dropdown"
        />
        <ScenePanel
          label="After Image (T2)"
          sublabel="Select T2 scene"
          value={t2Scene}
          onChange={setT2Scene}
          id="t2-scene-dropdown"
        />
      </div>
    </div>
  );
}
