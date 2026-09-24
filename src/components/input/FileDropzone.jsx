import { useState, useCallback, useRef, useEffect } from "react";
import { useScene } from "../../context/SceneContext";

const ACCEPTED = ".tif,.tiff,.png,.jpg,.jpeg";
const ACCEPTED_SET = new Set(["tif", "tiff", "png", "jpg", "jpeg"]);

function validateFile(file) {
  if (!file) return false;
  const ext = file.name.split(".").pop().toLowerCase();
  return ACCEPTED_SET.has(ext);
}

function SingleDropzone({ label, sublabel, file, onFile, onClear, inputId }) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const f = e.dataTransfer.files[0];
        if (validateFile(f)) onFile(f);
      }
    },
    [onFile],
  );

  const handleChange = useCallback(
    (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const f = e.target.files[0];
        if (validateFile(f)) onFile(f);
      }
    },
    [onFile],
  );

  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      if (inputRef.current) inputRef.current.value = "";
      onClear();
    },
    [onClear],
  );

  return (
    <div className="dropzone-slot" style={{ flex: 1, minWidth: 0 }}>
      <div className="scene-panel__label">
        <span>{label === "Before Image (T1)" ? "⏪" : "⏩"}</span>
        <span>{label}</span>
      </div>
      <p className="scene-panel__sublabel">{sublabel}</p>

      {file && preview ? (
        <div
          className="dropzone-preview"
          style={{
            position: "relative",
            padding: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            background: "rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <button
            type="button"
            className="dropzone-preview__clear"
            onClick={handleClear}
            title="Remove image"
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(0, 0, 0, 0.7)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              zIndex: 10,
              boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            ×
          </button>
          <img
            src={preview}
            alt={file.name}
            className="dropzone-preview__img"
            style={{
              width: "100%",
              height: "200px",
              objectFit: "contain",
              borderRadius: "4px",
              background: "rgba(0,0,0,0.3)",
            }}
          />
          <div
            className="dropzone-preview__name"
            title={file.name}
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.8)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <span className="file-badge__icon">✅</span>
            {file.name}
          </div>
        </div>
      ) : (
        <div
          className={`dropzone ${dragActive ? "dropzone--active" : ""}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <span className="dropzone__icon">📁</span>
          <span className="dropzone__text">
            Drop file here or click to upload
          </span>
          <span className="dropzone__hint">
            Supports .tif, .tiff, .png, .jpg
          </span>

          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            style={{ display: "none" }}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
}

export default function FileDropzone() {
  const { inputMode, setUploadedFiles } = useScene();
  const [t1File, setT1File] = useState(null);
  const [t2File, setT2File] = useState(null);

  // Keep shared context in sync
  useEffect(() => {
    const names = [];
    if (t1File) names.push(t1File.name);
    if (t2File) names.push(t2File.name);
    setUploadedFiles(names);
  }, [t1File, t2File, setUploadedFiles]);

  if (inputMode !== "upload") return null;

  return (
    <div className="section" id="file-dropzone">
      <div className="section__header">
        <span className="section__icon">📤</span>
        <h2 className="section__title">Upload Images</h2>
      </div>

      <p className="section__subtitle">
        Upload Before and After images directly
      </p>

      <div
        className="dropzone-grid"
        style={{ display: "flex", flexDirection: "row", gap: "16px" }}
      >
        <SingleDropzone
          label="Before Image (T1)"
          sublabel="Pre-change image"
          file={t1File}
          onFile={setT1File}
          onClear={() => setT1File(null)}
          inputId="file-upload-t1"
        />
        <SingleDropzone
          label="After Image (T2)"
          sublabel="Post-change image"
          file={t2File}
          onFile={setT2File}
          onClear={() => setT2File(null)}
          inputId="file-upload-t2"
        />
      </div>
    </div>
  );
}
