import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import "./map-tools.css";

export const BEFORE_PANE = "dv-before";
export const AFTER_PANE = "dv-after";

/**
 * Creates the two clipped panes. Safe to call repeatedly.
 * Pane z-index sits between Leaflet's tilePane (200) and overlayPane (400),
 * so anything you *don't* put in a swipe pane stays visible on both sides.
 */
export function ensureSwipePanes(map) {
  if (!map.getPane(BEFORE_PANE)) map.createPane(BEFORE_PANE).style.zIndex = 350;
  if (!map.getPane(AFTER_PANE)) map.createPane(AFTER_PANE).style.zIndex = 360;
}

export default function SwipeControl({
  value,
  onChange,
  enabled = true,
  defaultValue = 0.5,
  labels = ["T1 · Before", "T2 · After"],
  min = 0.02,
  max = 0.98,
}) {
  const map = useMap();
  const [internal, setInternal] = useState(defaultValue);
  const ratio = value ?? internal;

  const ratioRef = useRef(ratio);
  ratioRef.current = ratio;
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const handleRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    ensureSwipePanes(map);
  }, [map]);

  /** Clip both panes in layer-point space so the split survives pan + zoom. */
  const updateClip = useCallback(() => {
    const before = map.getPane(BEFORE_PANE);
    const after = map.getPane(AFTER_PANE);
    if (!before || !after) return;

    if (!enabledRef.current) {
      before.style.clip = "";
      after.style.clip = "";
      return;
    }
    const size = map.getSize();
    const nw = map.containerPointToLayerPoint([0, 0]);
    const se = map.containerPointToLayerPoint([size.x, size.y]);
    const x = Math.round(nw.x + size.x * ratioRef.current);

    // clip: rect(top, right, bottom, left)
    before.style.clip = `rect(${nw.y}px, ${x}px, ${se.y}px, ${nw.x}px)`;
    after.style.clip = `rect(${nw.y}px, ${se.x}px, ${se.y}px, ${x}px)`;
  }, [map]);

  useEffect(() => {
    updateClip();
    map.on("move zoom zoomend viewreset resize", updateClip);
    return () => {
      map.off("move zoom zoomend viewreset resize", updateClip);
      const before = map.getPane(BEFORE_PANE);
      const after = map.getPane(AFTER_PANE);
      if (before) before.style.clip = "";
      if (after) after.style.clip = "";
    };
  }, [map, updateClip]);

  useEffect(() => {
    updateClip();
  }, [ratio, enabled, updateClip]);

  const commit = useCallback(
    (next) => {
      const clamped = Math.min(max, Math.max(min, next));
      if (value == null) setInternal(clamped);
      onChange?.(clamped);
    },
    [max, min, onChange, value],
  );

  const fromClientX = useCallback(
    (clientX) => {
      const box = map.getContainer().getBoundingClientRect();
      return (clientX - box.left) / box.width;
    },
    [map],
  );

  const onPointerDown = (e) => {
    dragging.current = true;
    handleRef.current?.setPointerCapture(e.pointerId);
    map.dragging.disable();
    e.preventDefault();
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    commit(fromClientX(e.clientX));
  };
  const endDrag = () => {
    if (!dragging.current) return;
    dragging.current = false;
    map.dragging.enable();
  };
  const onKeyDown = (e) => {
    const step = e.shiftKey ? 0.1 : 0.02;
    if (e.key === "ArrowLeft") {
      commit(ratio - step);
      e.preventDefault();
    }
    if (e.key === "ArrowRight") {
      commit(ratio + step);
      e.preventDefault();
    }
    if (e.key === "Home") {
      commit(min);
      e.preventDefault();
    }
    if (e.key === "End") {
      commit(max);
      e.preventDefault();
    }
  };

  if (!enabled) return null;

  return createPortal(
    <>
      <div className="dv-swipe-label left">{labels[0]}</div>
      <div className="dv-swipe-label right">{labels[1]}</div>
      <div
        ref={handleRef}
        className="dv-swipe-handle"
        style={{ left: `${ratio * 100}%` }}
        role="slider"
        tabIndex={0}
        aria-label="Before / after comparison"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(ratio * 100)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onKeyDown}
      />
    </>,
    map.getContainer(),
  );
}
