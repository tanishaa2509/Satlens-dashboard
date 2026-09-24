import { useState } from 'react';
import { useScene } from '../../context/SceneContext';

function AccordionItem({ icon, label, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="accordion">
      <button
        className="accordion__trigger"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className={`accordion__trigger-icon ${open ? 'accordion__trigger-icon--open' : ''}`}>
          ▸
        </span>
        {icon && <span className="accordion__trigger-label-icon">{icon}</span>}
        <span>{label}</span>
      </button>
      {open && <div className="accordion__body">{children}</div>}
    </div>
  );
}

function SliderField({ label, value, min, max, step, onChange }) {
  return (
    <div className="slider-group">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-value">{value}</span>
      </div>
      <input
        type="range"
        className="slider-track"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export default function Sidebar({ collapsed }) {
  const { modelSettings, updateModelSetting } = useScene();
  const [boundaryColor, setBoundaryColor] = useState('#ef4444');
  const [lineThickness, setLineThickness] = useState(2);
  const [lineOpacity, setLineOpacity] = useState(0.8);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar__inner">
        {/* Header */}
        <div className="sidebar__header">
          <div className="sidebar__header-title">
            <span className="sidebar__header-icon">⚙</span>
            Configuration
          </div>
        </div>

        <div className="sidebar__content">
          {/* Model Settings */}
          <AccordionItem icon="⚙" label="Model Settings" defaultOpen={true}>
            <div className="sidebar-field">
              <label className="sidebar-label">Model path</label>
              <input
                className="sidebar-input"
                type="text"
                value={modelSettings.modelPath}
                onChange={(e) => updateModelSetting('modelPath', e.target.value)}
                id="model-path-input"
              />
            </div>
            <SliderField
              label="Tile size"
              value={modelSettings.tileSize}
              min={64}
              max={1024}
              step={64}
              onChange={(v) => updateModelSetting('tileSize', v)}
            />
            <SliderField
              label="Overlap"
              value={modelSettings.overlap}
              min={0}
              max={128}
              step={8}
              onChange={(v) => updateModelSetting('overlap', v)}
            />
            <SliderField
              label="Threshold"
              value={modelSettings.threshold}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => updateModelSetting('threshold', v)}
            />
          </AccordionItem>

          {/* Visualization */}
          <AccordionItem icon="📊" label="Visualization">
            <div className="sidebar-field">
              <label className="sidebar-label">Color map</label>
              <select className="sidebar-input" defaultValue="jet">
                <option value="jet">Jet</option>
                <option value="viridis">Viridis</option>
                <option value="magma">Magma</option>
                <option value="gray">Grayscale</option>
              </select>
            </div>
            <div className="sidebar-field">
              <label className="sidebar-label">Opacity</label>
              <input
                type="range"
                className="slider-track"
                min={0}
                max={1}
                step={0.05}
                defaultValue={0.7}
              />
            </div>
          </AccordionItem>

          {/* Boundaries */}
          <AccordionItem icon="🗺" label="Boundaries">
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Configure boundary layers for the map view.
            </p>
          </AccordionItem>

          {/* Scene Directory */}
          <AccordionItem icon="📁" label="Scene Directory">
            <div className="sidebar-field">
              <label className="sidebar-label">Directory path</label>
              <input
                className="sidebar-input"
                type="text"
                placeholder="/data/scenes/"
                id="scene-dir-input"
              />
            </div>
          </AccordionItem>

          {/* Boundary Style */}
          <div className="boundary-section">
            <div className="boundary-section__title">Boundary Style</div>

            <div className="color-picker-row">
              <span className="color-picker-label">Boundary color</span>
              <div className="color-swatch">
                <input
                  type="color"
                  value={boundaryColor}
                  onChange={(e) => setBoundaryColor(e.target.value)}
                  id="boundary-color-input"
                />
              </div>
            </div>

            <SliderField
              label="Line thickness"
              value={lineThickness}
              min={1}
              max={8}
              step={0.5}
              onChange={setLineThickness}
            />
            <SliderField
              label="Line opacity"
              value={lineOpacity}
              min={0}
              max={1}
              step={0.05}
              onChange={setLineOpacity}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

