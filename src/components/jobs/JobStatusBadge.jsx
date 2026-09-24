import React from "react";

export default function JobstatusBadge({ status }) {
  const isSubmitted = status === "Submitted";
  return (
    <span
      style={{
        fontSize: "0.75rem",
        padding: "3px 8px",
        borderRadius: "4px",
        fontWeight: "600",
        background: isSubmitted
          ? "rgba(34, 197, 94, 0.15)"
          : "rgba(234, 179, 8, 0.15)",
        color: isSubmitted ? "#22c55e" : "#eab308",
      }}
    >
      {status}
    </span>
  );
}
