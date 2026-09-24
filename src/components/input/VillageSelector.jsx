import { useScene } from "../../context/SceneContext";

export default function VillageSelector() {
  const { selectedVillage, setSelectedVillage, villages } = useScene();

  return (
    <div className="section" id="village-selector">
      <div className="section__header">
        <span className="section__icon">🏘️</span>
        <h2 className="section__title">Village</h2>
      </div>
      <p className="section__subtitle">Select Village</p>

      <div className="select-wrapper">
        <select
          className="select-input"
          value={selectedVillage}
          onChange={(e) => setSelectedVillage(e.target.value)}
          id="village-dropdown"
        >
          <option value="">— Select a village —</option>
          {villages.map((village) => (
            <option key={village} value={village}>
              {village}
            </option>
          ))}
        </select>
        <span className="select-chevron">▾</span>
      </div>
    </div>
  );
}
