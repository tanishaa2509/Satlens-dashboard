import React from "react";

export default function JobAction({ isSelected, onInspect, onDelete }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <button
        onClick={onInspect}
        style={{
          background: isSelected ? "#22c55e" : "var(--bg-elevated)",
          color: isSelected ? "#000" : "var(--text-primary)",
          border: isSelected
            ? "1px solid #22c55e"
            : "1px solid var(--border-default)",
          padding: "6px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontWeight: "500",
        }}
      >
        {isSelected ? "Hide Details" : "View Details"}
      </button>

      <button
        onClick={onDelete}
        title="Delete Job"
        style={{
          background: "rgba(239, 68, 68, 0.1)",
          color: "#ef4444",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          padding: "6px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontWeight: "500",
        }}
      >
        Delete
      </button>
    </div>
  );
}
