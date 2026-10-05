import PrepProgressLink from "./PrepProgressLink";

export default function InterviewCard({ interview }) {
  const date = new Date(interview.interview_date);

  return (
    <div className="card flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-light-muted dark:text-white">
          Interview
        </h3>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 capitalize">
          {interview.type}
        </span>
      </div>

      {/* Main info: e.g. "Tuesday, September 29, 2026" and "10:00 AM" in the browser's locale */}
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-light-text dark:text-dark-text">
          {date.toLocaleDateString(undefined, { dateStyle: "full" })}
        </p>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          {date.toLocaleTimeString(undefined, { timeStyle: "short" })}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
        <span>{interview.location || "Location TBD"}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted">
        <span>{interview.notes || "No notes yet"}</span>
      </div>

      <PrepProgressLink interview={interview} />
    </div>
  );
}
