import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import Card from "../UI/Card";
import PageLoader from "../UI/PageLoader";
import useReminders from "./useReminders";

// What Dismiss will do, shown as its tooltip
const DISMISS_HINTS = {
  today: "Hide until tomorrow",
  permanent: "Hide until you update this application",
};

// Applications to follow up. "Add follow-up" opens the application, where its follow-up shortcuts are.
// "No reminders" when there are none (which includes reminders being off).
export default function Reminders() {
  const { applications, loading, dismissMode, dismiss } = useReminders();

  return (
    <Card title="Time to follow up" icon={Bell}>
      {loading ? (
        <PageLoader text="Loading reminders..." compact />
      ) : applications.length === 0 ? (
        <p className="text-muted">No reminders.</p>
      ) : (
        <ul className="-mt-2 flex flex-col">
          {applications.map((job) => (
            <li key={job.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-subtle py-3 last:border-b-0">
              <div className="flex min-w-0 flex-col">
                <Link to={`/jobs/${job.id}`} className="font-semibold text-ink hover:underline">
                  {job.company_name} <span className="font-normal text-muted">· {job.position}</span>
                </Link>
                <span className="text-sm text-muted">No update for {job.days_since_update} days</span>
              </div>
              <div className="flex gap-2">
                <Link to={`/jobs/${job.id}`} className="btn-soft">
                  Add follow-up
                </Link>
                <button type="button" onClick={() => dismiss(job)} title={DISMISS_HINTS[dismissMode]} className="btn-small">
                  Dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
