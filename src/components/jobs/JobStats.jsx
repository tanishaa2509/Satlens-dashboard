import React from "react";

/**
 * JobStats — Compact statistics cards for job counts.
 * Renders 3 cards: Total Jobs, Pending, Submitted.
 * Receives the existing `jobs` array via props — no duplicate state.
 */
export default function JobStats({ jobs }) {
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter((job) => job.status === "Pending").length;
  const submittedJobs = jobs.filter((job) => job.status === "Submitted").length;

  const cards = [
    { label: "Total Jobs", value: totalJobs, icon: "📋" },
    { label: "Pending", value: pendingJobs, icon: "⏳" },
    { label: "Submitted", value: submittedJobs, icon: "✅" },
  ];

  return (
    <div style={containerStyle}>
      {cards.map((card) => (
        <div key={card.label} style={cardStyle}>
          <span style={iconStyle}>{card.icon}</span>
          <span style={labelStyle}>{card.label}</span>
          <span style={valueStyle}>{card.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Inline styles using existing CSS variables ── */

const containerStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const cardStyle = {
  flex: "1 1 0",
  minWidth: "100px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "4px",
  padding: "12px 8px",
  background: "var(--bg-surface)",
  border: "1px solid var(--border-default)",
  borderRadius: "8px",
  transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
};

const iconStyle = {
  fontSize: "1.15rem",
  lineHeight: 1,
};

const labelStyle = {
  fontSize: "0.75rem",
  fontWeight: "500",
  color: "var(--text-muted)",
  letterSpacing: "0.02em",
};

const valueStyle = {
  fontSize: "1.35rem",
  fontWeight: "700",
  color: "var(--text-primary)",
  lineHeight: 1,
};
