import React from "react";

export default function JobSearchBar({
  searchTerm,
  setSearchTerm,
  resetToDefaultJobs,
}) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <input
        type="text"
        placeholder="Search by Job ID or Village..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
          padding: "10px 14px",
          borderRadius: "6px",
          fontSize: "0.85rem",
          outline: "none",
          flex: 1,
        }}
      />
      <button
        onClick={resetToDefaultJobs}
        title="Reset jobs to default mock data"
        style={{
          background: "var(--bg-elevated)",
          color: "var(--text-muted)",
          border: "1px solid var(--border-default)",
          padding: "10px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.8rem",
          fontWeight: "550",
          whiteSpace: "nowrap",
        }}
      >
        Reset Defaults
      </button>
    </div>
  );
}
