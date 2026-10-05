import { useEffect, useState } from "react";
import API from "../../api/axios";
import { DUE_DATE_SHORTCUTS, EMPTY_TODO_DRAFT } from "../../constants/todos";
import { isoDateFromToday } from "../../utils/dueDate";

const CHIP_CLASSES = "px-2 py-1 rounded-full text-xs bg-light-soft dark:bg-dark-subtle text-light-muted dark:text-dark-muted hover:text-accent transition-colors";

// Controlled by the parent (draft/onDraftChange) so quick-add buttons can prefill it.
// onAdd(payload) returns the saved to-do (or null); the form only clears on success.
// fixedApplicationId: always link to this application and hide the picker.
export default function TodoInput({ draft, onDraftChange, onAdd, fixedApplicationId = null }) {
  const [applications, setApplications] = useState([]);
  const [adding, setAdding] = useState(false);
  const pickApplication = !fixedApplicationId;

  // Active applications only (the index hides archived ones)
  useEffect(() => {
    if (!pickApplication) return;
    API.get("/job-applications")
      .then((res) => setApplications(res.data.data))
      .catch((err) => console.error(err));
  }, [pickApplication]);

  const change = (field, value) => onDraftChange({ ...draft, [field]: value });

  const submit = async (event) => {
    event.preventDefault();
    if (!draft.text.trim() || adding) return;

    setAdding(true);
    const saved = await onAdd({
      text: draft.text.trim(),
      due_date: draft.due_date || null,
      job_application_id: fixedApplicationId ?? (draft.job_application_id ? Number(draft.job_application_id) : null),
    });
    setAdding(false);
    if (saved) onDraftChange(EMPTY_TODO_DRAFT);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a new task..."
          value={draft.text}
          maxLength={255}
          onChange={(event) => change("text", event.target.value)}
          className="flex-1 min-w-0 border border-light-muted dark:border-dark-subtle rounded-lg px-3 py-2
            bg-light dark:bg-dark text-light-text dark:text-white
            focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
        />
        <button
          type="submit"
          disabled={!draft.text.trim() || adding}
          className="bg-accent hover:bg-accent-soft disabled:opacity-50 disabled:cursor-not-allowed
            text-surface px-4 py-2 rounded-lg transition-colors"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={draft.due_date}
          onChange={(event) => change("due_date", event.target.value)}
          aria-label="Due date"
          className="input-field w-auto py-1 text-sm"
        />
        {DUE_DATE_SHORTCUTS.map(({ label, days }) => (
          <button key={label} type="button" onClick={() => change("due_date", isoDateFromToday(days))} className={CHIP_CLASSES}>
            {label}
          </button>
        ))}
        {draft.due_date && (
          <button type="button" onClick={() => change("due_date", "")} className={CHIP_CLASSES}>
            No date
          </button>
        )}

        {/* A native select: typing a company name jumps to it */}
        {pickApplication && (
          <select
            value={draft.job_application_id}
            onChange={(event) => change("job_application_id", event.target.value)}
            aria-label="Linked application"
            className="input-field w-auto max-w-full py-1 text-sm"
          >
            <option value="">No application</option>
            {applications.map((job) => (
              <option key={job.id} value={job.id}>
                {job.company_name} · {job.position}
              </option>
            ))}
          </select>
        )}
      </div>
    </form>
  );
}
