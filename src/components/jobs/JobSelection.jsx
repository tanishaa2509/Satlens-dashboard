import React, { useState } from "react";
import { useScene } from "../../context/SceneContext";
import JobSearchBar from "./JobQueryBar";
import JobCard from "./JobCard";
import JobStats from "./JobStats";

export default function JobSelection() {
  const { jobs, inspectJob, deleteJob, selectedJob, resetToDefaultJobs } =
    useScene();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter jobs based on Job ID or Village name
  const filteredJobs = jobs.filter((job) => {
    const query = searchTerm.toLowerCase();
    return (
      job.id.toLowerCase().includes(query) ||
      (job.village && job.village.toLowerCase().includes(query))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Job Management & Selection
        </h2>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            margin: "4px 0 0 0",
          }}
        >
          Select a processing job to inspect results on the map and view change
          detection.
        </p>
      </div>

      {/* Job Statistics */}
      <JobStats jobs={jobs} />

      {/* */}
      <JobSearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        resetToDefaultJobs={resetToDefaultJobs}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isSelected={selectedJob?.id === job.id || selectedJob === job.id}
              onInspect={() => inspectJob(job)}
              onDelete={() => deleteJob(job.id)}
            />
          ))
        ) : (
          <div
            style={{
              padding: "24px",
              textAlign: "center",
              color: "var(--text-muted)",
              background: "var(--bg-surface)",
              borderRadius: "8px",
              border: "1px dashed var(--border-default)",
            }}
          >
            No jobs found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
