import { useEffect, useMemo, useRef, useState } from "react";

import { useScene } from "../../context/SceneContext";

import {
  MapContainer,
  TileLayer,
  ImageOverlay,
  Polygon,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import SwipeControl, {
  BEFORE_PANE,
  AFTER_PANE,
  ensureSwipePanes,
} from "./SwipeControl";

import GisToolbar from "./GisToolbar";
import "./map-tools.css";

/* ------------------------------------------------------------------ */
/* Mock data                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_CENTER = [23.6345, 85.3803];
const INITIAL_ZOOM = 14;

const MOCK_BOUNDARY = [
  [23.645, 85.37],
  [23.645, 85.39],
  [23.625, 85.39],
  [23.625, 85.37],
];

const MOCK_DETECTIONS = [
  [
    [23.638, 85.375],
    [23.638, 85.378],
    [23.635, 85.378],
    [23.635, 85.375],
  ],
];

const AOI_BOUNDS = L.latLngBounds(MOCK_BOUNDARY);

/* ------------------------------------------------------------------ */
/* Tile sources                                                       */
/* ------------------------------------------------------------------ */

/*
 * T1 / PRE fallback map.
 * Used when a real uploaded T1 image is not available.
 */
const T1_FALLBACK_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

/*
 * T2 / POST fallback imagery.
 * Used when a real uploaded T2 image is not available.
 */
const T2_FALLBACK_TILES =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

/*
 * Dark base map.
 *
 * IMPORTANT:
 * This must be a plain URL.
 * Do NOT use Markdown [text](url) syntax here.
 */
const BASE_TILES =
  "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_3u2d_1_571c28ccba6f4791d823129e";

/* ------------------------------------------------------------------ */
/* Create swipe panes                                                 */
/* ------------------------------------------------------------------ */

function SwipePanes() {
  const map = useMap();

  ensureSwipePanes(map);

  return null;
}

/* ------------------------------------------------------------------ */
/* Convert uploaded image into a browser URL                          */
/* ------------------------------------------------------------------ */

function useImageUrl(item) {
  const file = item?.file ?? item;

  const url = useMemo(() => {
    if (typeof Blob === "undefined" || !(file instanceof Blob)) {
      return null;
    }

    if (!file.type?.startsWith("image/")) {
      return null;
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [url]);

  return url;
}

/* ------------------------------------------------------------------ */
/* Map Viewer                                                         */
/* ------------------------------------------------------------------ */

export default function MapViewer() {
  const {
    overlays,
    toggleOverlay,
    detectionStatus,
    selectedVillage,
    t1Scene,
    t2Scene,
    inputMode,
    uploadedFiles,
  } = useScene();

  const containerRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [swipeOn, setSwipeOn] = useState(true);

  /* ---------------------------------------------------------------- */
  /* Layer visibility                                                 */
  /* ---------------------------------------------------------------- */

  const [layerVisibility, setLayerVisibility] = useState({
    baseMap: true,
    preImage: true,
    postImage: true,
    boundary: true,
    detectedAreas: true,
  });

  /* ---------------------------------------------------------------- */
  /* Validate input                                                   */
  /* ---------------------------------------------------------------- */

  const isInputValid =
    inputMode === "directory"
      ? Boolean(selectedVillage && t1Scene && t2Scene)
      : uploadedFiles.length >= 2;

  const isActive = isInputValid && detectionStatus === "complete";

  /* ---------------------------------------------------------------- */
  /* Uploaded images                                                  */
  /* ---------------------------------------------------------------- */

  /*
   * Upload mode:
   * uploadedFiles[0] = T1 / PRE
   * uploadedFiles[1] = T2 / POST
   */

  const t1Url = useImageUrl(inputMode === "upload" ? uploadedFiles[0] : null);

  const t2Url = useImageUrl(inputMode === "upload" ? uploadedFiles[1] : null);

  /* ---------------------------------------------------------------- */
  /* Fullscreen tracking                                              */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onChange);

    return () => {
      document.removeEventListener("fullscreenchange", onChange);
    };
  }, []);

  /* ---------------------------------------------------------------- */
  /* Layer toggle                                                     */
  /* ---------------------------------------------------------------- */

  const handleToggleLayer = (id, visible) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [id]: visible,
    }));

    if (id === "boundary") {
      toggleOverlay("boundaries");
    }

    if (id === "detectedAreas") {
      toggleOverlay("detection");
    }
  };

  /* ---------------------------------------------------------------- */
  /* Layers passed to GIS toolbar                                    */
  /* ---------------------------------------------------------------- */

  const toolbarLayers = [
    {
      id: "baseMap",
      label: "Base map",
      visible: layerVisibility.baseMap,
    },
    {
      id: "preImage",
      label: "PRE / T1 image",
      visible: layerVisibility.preImage,
    },
    {
      id: "postImage",
      label: "POST / T2 image",
      visible: layerVisibility.postImage,
    },
    {
      id: "boundary",
      label: "Village boundary",
      visible: layerVisibility.boundary,
    },
    {
      id: "detectedAreas",
      label: "Detected areas",
      visible: layerVisibility.detectedAreas,
    },
  ];

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="section" id="map-viewer-section">
      <div
        ref={containerRef}
        data-dv-fullscreen
        className="map-viewer"
        style={{
          position: "relative",
          width: "100%",
          height: isFullscreen ? "100vh" : "540px",
          overflow: "hidden",
          borderRadius: isFullscreen ? "0px" : "8px",
          userSelect: "none",
          background: "#18181b",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* ---------------------------------------------------------- */}
        {/* MAP HIDDEN UNTIL DETECTION IS COMPLETE                     */}
        {/* ---------------------------------------------------------- */}

        {!isActive && (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              background: "#121214",
              color: "#fff",
            }}
          >
            <span
              style={{
                fontSize: "2.5rem",
              }}
            >
              🌍
            </span>

            {detectionStatus === "running" ? (
              <>
                <span
                  style={{
                    marginTop: "12px",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  Running Detection...
                </span>

                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#a1a1aa",
                    marginTop: "6px",
                  }}
                >
                  Please wait while the imagery is being processed
                </span>
              </>
            ) : (
              <>
                <span
                  style={{
                    marginTop: "12px",
                    fontWeight: "600",
                    fontSize: "1rem",
                  }}
                >
                  GIS Map Viewport
                </span>

                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#a1a1aa",
                    marginTop: "6px",
                  }}
                >
                  Select Village, T1 and T2 images, then run detection to view
                  change map
                </span>
              </>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------- */}
        {/* ACTIVE MAP                                                  */}
        {/* ---------------------------------------------------------- */}

        {isActive && (
          <MapContainer
            center={INITIAL_CENTER}
            zoom={INITIAL_ZOOM}
            zoomControl={false}
            style={{
              width: "100%",
              height: "100%",
              background: "#18181b",
            }}
          >
            {/* ------------------------------------------------------ */}
            {/* 1. Create swipe panes first                            */}
            {/* ------------------------------------------------------ */}

            <SwipePanes />

            {/* ------------------------------------------------------ */}
            {/* 2. DARK BASE MAP                                       */}
            {/* ------------------------------------------------------ */}

            {layerVisibility.baseMap && (
              <TileLayer
                url={BASE_TILES}
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              />
            )}

            {/* ------------------------------------------------------ */}
            {/* 3. PRE / T1 IMAGE                                      */}
            {/* ------------------------------------------------------ */}

            {layerVisibility.preImage &&
              (t1Url ? (
                <ImageOverlay
                  url={t1Url}
                  bounds={AOI_BOUNDS}
                  pane={BEFORE_PANE}
                />
              ) : (
                <TileLayer
                  url={T1_FALLBACK_TILES}
                  pane={BEFORE_PANE}
                  className="dark-leaflet-tiles"
                  attribution="&copy; OpenStreetMap contributors"
                />
              ))}

            {/* ------------------------------------------------------ */}
            {/* 4. POST / T2 IMAGE                                     */}
            {/* ------------------------------------------------------ */}

            {layerVisibility.postImage &&
              (t2Url ? (
                <ImageOverlay
                  url={t2Url}
                  bounds={AOI_BOUNDS}
                  pane={AFTER_PANE}
                />
              ) : (
                <TileLayer
                  url={T2_FALLBACK_TILES}
                  pane={AFTER_PANE}
                  attribution="Tiles &copy; Esri"
                />
              ))}

            {/* ------------------------------------------------------ */}
            {/* 5. VILLAGE BOUNDARY                                    */}
            {/* ------------------------------------------------------ */}

            {layerVisibility.boundary && overlays.boundaries && (
              <Polygon
                positions={MOCK_BOUNDARY}
                pathOptions={{
                  color: "#3b82f6",
                  weight: 2,
                  fillOpacity: 0.05,
                  dashArray: "5, 5",
                }}
              />
            )}

            {/* ------------------------------------------------------ */}
            {/* 6. DETECTED AREAS                                     */}
            {/* ------------------------------------------------------ */}

            {layerVisibility.detectedAreas &&
              overlays.detection &&
              MOCK_DETECTIONS.map((pos, i) => (
                <Polygon
                  key={i}
                  positions={pos}
                  pane={AFTER_PANE}
                  pathOptions={{
                    color: "#ef4444",
                    weight: 2,
                    fillColor: "#ef4444",
                    fillOpacity: 0.5,
                  }}
                />
              ))}

            {/* ------------------------------------------------------ */}
            {/* 7. BEFORE / AFTER SWIPE                                */}
            {/* ------------------------------------------------------ */}

            <SwipeControl
              enabled={swipeOn}
              labels={[`PRE · ${t1Scene || "T1"}`, `POST · ${t2Scene || "T2"}`]}
            />

            {/* ------------------------------------------------------ */}
            {/* 8. GIS TOOLBAR                                         */}
            {/* ------------------------------------------------------ */}

            <GisToolbar
              aoiBounds={AOI_BOUNDS}
              swipeEnabled={swipeOn}
              onSwipeToggle={setSwipeOn}
              layers={toolbarLayers}
              onToggleLayer={handleToggleLayer}
            />
          </MapContainer>
        )}
      </div>
    </div>
  );
}
