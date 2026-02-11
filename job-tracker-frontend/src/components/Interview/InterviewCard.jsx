export default function InterviewCard({ interview }) {
  return (
    <div className="bg-light-soft dark:bg-dark-soft rounded-2xl shadow-sm border border-light-border dark:border-dark-subtle p-5 flex flex-col gap-4 transition-colors">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-light-muted dark:text-white">
          Interview
        </h3>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 capitalize">
          {interview.type}
        </span>
      </div>

      {/* Main info */}
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-light-text dark:text-dark-text">
          {interview.interview_date}
        </p>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          {interview.interview_time}
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
    </div>
  );
}
