import React from "react";
import JobStatusBadge from "./JobStatusBadge";
import JobActions from "./JobActions";
import JobDetails from "./JobDetails";

export default function JobCard({ job, isSelected, onInspect, onDelete }) {
  return (
    <div
      style={{
        background: isSelected
          ? "rgba(34, 197, 94, 0.05)"
          : "var(--bg-surface)",
        border: isSelected
          ? "1px solid #22c55e"
          : "1px solid var(--border-default)",
        padding: "16px",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Main Top Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontWeight: "600",
                fontSize: "0.95rem",
                color: "var(--text-primary)",
              }}
            >
              Job ID: {job.id}
            </span>
            <JobStatusBadge status={job.status} />
            {isSelected && (
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#22c55e",
                  fontWeight: "600",
                }}
              >
                ● Active Inspection
              </span>
            )}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Village: {job.village || "AOI Area"} | T1: {job.t1 || "N/A"} → T2:{" "}
            {job.t2 || "N/A"}
          </span>
        </div>

        <JobActions
          isSelected={isSelected}
          onInspect={onInspect}
          onDelete={onDelete}
        />
      </div>

      {/* Expanded Details Section */}
      {isSelected && <JobDetails job={job} />}
    </div>
  );
}
