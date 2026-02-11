import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InterviewsPanel from "../Interview/InterviewsPanel";
import API from "../../api/axios";

export default function JobCard({ job, onArchive }) {
  if (!job) return null;

  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [interviews, setInterviews] = useState(job.interviews || []);
  const [localJob, setLocalJob] = useState(job);

  useEffect(() => {
    if (expanded) {
      API.get(`/job-applications/${job.id}`)
        .then(res => setInterviews(res.data.interviews || []))
        .catch(err => console.error(err));
    }
  }, [expanded, job.id]);

  const handleArchive = async () => {
    try {
      const res = await API.put(`/job-applications/${localJob.id}`, { is_archived: true });
      setLocalJob(res.data.data || res.data);
      if (onArchive) onArchive(localJob.id);
    } catch (err) {
      console.error(err);
      alert("Failed to archive job");
    }
  };

  const deleteJob = async () => {
    if (!window.confirm("Delete this job application?")) return;

    try {
      await API.delete(`/job-applications/${localJob.id}`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete job");
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      await API.put(`/job-applications/${localJob.id}`, { status: newStatus });
      setLocalJob(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="relative bg-white dark:bg-dark-soft rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-600 dark:text-accent hover:text-blue-800 dark:hover:text-accent-soft transition"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>
        <button
          onClick={handleArchive}
          className="px-3 py-1 text-xs bg-blue-100 dark:bg-accent-soft hover:bg-blue-200 dark:hover:bg-accent text-blue-800 dark:text-surface rounded transition-colors"
        >
          Archive
        </button>
      </div>

      <h2
        onClick={() => navigate(`/jobs/${job.id}`)}
        className="font-semibold text-gray-800 dark:text-dark-text truncate cursor-pointer hover:underline mb-2"
      >
        {job.position} - {job.company_name}
      </h2>

      <div className="flex flex-col gap-1 text-xs text-gray-600 dark:text-dark-muted">
        <div className="flex flex-wrap items-center gap-2">
          <span>Status:</span>
          <select
            value={localJob.status}
            onChange={e => updateStatus(e.target.value)}
            className="px-2 py-1 rounded bg-white dark:bg-dark-soft text-gray-800 dark:text-dark-text focus:ring-1 focus:ring-accent transition-colors"
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <span><strong>Location:</strong> {job.location}</span>
        <span>
          <strong>Application Link:</strong>{" "}
          <a
            href={job.job_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 dark:text-accent hover:underline"
          >
            {job.job_link}
          </a>
        </span>
        <span><strong>Applied:</strong> {job.applied_date}</span>
        <span><strong>Priority:</strong> {job.priority}</span>
        {job.notes && <span><strong>Notes:</strong> {job.notes}</span>}
      </div>

      {expanded && (
        <div className="mt-3 pt-3 flex flex-col gap-2 border-t border-gray-200 dark:border-dark-subtle transition-colors">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="px-3 py-1 text-xs bg-blue-100 dark:bg-accent hover:bg-blue-200 dark:hover:bg-accent-soft text-blue-800 dark:text-surface rounded transition-colors"
            >
              View Job
            </button>
            <button
              onClick={deleteJob}
              className="px-3 py-1 text-xs bg-red-100 dark:bg-red-400 hover:bg-red-200 dark:hover:bg-red-300 text-red-700 dark:text-dark-text rounded transition-colors"
            >
              Delete
            </button>
          </div>

          <InterviewsPanel jobId={job.id} initialInterviews={interviews} />
        </div>
      )}
    </div>
  );
}
