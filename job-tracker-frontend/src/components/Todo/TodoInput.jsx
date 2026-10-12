import { useEffect, useId, useState } from "react";
import API from "../../api/axios";
import { DUE_DATE_SHORTCUTS, EMPTY_TODO_DRAFT } from "../../constants/todos";
import { isoDateFromToday } from "../../utils/dueDate";

// The 32px date shortcut chips ("Today", "Tomorrow", "Next week"); the chosen one is filled
const shortcutClasses = (isChosen) =>
  `inline-flex h-8 items-center rounded-full border px-3 text-sm font-semibold transition-colors ${
    isChosen ? "border-accent bg-accent text-white" : "border-line bg-soft text-ink hover:bg-subtle"
  }`;

// Controlled by the parent (draft/onDraftChange) so quick-add buttons can prefill it.
// onAdd(payload) returns the saved to-do (or null); the form only clears on success.
// fixedApplicationId: always link to this application and hide the picker. label: the text field's label.
export default function TodoInput({ draft, onDraftChange, onAdd, fixedApplicationId = null, label = "New to-do" }) {
  const [applications, setApplications] = useState([]);
  const [adding, setAdding] = useState(false);
  const pickApplication = !fixedApplicationId;
  const id = useId();

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
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label htmlFor={`${id}-text`} className="input-label">
          {label}
        </label>
        <div className="flex gap-2">
          <input
            id={`${id}-text`}
            type="text"
            placeholder="e.g. Email the recruiter about next steps"
            value={draft.text}
            maxLength={255}
            onChange={(event) => change("text", event.target.value)}
            className="input-field min-w-0 flex-1"
          />
          <button type="submit" disabled={!draft.text.trim() || adding} className="btn-primary px-5">
            Add
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex min-w-0 flex-[1_1_240px] flex-col">
          <label htmlFor={`${id}-due`} className="input-label">
            Due date
          </label>
          <input
            id={`${id}-due`}
            type="date"
            value={draft.due_date}
            onChange={(event) => change("due_date", event.target.value)}
            className="input-field"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {DUE_DATE_SHORTCUTS.map(({ label: shortcutLabel, days }) => {
              const date = isoDateFromToday(days);
              return (
                <button
                  key={shortcutLabel}
                  type="button"
                  aria-pressed={draft.due_date === date}
                  onClick={() => change("due_date", date)}
                  className={shortcutClasses(draft.due_date === date)}
                >
                  {shortcutLabel}
                </button>
              );
            })}
            {draft.due_date && (
              <button type="button" onClick={() => change("due_date", "")} className={shortcutClasses(false)}>
                No date
              </button>
            )}
          </div>
        </div>

        {/* A native select: typing a company name jumps to it */}
        {pickApplication && (
          <div className="flex min-w-0 flex-[1_1_240px] flex-col">
            <label htmlFor={`${id}-application`} className="input-label">
              Application <span className="font-normal text-muted">(optional)</span>
            </label>
            <select
              id={`${id}-application`}
              value={draft.job_application_id}
              onChange={(event) => change("job_application_id", event.target.value)}
              className="input-field"
            >
              <option value="">No application</option>
              {applications.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.company_name} · {job.position}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </form>
  );
}
