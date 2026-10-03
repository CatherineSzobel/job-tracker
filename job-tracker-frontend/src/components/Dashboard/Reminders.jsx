import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import useReminders from "./useReminders";

// What Dismiss will do, shown as its tooltip
const DISMISS_HINTS = {
  today: "Hide until tomorrow",
  permanent: "Hide until you update this application",
};

// Applications to follow up. Renders nothing while loading or when there's nothing to show
// (which includes reminders being off).
export default function Reminders() {
  const { applications, loading, dismissMode, dismiss } = useReminders();

  if (loading || applications.length === 0) return null;

  return (
    <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 transition-shadow hover:shadow-xl">
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-1 text-light-text dark:text-white">
        <Bell size={18} aria-hidden="true" />
        Time to follow up
      </h2>

      <ul>
        {applications.map((job) => (
          <li
            key={job.id}
            className="flex flex-wrap items-center gap-2 py-2 border-b last:border-b-0 border-border dark:border-dark-subtle"
          >
            <div className="flex-1 min-w-0">
              <Link to={`/jobs/${job.id}`} className="font-medium text-accent dark:text-accent-muted hover:underline">
                {job.company_name}
              </Link>
              <span className="text-sm text-light-muted dark:text-dark-muted"> · {job.position}</span>
              <p className="text-xs text-light-muted dark:text-dark-muted">No update for {job.days_since_update} days</p>
            </div>
            <button type="button" onClick={() => dismiss(job)} title={DISMISS_HINTS[dismissMode]} className="btn-small">
              Dismiss
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
