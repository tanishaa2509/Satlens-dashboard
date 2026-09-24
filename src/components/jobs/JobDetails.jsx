import React from "react";

export default function JobDetails({ job }) {
  return (
    <div
      style={{
        marginTop: "4px",
        paddingTop: "12px",
        borderTop: "1px solid var(--border-default)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "10px",
        fontSize: "0.85rem",
      }}
    >
      <div>
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          TARGET VILLAGE
        </span>
        <div
          style={{
            fontWeight: "500",
            color: "var(--text-primary)",
            marginTop: "2px",
          }}
        >
          {job.village || "N/A"}
        </div>
      </div>
      <div>
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          BASELINE SCENE (T1)
        </span>
        <div
          style={{
            fontWeight: "500",
            color: "var(--text-secondary)",
            marginTop: "2px",
          }}
        >
          {job.t1 || "N/A"}
        </div>
      </div>
      <div>
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          ANALYSIS SCENE (T2)
        </span>
        <div
          style={{
            fontWeight: "500",
            color: "var(--text-secondary)",
            marginTop: "2px",
          }}
        >
          {job.t2 || "N/A"}
        </div>
      </div>
      <div>
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          EXECUTION STATUS
        </span>
        <div style={{ fontWeight: "500", color: "#22c55e", marginTop: "2px" }}>
          {job.status} Task
        </div>
      </div>
    </div>
  );
}
