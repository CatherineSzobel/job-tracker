import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import DueChip from "../Todo/DueChip";
import useReminders from "./useReminders";

const SMALL_BUTTON_CLASSES = "px-2 py-1 text-xs rounded-lg border border-light-muted dark:border-dark-subtle text-light-text dark:text-dark-text hover:bg-light dark:hover:bg-dark-subtle transition-colors";
const ROW_CLASSES = "flex flex-wrap items-center gap-2 py-2 border-b last:border-b-0 border-border dark:border-dark-subtle";
const HEADING_CLASSES = "text-sm font-semibold uppercase tracking-wide mb-1 text-light-muted dark:text-dark-muted";

// What Dismiss will do, shown as its tooltip
const DISMISS_HINTS = {
  today: "Hide until tomorrow",
  permanent: "Hide until you update this application",
};

// Applications to follow up and to-dos that are due. Renders nothing while loading or when there's
// nothing to show (which includes reminders being off), so the dashboard looks the same as before.
// onTodosChanged(): a to-do was marked done or moved, so other to-do lists on the page should reload.
export default function Reminders({ onTodosChanged }) {
  const { applications, todos, loading, dismissMode, dismiss, markTodoDone, postponeTodo } = useReminders(onTodosChanged);

  if (loading || (applications.length === 0 && todos.length === 0)) return null;

  return (
    <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 transition-shadow hover:shadow-xl">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-light-text dark:text-white">
        <Bell size={18} aria-hidden="true" />
        Reminders
      </h2>

      {applications.length > 0 && (
        <section className="mb-4 last:mb-0">
          <h3 className={HEADING_CLASSES}>Time to follow up</h3>
          <ul>
            {applications.map((job) => (
              <li key={job.id} className={ROW_CLASSES}>
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${job.id}`} className="font-medium text-accent dark:text-accent-muted hover:underline">
                    {job.company_name}
                  </Link>
                  <span className="text-sm text-light-muted dark:text-dark-muted"> · {job.position}</span>
                  <p className="text-xs text-light-muted dark:text-dark-muted">No update for {job.days_since_update} days</p>
                </div>
                <button type="button" onClick={() => dismiss(job)} title={DISMISS_HINTS[dismissMode]} className={SMALL_BUTTON_CLASSES}>
                  Dismiss
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {todos.length > 0 && (
        <section>
          <h3 className={HEADING_CLASSES}>To-dos due</h3>
          <ul>
            {todos.map((todo) => (
              <li key={todo.id} className={ROW_CLASSES}>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-light-text dark:text-dark-text break-words">{todo.text}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <DueChip dueDate={todo.due_date} />
                    {todo.job_application && (
                      <Link to={`/jobs/${todo.job_application.id}`} className="text-accent dark:text-accent-muted hover:underline">
                        {todo.job_application.company_name}
                      </Link>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => markTodoDone(todo)} className={SMALL_BUTTON_CLASSES}>
                  Done
                </button>
                <button type="button" onClick={() => postponeTodo(todo)} className={SMALL_BUTTON_CLASSES}>
                  Tomorrow
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
