export default function InterviewList({ i, startEdit, deleteInterview }) {
  const isPast = new Date(i.interview_date) < new Date();

  return (
    <div className="relative bg-white dark:bg-dark-soft rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4 h-full">
      {/* Job Title */}
      <h3 className="font-semibold text-lg text-light-text dark:text-dark-text line-clamp-2">
        {i.job?.company_name} - {i.job?.position}
      </h3>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
          {i.type}
        </span>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          {new Date(i.interview_date).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${isPast
            ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
            : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
            }`}
        >
          {isPast ? "Past" : "Upcoming"}
        </span>
      </div>

      {/* Location */}
      <p className="text-sm text-muted dark:text-dark-muted">
        <strong>Location:</strong> {i.location || "—"}
      </p>

      {/* Notes */}
      {i.notes && (
        <p className="text-sm text-muted dark:text-dark-muted">
          <strong>Notes:</strong> {i.notes}
        </p>
      )}

      <div className="flex justify-end gap-2 mt-auto">
        <button
          onClick={() => startEdit(i)}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-700 transition"
        >
          Edit
        </button>
        <button
          onClick={() => deleteInterview(i.id)}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}