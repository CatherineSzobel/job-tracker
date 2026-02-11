export default function InterviewList({ i, startEdit, deleteInterview }) {
    const isPastInterview = (date) => new Date(date) < new Date();
    const isPast = isPastInterview(i.interview_date);

    return (
        <div
            key={i.id}
            className="p-4 bg-white dark:bg-gray-800 rounded shadow hover:shadow-md transition relative"
        >
            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex gap-3 text-sm">
                <button
                    onClick={() => startEdit(i)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                    Edit
                </button>
                <button
                    onClick={() => deleteInterview(i.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                    Delete
                </button>
            </div>

            {/* Job Title */}
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{i.job_title}</h3>

            {/* Interview Info */}
            <div className="mt-2 flex flex-wrap gap-2 items-center text-sm">
                <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {i.type}
                </span>

                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                    {new Date(i.interview_date).toLocaleString()}
                </span>

                <span
                    className={`px-2 py-1 rounded text-xs ${isPast
                        ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                        : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                        }`}
                >
                    {isPast ? "Past" : "Upcoming"}
                </span>
            </div>

            {/* Location */}
            <p className="mt-2 text-gray-600 dark:text-gray-300">
                <strong>Location:</strong> {i.location || "—"}
            </p>

            {/* Notes */}
            {i.notes && (
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                    <strong>Notes:</strong> {i.notes}
                </p>
            )}
        </div>
    );
}
