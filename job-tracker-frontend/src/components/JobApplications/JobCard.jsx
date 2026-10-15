import { Link } from "react-router-dom";
import { Archive, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import API from "../../api/axios";
import { useToastStore } from "../../stores/useToastStore";
import { formatShortDate } from "../../utils/formatDate";
import CardTags from "../Tags/CardTags";
import PriorityLabel from "../UI/PriorityLabel";
import StatusChip from "../UI/StatusChip";
import useArchiveWithTodos, { archiveChanges } from "./useArchiveWithTodos";

// One application in the grid: status and priority, the position (link to the detail page) and company,
// when and where, tags, then "View posting" and Archive. Delete lives on the detail page.
// onRemove(id) is called after the job is archived so the parent can drop it.
// In select mode (selecting) clicking the card calls onToggleSelect(id) and the footer actions are hidden.
// pendingChanges (useBatchChanges().forJob): this application's unsaved batch change to preview, or null.
export default function JobCard({ job, onRemove, selecting = false, selected = false, onToggleSelect, pendingChanges = null }) {
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

  return (
    <li
      onClick={selecting ? () => onToggleSelect(job.id) : undefined}
      className={`flex min-w-0 flex-col gap-3 rounded-2xl border bg-surface px-4 pt-5 pb-4 sm:px-6 ${
        selected ? "border-accent ring-1 ring-accent" : "border-line"
      } ${selecting ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-2">
        {selecting && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(job.id)}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Select ${job.position} at ${job.company_name}`}
            className="size-5 shrink-0 cursor-pointer"
          />
        )}
        <span
          title={newStatus ? `Not saved yet (now ${job.status})` : undefined}
          className={newStatus ? "rounded-full outline-2 outline-offset-2 outline-accent-text outline-dashed" : undefined}
        >
          <StatusChip status={shownStatus} />
        </span>
        <span className="ml-auto">
          <PriorityLabel priority={job.priority} />
        </span>
      </div>

      <div className="flex min-w-0 flex-col">
        {selecting ? (
          <span className="text-lg/7 font-semibold break-words">{job.position}</span>
        ) : (
          <Link to={`/jobs/${job.id}`} className="text-lg/7 font-semibold break-words text-ink hover:underline">
            {job.position}
          </Link>
        )}
        <span className="text-muted">{job.company_name}</span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        {job.applied_date && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={16} aria-hidden="true" />
            Applied {formatShortDate(job.applied_date)}
          </span>
        )}
        {job.location && (
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={16} aria-hidden="true" />
            {job.location}
          </span>
        )}
      </div>

      <CardTags
        tags={job.tags}
        addedTags={pendingChanges?.tagsToAdd}
        removedTagIds={pendingChanges?.tagsToRemove.map((tag) => tag.id)}
      />

      {pendingChanges && <p className="text-sm font-semibold text-accent-text">Not saved yet</p>}

      {!selecting && (
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-subtle pt-3">
          {job.job_link ? (
            <a
              href={job.job_link}
              target="_blank"
              rel="noopener noreferrer"
              title={job.job_link}
              className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-accent-text hover:underline"
            >
              View posting
              <ExternalLink size={14} strokeWidth={2.5} aria-hidden="true" />
            </a>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => requestArchive({ openTodosCount: job.open_todos_count ?? 0 })}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-muted transition-colors hover:bg-soft hover:text-ink"
          >
            <Archive size={16} aria-hidden="true" />
            Archive
          </button>
        </div>
      )}

      {archivePrompt}
    </li>
  );
}
