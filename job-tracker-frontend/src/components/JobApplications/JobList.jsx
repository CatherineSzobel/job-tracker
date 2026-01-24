import { useEffect, useState } from "react";
import API from "../../api/axios";
import JobCard from "./JobCard";

export default function JobList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    API.get("/job-applications").then(res => setJobs(res.data));
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
