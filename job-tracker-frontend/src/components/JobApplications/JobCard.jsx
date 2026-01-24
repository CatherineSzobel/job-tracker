import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InterviewsPanel from "../Interview/InterviewsPanel";
import API from "../../api/axios";

export default function JobCard({ job }) {
  if (!job) return null;

  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [interviews, setInterviews] = useState(job.interviews || []);
  const [localJob, setLocalJob] = useState(job);

  useEffect(() => {
    if (expanded) {
      API.get(`/job-applications/${job.id}`)
        .then(res => {
          setNotes(res.data.notes || []);
          setInterviews(res.data.interviews || []);
        })
        .catch(err => console.error(err));
    }
  }, [expanded, job.id]);

  return (
    <div
      className="
        relative
        bg-white
        border
        rounded-xl
        shadow-sm
        p-4
        transition-all
        duration-200
        hover:shadow-md
        hover:-translate-y-1
        text-sm
      "
    >

      <div className="absolute top-2 right-2 flex gap-2">

       
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-600 hover:text-blue-800 transition"
        >
          {expanded ? "Collapse" : "Expand"}
        </button>

        <button className="p-2 rounded-lg font-bold bg-blue-400 hover:bg-blue-500 text-white">
          Archive
        </button>
      </div>


      <div className="flex flex-col gap-1">

        <h2 className="font-semibold text-gray-800 truncate">
          <span
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="hover:underline cursor-pointer"
          >
            {job.position}
          </span>
        </h2>

        <div className="flex flex-col text-gray-500 gap-0.5">
          <select
            value={localJob.status}
            onChange={async (e) => {
              const newStatus = e.target.value;
              try {
                await API.put(`/job-applications/${localJob.id}`, { status: newStatus });
                setLocalJob(prev => ({ ...prev, status: newStatus })); 
              } catch (err) {
                console.error(err);
                alert("Failed to update status");
              }
            }}
            className="border rounded px-2 py-1 text-xs w-fit"
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>

          <span>Priority: <strong>{job.priority}</strong></span>
          <span>Applied: <strong>{job.applied_date}</strong></span>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 border-t pt-3">
          <InterviewsPanel jobId={job.id} initialInterviews={interviews} />
        </div>
      )}
    </div>
  );
}
