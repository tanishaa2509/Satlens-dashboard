import { useScene } from "../../context/SceneContext";
import VillageSelector from "./VillageSelector";
import SceneDropdown from "./SceneDropdown";
import FileDropzone from "./FileDropzone";
import RunDetectionButton from "./RunDetectionButton";
import InfoBanner from "./InfoBanner";

export default function InputSelection() {
  const { inputMode, setInputMode, selectedVillage } = useScene();

  const isVillageSelected = Boolean(
    selectedVillage && selectedVillage.trim() !== "",
  );

  return (
    <div className="section" id="input-selection">
      <div className="section__header">
        <span className="section__icon">🔄</span>
        <h2 className="section__title">Input Selection Mode</h2>
      </div>
      <p className="section__subtitle">Choose input method:</p>

      <div className="input-mode-group">
        <label className="input-mode-option">
          <input
            type="radio"
            name="inputMode"
            value="directory"
            checked={inputMode === "directory"}
            onChange={() => setInputMode("directory")}
          />
          <span className="input-mode-label">
            <span className="input-mode-label__icon">📁</span>
            Select from Directory
          </span>
        </label>

        <label className="input-mode-option">
          <input
            type="radio"
            name="inputMode"
            value="upload"
            checked={inputMode === "upload"}
            onChange={() => setInputMode("upload")}
          />
          <span className="input-mode-label">
            <span className="input-mode-label__icon">📤</span>
            Upload Files
          </span>
        </label>
      </div>

      <div className="divider" />

      {/*  */}
      <VillageSelector />

      <div className="divider" />

      {/*  */}
      {inputMode === "directory" ? (
        isVillageSelected && <SceneDropdown />
      ) : (
        <FileDropzone />
      )}

      <div className="divider" />
      <RunDetectionButton />

      <div className="divider" />
      <InfoBanner />
    </div>
  );
}
