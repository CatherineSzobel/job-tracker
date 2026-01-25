import React from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function ArchivedJobCard({ job, onRestore }) {
    const navigate = useNavigate();

    const handleRestore = async () => {
        try {
            await API.put(`/job-applications/${job.id}`, { is_archived: false });
            if (onRestore) onRestore(job.id);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative bg-gray-50 border border-gray-300 rounded-xl p-4 shadow-sm text-sm transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-2">
                <h2 onClick={() => navigate(`/jobs/${job.id}`)}
                    className="font-semibold text-gray-700 hover:underline cursor-pointer truncate max-w-[70%]">
                    {job.position}
                </h2>
                <button onClick={handleRestore}
                    className="p-2 rounded-lg font-bold bg-green-500 hover:bg-green-600 text-white text-xs">
                    Restore
                </button>
            </div>

            <div className="flex flex-col text-gray-500 gap-0.5 text-xs">
                <span>
                    Company: <strong>{job.company_name}</strong>
                </span>
                <span>
                    Location: <strong>{job.location}</strong>
                </span>
                <span>
                    Applied: <strong>{job.applied_date}</strong>
                </span>
                <span>
                    Priority: <strong>{job.priority}</strong>
                </span>
                <span>
                    Job Link:{" "}
                    <a href={job.job_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:underline">
                        {job.job_link}
                    </a>
                </span>
            </div>
        </div>
    );
}
