import React, { useState } from "react";
import { useScene } from "../../context/SceneContext";
import { useAuth } from "../../context/AuthContext";
import JobSearchBar from "./JobQueryBar";
import JobCard from "./JobCard";
import JobStats from "./JobStats";

export default function JobSelection() {
  const { jobs, inspectJob, deleteJob, selectedJob, resetToDefaultJobs } =
    useScene();

  const { isLoggedIn } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");

  // Show login message if user is not logged in
  if (!isLoggedIn) {
    return (
      <div
        style={{
          padding: "40px 24px",
          textAlign: "center",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "8px",
          color: "var(--text-primary)",
        }}
      >
        <div
          style={{
            fontSize: "2rem",
            marginBottom: "12px",
          }}
        >
          🔐
        </div>

        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            margin: "0 0 8px 0",
            color: "var(--text-primary)",
          }}
        >
          You need to login first.
        </h2>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          Please login from the top bar to access Job Selection.
        </p>
      </div>
    );
  }

  // Filter jobs based on Job ID or Village name
  const filteredJobs = jobs.filter((job) => {
    const query = searchTerm.toLowerCase();

    return (
      job.id.toLowerCase().includes(query) ||
      (job.village && job.village.toLowerCase().includes(query))
    );
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
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

      {/* Job Search */}
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
              // Pointer-based architecture: passing only lightweight job.id
              onInspect={() => inspectJob(job.id)}
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
