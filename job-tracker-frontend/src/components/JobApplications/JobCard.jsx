import { useNavigate } from "react-router-dom";
import { confirmAction } from "../../stores/useConfirmStore";
import API from "../../api/axios";
import { PRIORITY_CLASSES, STATUS_COLORS } from "../../constants/jobs";
import { useToastStore } from "../../stores/useToastStore";
import CardTags from "../Tags/CardTags";
import useArchiveWithTodos, { archiveChanges } from "./useArchiveWithTodos";

// onRemove(id) is called after the job is archived or deleted so the parent can drop it.
// In select mode (selecting) clicking the card calls onToggleSelect(id) and the action buttons are hidden.
// pendingChanges (useBatchChanges, only for a selected card): unsaved batch changes to preview on the card.
export default function JobCard({ job, onRemove, selecting = false, selected = false, onToggleSelect, pendingChanges = null }) {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const newStatus = pendingChanges?.status && pendingChanges.status !== job.status ? pendingChanges.status : null;
  const shownStatus = newStatus ?? job.status;

  // deleteOpenTodos: the user's answer, or undefined to let the server follow their setting
  const archive = async (deleteOpenTodos) => {
    try {
      await API.put(`/job-applications/${job.id}`, archiveChanges(deleteOpenTodos));
      onRemove?.(job.id);
    } catch (err) {
      console.error(err);
      showToast("Failed to archive job");
    }
  };

  const { requestArchive, prompt: archivePrompt } = useArchiveWithTodos(archive);

  const deleteJob = async () => {
    if (!(await confirmAction({ message: "Delete this job application?", confirmLabel: "Delete", danger: true }))) return;
    try {
      await API.delete(`/job-applications/${job.id}`);
      onRemove?.(job.id);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete job");
    }
  };

  return (
    <div
      onClick={selecting ? () => onToggleSelect(job.id) : undefined}
      className={`
      relative flex flex-col justify-between h-full
      bg-surface dark:bg-dark-soft border border-border dark:border-dark-subtle
      rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300
      ${selecting ? "cursor-pointer" : ""} ${selected ? "ring-2 ring-accent" : ""}
    `}
    >
      {/* Top right: Archive, or the select checkbox in select mode */}
      <div className="absolute top-3 right-3">
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
            onClick={() => requestArchive({ openTodosCount: job.open_todos_count ?? 0 })}
            className="px-3 py-1 text-xs bg-blue-100 dark:bg-accent-soft hover:bg-blue-200 dark:hover:bg-accent text-blue-800 dark:text-surface rounded transition-colors"
          >
            Archive
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h2
          onClick={selecting ? undefined : () => navigate(`/jobs/${job.id}`)}
          className={`text-lg font-semibold line-clamp-2 pr-20 text-light-text dark:text-dark-text transition-colors ${selecting ? "" : "cursor-pointer hover:text-accent"}`}
        >
          {job.position}
        </h2>
        <p className="text-sm text-muted dark:text-dark-muted">{job.company_name}</p>

        <div className="flex gap-2 mt-2">
          <span
            title={newStatus ? `Not saved yet (now ${job.status})` : undefined}
            className={`px-2 py-1 text-xs rounded-full text-white truncate ${newStatus ? "outline-2 outline-dashed outline-offset-2 outline-accent" : ""}`}
            style={{ backgroundColor: STATUS_COLORS[shownStatus] }}
          >
            {shownStatus}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full truncate ${PRIORITY_CLASSES[job.priority]}`}>
            {job.priority}
          </span>
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

      <div className="mt-4 flex flex-col gap-2 text-sm text-muted dark:text-dark-muted">
        <span><strong>Applied:</strong> {job.applied_date}</span>
        <span><strong>Location:</strong> {job.location}</span>
        {job.job_link && (
          <span className="flex items-center gap-1">
            <strong>Application:</strong>
            <a
              href={job.job_link}
              target="_blank"
              rel="noopener noreferrer"
              // In select mode a click only selects the card
              onClick={selecting ? (event) => event.preventDefault() : undefined}
              className="text-accent dark:text-accent hover:underline font-medium truncate"
              title={job.job_link}
            >
              View Posting →
            </a>
          </span>
        )}
        <span>
          <strong>Notes:</strong>{" "}
          {job.notes ? job.notes : <span className="text-light-muted dark:text-dark-muted">—</span>}
        </span>
      </div>

      {!selecting && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="px-3 py-1 text-xs bg-blue-100 dark:bg-accent hover:bg-blue-200 dark:hover:bg-accent-soft text-blue-800 dark:text-surface rounded transition-colors flex-1"
          >
            View Job
          </button>
          <button
            onClick={deleteJob}
            className="px-3 py-1 text-xs bg-red-100 dark:bg-red-400 hover:bg-red-200 dark:hover:bg-red-300 text-red-700 dark:text-dark-text rounded transition-colors flex-1"
          >
            Delete
          </button>
        </div>
      )}

      {archivePrompt}
    </div>
  );
}
