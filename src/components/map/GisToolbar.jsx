import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";
import "./map-tools.css";

/* ------------------------------ geodesy ------------------------------ */
const R = 6378137;
const rad = (d) => (d * Math.PI) / 180;

function haversine(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Spherical excess area of a closed ring, in m². */
function geodesicArea(ring) {
  let a = 0;
  for (let i = 0, n = ring.length; i < n; i++) {
    const p1 = ring[i];
    const p2 = ring[(i + 1) % n];
    a +=
      rad(p2.lng - p1.lng) *
      (2 + Math.sin(rad(p1.lat)) + Math.sin(rad(p2.lat)));
  }
  return Math.abs((a * R * R) / 2);
}

export const fmtLen = (m) =>
  m < 1000 ? `${m.toFixed(1)} m` : `${(m / 1000).toFixed(3)} km`;
export const fmtArea = (m) =>
  m < 1e4
    ? `${m.toFixed(0)} m²`
    : m < 1e6
      ? `${(m / 1e4).toFixed(2)} ha`
      : `${(m / 1e6).toFixed(3)} km²`;

/* ------------------------------- icons ------------------------------- */
const Icon = ({ d }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: d }}
  />
);
const P = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  home: '<path d="M4 9l8-6 8 6v11a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>',
  ruler:
    '<path d="M3 15.5 15.5 3 21 8.5 8.5 21z"/><path d="M7.5 13.5 9 15M10 11l2 2M12.5 8.5 14 10M15 6l2 2"/>',
  area: '<path d="M4 20V7l7-3 9 4v12z"/><path d="M4 7l9 4v9M13 11l7-3"/>',
  layers:
    '<path d="M12 3 3 8l9 5 9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5"/>',
  globe:
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/>',
  split: '<path d="M12 3v18"/><path d="M4 7h4v10H4zM16 7h4v10h-4z"/>',
  trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
  expand: '<path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5"/>',
};

const Btn = ({ act, title, path, active, onClick }) => (
  <button
    type="button"
    className={`dv-btn${active ? " active" : ""}`}
    title={title}
    aria-label={title}
    aria-pressed={active || undefined}
    onClick={() => onClick(act)}
  >
    <Icon d={path} />
  </button>
);

/* ---------------------------- the toolbar ---------------------------- */
export default function GisToolbar({
  aoiBounds,
  layers = [],
  onToggleLayer,
  basemaps = {},
  activeBasemap,
  onBasemapChange,
  swipeEnabled = true,
  onSwipeToggle,
  position = "top-right",
}) {
  const map = useMap();
  const rootRef = useRef(null);
  const [pop, setPop] = useState(null); // 'layers' | 'base' | null
  const [mode, setMode] = useState(null); // 'dist' | 'area' | null
  const [cursor, setCursor] = useState(null);
  const [zoom, setZoom] = useState(map.getZoom());

  const measureLayer = useRef(null);
  const draft = useRef(null);
  const pts = useRef([]);

  /* results layer for finished measurements */
  useEffect(() => {
    measureLayer.current = L.layerGroup().addTo(map);
    return () => {
      measureLayer.current?.remove();
      measureLayer.current = null;
    };
  }, [map]);

  /* keep Leaflet from stealing clicks/scroll over the UI */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    L.DomEvent.disableClickPropagation(el);
    L.DomEvent.disableScrollPropagation(el);
  }, []);

  const clearDraft = () => {
    if (draft.current) {
      measureLayer.current?.removeLayer(draft.current);
      draft.current = null;
    }
  };

  const redrawDraft = useCallback(
    (hover) => {
      clearDraft();
      const chain = hover ? [...pts.current, hover] : [...pts.current];
      if (chain.length < 2) return;
      const style = {
        color: "#4fd1c5",
        weight: 2,
        dashArray: "5 4",
        interactive: false,
      };
      draft.current =
        mode === "area" && chain.length > 2
          ? L.polygon(chain, {
              ...style,
              fillColor: "#4fd1c5",
              fillOpacity: 0.15,
            })
          : L.polyline(chain, style);
      measureLayer.current?.addLayer(draft.current);
    },
    [mode],
  );

  const stopMeasure = useCallback(() => {
    clearDraft();
    pts.current = [];
    setMode(null);
    map.getContainer().style.cursor = "";
    map.doubleClickZoom.enable();
  }, [map]);

  const finishMeasure = useCallback(() => {
    const ring = pts.current;
    const kind = mode;
    if (
      !kind ||
      (kind === "dist" && ring.length < 2) ||
      (kind === "area" && ring.length < 3)
    ) {
      stopMeasure();
      return;
    }
    clearDraft();

    let shape;
    let text;
    if (kind === "dist") {
      let total = 0;
      for (let i = 1; i < ring.length; i++)
        total += haversine(ring[i - 1], ring[i]);
      shape = L.polyline(ring, { color: "#4fd1c5", weight: 3 });
      text = fmtLen(total);
    } else {
      let per = 0;
      for (let i = 0; i < ring.length; i++)
        per += haversine(ring[i], ring[(i + 1) % ring.length]);
      shape = L.polygon(ring, {
        color: "#4fd1c5",
        weight: 2,
        fillColor: "#4fd1c5",
        fillOpacity: 0.2,
      });
      text = `${fmtArea(geodesicArea(ring))} · perimeter ${fmtLen(per)}`;
    }
    shape.bindTooltip(text, {
      permanent: true,
      direction: "center",
      className: "dv-measure-tip",
    });
    measureLayer.current?.addLayer(shape);
    ring.forEach((p) =>
      measureLayer.current?.addLayer(
        L.circleMarker(p, {
          radius: 3,
          color: "#4fd1c5",
          fillColor: "#0b0e13",
          fillOpacity: 1,
          weight: 2,
        }),
      ),
    );
    stopMeasure();
  }, [mode, stopMeasure]);

  /* map interactions while measuring */
  useMapEvents({
    click(e) {
      if (!mode) {
        setPop(null);
        return;
      }
      pts.current = [...pts.current, e.latlng];
      redrawDraft();
    },
    mousemove(e) {
      setCursor(e.latlng);
      if (mode && pts.current.length) redrawDraft(e.latlng);
    },
    mouseout() {
      setCursor(null);
    },
    dblclick() {
      if (mode) finishMeasure();
    },
    zoomend() {
      setZoom(map.getZoom());
    },
  });

  useEffect(() => {
    if (!mode) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") finishMeasure();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mode, finishMeasure]);

  const act = (id) => {
    if (id !== "layers" && id !== "base") setPop(null);
    switch (id) {
      case "zin":
        map.zoomIn();
        break;
      case "zout":
        map.zoomOut();
        break;
      case "home":
        if (aoiBounds) map.flyToBounds(aoiBounds, { padding: [24, 24] });
        break;
      case "dist":
      case "area":
        if (mode === id) {
          stopMeasure();
        } else {
          stopMeasure();
          setMode(id);
          pts.current = [];
          map.getContainer().style.cursor = "crosshair";
          map.doubleClickZoom.disable();
        }
        break;
      case "clear":
        stopMeasure();
        measureLayer.current?.clearLayers();
        break;
      case "swipe":
        onSwipeToggle?.(!swipeEnabled);
        break;
      case "layers":
      case "base":
        setPop((p) => (p === id ? null : id));
        break;
      case "full": {
        const el =
          map.getContainer().closest("[data-dv-fullscreen]") ??
          map.getContainer();
        if (document.fullscreenElement) document.exitFullscreen();
        else el.requestFullscreen?.();
        break;
      }
      default:
        break;
    }
  };

  const baseKeys = Object.keys(basemaps);

  return createPortal(
    <>
      <div ref={rootRef} className={`dv-tools ${position}`}>
        <div className="dv-rail">
          <Btn act="zin" title="Zoom in" path={P.plus} onClick={act} />
          <Btn act="zout" title="Zoom out" path={P.minus} onClick={act} />
          <Btn act="home" title="Zoom to AOI" path={P.home} onClick={act} />
        </div>

        <div className="dv-rail">
          <Btn
            act="dist"
            title="Measure distance"
            path={P.ruler}
            active={mode === "dist"}
            onClick={act}
          />
          <Btn
            act="area"
            title="Measure area"
            path={P.area}
            active={mode === "area"}
            onClick={act}
          />
          <Btn
            act="clear"
            title="Clear measurements"
            path={P.trash}
            onClick={act}
          />
        </div>

        <div className="dv-rail">
          <Btn
            act="swipe"
            title="Toggle swipe compare"
            path={P.split}
            active={swipeEnabled}
            onClick={act}
          />
          {layers.length > 0 && (
            <Btn
              act="layers"
              title="Layers"
              path={P.layers}
              active={pop === "layers"}
              onClick={act}
            />
          )}
          {baseKeys.length > 0 && (
            <Btn
              act="base"
              title="Basemap"
              path={P.globe}
              active={pop === "base"}
              onClick={act}
            />
          )}
          <Btn act="full" title="Fullscreen" path={P.expand} onClick={act} />
        </div>

        {pop === "layers" && (
          <div className="dv-pop">
            <h4>Layers</h4>
            {layers.map((l) => (
              <label key={l.id}>
                <input
                  type="checkbox"
                  checked={l.visible}
                  onChange={(e) => onToggleLayer?.(l.id, e.target.checked)}
                />
                {l.label}
              </label>
            ))}
          </div>
        )}

        {pop === "base" && (
          <div className="dv-pop">
            <h4>Basemap</h4>
            {baseKeys.map((k) => (
              <label key={k}>
                <input
                  type="radio"
                  name="dv-base"
                  checked={activeBasemap === k}
                  onChange={() => onBasemapChange?.(k)}
                />
                {basemaps[k].label ?? k}
              </label>
            ))}
          </div>
        )}
      </div>

      {mode && (
        <div className="dv-hint show">
          {mode === "dist"
            ? "Click to add points · double-click or Esc to finish"
            : "Click to trace the polygon · double-click or Esc to close it"}
        </div>
      )}

      <div className="dv-readout">
        <div className="dv-chip">
          {cursor ? (
            <>
              <b>{cursor.lat.toFixed(5)}</b>, <b>{cursor.lng.toFixed(5)}</b>
            </>
          ) : (
            "—"
          )}
        </div>
        <div className="dv-chip">
          z <b>{zoom}</b>
        </div>
      </div>
    </>,
    map.getContainer(),
  );
}
