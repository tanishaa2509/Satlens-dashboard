export async function fetchJobs() {
  try {
    const response = await fetch("/jobs.json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return [];
  }
}

export function fetchJobById(jobId) {
  try {
    const savedJobs = localStorage.getItem("encroachment_jobs");

    if (!savedJobs) {
      return null;
    }

    const jobs = JSON.parse(savedJobs);

    const job = jobs.find(
      (job) => String(job.id) === String(jobId)
    );

    return job || null;
  } catch (error) {
    console.error("Failed to fetch job by ID:", error);
    return null;
  }
}