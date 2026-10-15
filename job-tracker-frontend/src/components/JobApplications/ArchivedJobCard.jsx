import { Link } from "react-router-dom";
import { RotateCcw, Trash2 } from "lucide-react";
import API from "../../api/axios";
import { confirmAction } from "../../stores/useConfirmStore";
import { useToastStore } from "../../stores/useToastStore";
import { formatShortDate } from "../../utils/formatDate";
import CardTags from "../Tags/CardTags";
import StatusChip from "../UI/StatusChip";

// An archived application: position (link to its page), company and status, when it was applied for, tags,
// then Restore and a trash button to delete it for good. onRemove(id) is called after it's restored or deleted.
// In select mode (selecting) clicking the card calls onToggleSelect(id) and the actions are hidden.
// pendingChanges (useBatchChanges().forJob): this application's unsaved batch change to preview, or null.
export default function ArchivedJobCard({ job, onRemove, selecting = false, selected = false, onToggleSelect, pendingChanges = null }) {
    const showToast = useToastStore((state) => state.showToast);

    const restore = async () => {
        try {
            await API.put(`/job-applications/${job.id}`, { is_archived: false });
            onRemove?.(job.id);
        } catch (err) {
            console.error(err);
            showToast("Failed to restore job");
        }
    };

    const deleteForGood = async () => {
        const question = `Delete "${job.position}" at ${job.company_name} for good? Its interviews, to-dos and notes go too. This can't be undone.`;
        if (!(await confirmAction({ message: question, confirmLabel: "Delete", danger: true }))) return;
        try {
            await API.delete(`/job-applications/${job.id}`);
            onRemove?.(job.id);
        } catch (err) {
            console.error(err);
            showToast("Failed to delete job");
        }
    };

    return (
        <li
            onClick={selecting ? () => onToggleSelect(job.id) : undefined}
            className={`flex min-w-0 flex-col gap-3 rounded-2xl border bg-surface px-4 pt-5 pb-4 sm:px-6 ${
                selected ? "border-accent ring-1 ring-accent" : "border-line"
            } ${selecting ? "cursor-pointer" : ""}`}
        >
            <div className="flex items-start gap-3">
                {selecting && (
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggleSelect(job.id)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={`Select ${job.position} at ${job.company_name}`}
                        className="mt-1 size-5 shrink-0 cursor-pointer"
                    />
                )}
                <div className="flex min-w-0 flex-1 flex-col">
                    {selecting ? (
                        <strong className="text-lg/7 font-semibold break-words">{job.position}</strong>
                    ) : (
                        <Link to={`/jobs/${job.id}`} className="text-lg/7 font-semibold break-words text-ink hover:underline">
                            {job.position}
                        </Link>
                    )}
                    <span className="text-muted">{job.company_name}</span>
                </div>
                <StatusChip status={job.status} />
            </div>

            {job.applied_date && <p className="text-sm text-muted">Applied {formatShortDate(job.applied_date)}</p>}

            <CardTags
                tags={job.tags}
                addedTags={pendingChanges?.tagsToAdd}
                removedTagIds={pendingChanges?.tagsToRemove.map((tag) => tag.id)}
            />

            {pendingChanges && <p className="text-sm font-semibold text-accent-text">Not saved yet</p>}

            {!selecting && (
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-subtle pt-3">
                    <button type="button" onClick={restore} className="btn-soft">
                        <RotateCcw size={16} aria-hidden="true" />
                        Restore
                    </button>
                    <button
                        type="button"
                        onClick={deleteForGood}
                        aria-label={`Delete ${job.position} at ${job.company_name} for good`}
                        title="Delete for good"
                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-danger transition-colors hover:bg-rejected-bg"
                    >
                        <Trash2 size={18} aria-hidden="true" />
                    </button>
                </div>
            )}
        </li>
    );
}
