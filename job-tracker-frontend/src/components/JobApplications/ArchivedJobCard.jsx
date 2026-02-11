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
        <div className="relative bg-white dark:bg-dark-soft rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
                <h2
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="font-semibold text-gray-800 dark:text-dark-text hover:underline cursor-pointer truncate max-w-[70%]"
                >
                    {job.position}
                </h2>
                <button
                    onClick={handleRestore}
                    className="p-2 rounded-lg font-bold bg-green-700 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white text-xs transition-colors"
                >
                    Restore
                </button>
            </div>

            <div className="flex flex-col text-gray-600 dark:text-dark-muted gap-0.5 text-xs">
                <span>
                    Company: <strong className="text-gray-800 dark:text-dark-text">{job.company_name}</strong>
                </span>
                <span>
                    Location: <strong className="text-gray-800 dark:text-dark-text">{job.location}</strong>
                </span>
                <span>
                    Applied: <strong className="text-gray-800 dark:text-dark-text">{job.applied_date}</strong>
                </span>
                <span>
                    Priority: <strong className="text-gray-800 dark:text-dark-text">{job.priority}</strong>
                </span>
                <span>
                    Job Link:{" "}
                    <a
                        href={job.job_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 dark:text-accent hover:underline"
                    >
                        {job.job_link}
                    </a>
                </span>
            </div>
        </div>
    );
}
