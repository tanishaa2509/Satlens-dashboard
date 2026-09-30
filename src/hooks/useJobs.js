import { useState, useEffect, useCallback } from "react";
import { fetchJobs } from "../services/jobService";

export function useJobs() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);

  // Load initial jobs from localStorage using standardized key
  useEffect(() => {
    async function loadJobs() {
      try {
        const savedJobs = localStorage.getItem("satlens_jobs");
        if (savedJobs) {
          setJobs(JSON.parse(savedJobs));
        } else {
          const initialJobs = await fetchJobs();
          setJobs(initialJobs);
          localStorage.setItem("satlens_jobs", JSON.stringify(initialJobs));
        }
      } catch (error) {
        console.error("Failed to load jobs from localStorage:", error);
        const initialJobs = await fetchJobs();
        setJobs(initialJobs);
      }
    }

    loadJobs();
  }, []);

  // Sync state changes to localStorage under satlens_jobs
  useEffect(() => {
    if (jobs.length > 0) {
      try {
        localStorage.setItem("satlens_jobs", JSON.stringify(jobs));
      } catch (error) {
        console.error("Failed to save jobs to localStorage", error);
      }
    }
  }, [jobs]);

  const inspectJob = useCallback((job) => {
    setSelectedJob((prev) => (prev?.id === job?.id ? null : job));
  }, []);

  const deleteJob = useCallback((jobId, e) => {
    if (e) e.stopPropagation();
    setJobs((prevJobs) => {
      const updated = prevJobs.filter((job) => job.id !== jobId);
      localStorage.setItem("satlens_jobs", JSON.stringify(updated));
      return updated;
    });
    setSelectedJob((prev) => (prev?.id === jobId ? null : prev));
  }, []);

  const resetToDefaultJobs = useCallback(async () => {
    try {
      const defaultJobs = await fetchJobs();
      setJobs(defaultJobs);
      localStorage.setItem("satlens_jobs", JSON.stringify(defaultJobs));
      setSelectedJob(null);
    } catch (error) {
      console.error("Failed to reset to default jobs:", error);
    }
  }, []);

  return {
    jobs,
    setJobs,
    selectedJob,
    inspectJob,
    deleteJob,
    resetToDefaultJobs,
  };
}
