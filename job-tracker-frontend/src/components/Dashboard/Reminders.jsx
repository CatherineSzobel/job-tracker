import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import PageLoader from "../UI/PageLoader";
import useReminders from "./useReminders";

// What Dismiss will do, shown as its tooltip
const DISMISS_HINTS = {
  today: "Hide until tomorrow",
  permanent: "Hide until you update this application",
};

// Applications to follow up. "No reminders" when there are none (which includes reminders being off).
export default function Reminders() {
  const { applications, loading, dismissMode, dismiss } = useReminders();

  return (
    <div className="card">
      <h2 className="card-title mb-4">
        <Bell size={18} aria-hidden="true" />
        Reminders
      </h2>

      {loading ? (
        <PageLoader text="Loading reminders..." compact />
      ) : applications.length === 0 ? (
        <p className="text-sm text-light-muted dark:text-dark-muted">No reminders.</p>
      ) : (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-light-muted dark:text-dark-muted">
            Time to follow up
          </h3>
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
        </section>
      )}
    </div>
  );
}
