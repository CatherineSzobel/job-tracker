import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useToastStore } from "../../stores/useToastStore";
import CardTags from "../Tags/CardTags";

// In select mode (selecting) clicking the card calls onToggleSelect(id) and Restore is replaced by a checkbox.
// pendingChanges (useBatchChanges, only for a selected card): unsaved tag changes to preview on the card.
export default function ArchivedJobCard({ job, onRestore, selecting = false, selected = false, onToggleSelect, pendingChanges = null }) {
    const navigate = useNavigate();
    const showToast = useToastStore((state) => state.showToast);

    const handleRestore = async () => {
        try {
            await API.put(`/job-applications/${job.id}`, { is_archived: false });
            onRestore?.(job.id);
        } catch (err) {
            console.error(err);
            showToast("Failed to restore job");
        }
    };

    return (
        <div
            onClick={selecting ? () => onToggleSelect(job.id) : undefined}
            className={`relative bg-light dark:bg-dark-soft rounded-xl p-4 shadow-sm hover:shadow-md transition-all ${selecting ? "cursor-pointer" : ""} ${selected ? "ring-2 ring-accent" : ""}`}
        >
            <div className="flex justify-between items-start mb-2">
                <h2
                    onClick={selecting ? undefined : () => navigate(`/jobs/${job.id}`)}
                    className={`font-semibold text-light-text dark:text-dark-text truncate max-w-[70%] ${selecting ? "" : "hover:underline cursor-pointer"}`}
                >
                    {job.position}
                </h2>
                {selecting ? (
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(job.id)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Select ${job.position} at ${job.company_name}`}
                        className="h-5 w-5 cursor-pointer accent-accent"
                    />
                ) : (
                    <button
                        onClick={handleRestore}
                        className="p-2 rounded-lg font-bold bg-green-700 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white text-xs transition-colors"
                    >
                        Restore
                    </button>
                )}
            </div>

            <div className="flex flex-col text-light-muted dark:text-dark-muted gap-0.5 text-xs">
                <span>
                    Company: <strong className="text-light-text dark:text-dark-text">{job.company_name}</strong>
                </span>
                <span>
                    Location: <strong className="text-light-text dark:text-dark-text">{job.location}</strong>
                </span>
                <span>
                    Applied: <strong className="text-light-text dark:text-dark-text">{job.applied_date}</strong>
                </span>
                <span>
                    Priority: <strong className="text-light-text dark:text-dark-text">{job.priority}</strong>
                </span>
                {job.job_link && (
                    <span>
                        Job Link:{" "}
                        <a
                            href={job.job_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            // In select mode a click only selects the card
                            onClick={selecting ? (event) => event.preventDefault() : undefined}
                            className="text-accent dark:text-accent-muted hover:underline"
                        >
                            {job.job_link}
                        </a>
                    </span>
                )}
            </div>

            <CardTags
                tags={job.tags}
                addedTags={pendingChanges?.tagsToAdd}
                removedTagIds={pendingChanges?.tagsToRemove.map((tag) => tag.id)}
            />

            {pendingChanges?.hasChanges && (
                <p className="mt-1 text-xs italic text-accent dark:text-accent-muted">Not saved yet</p>
            )}
        </div>
    );
}
