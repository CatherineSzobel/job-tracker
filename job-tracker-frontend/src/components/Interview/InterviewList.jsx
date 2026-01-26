export default function InterviewList({  i, startEdit, deleteInterview }) {

    const isPastInterview = (date) => new Date(date) < new Date();
    const isPast = isPastInterview(i.interview_date);
    return (
        <div
            key={i.id}
            className="p-4 bg-white rounded shadow hover:shadow-md transition relative">
            <div className="absolute top-3 right-3 flex gap-3 text-sm">
                <button
                    onClick={() => startEdit(i)}
                    className="text-blue-600 hover:text-blue-800"
                >
                    Edit
                </button>
                <button
                    onClick={() => deleteInterview(i.id)}
                    className="text-red-600 hover:text-red-800"
                >
                    Delete
                </button>
            </div>

            <h3 className="font-semibold text-gray-800">{i.job_title}</h3>

            <div className="mt-2 flex flex-wrap gap-2 items-center text-sm">
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">
                    {i.type}
                </span>

                <span className="px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {new Date(i.interview_date).toLocaleString()}
                </span>

                <span
                    className={`px-2 py-1 rounded text-xs ${isPast
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                        }`}
                >
                    {isPast ? "Past" : "Upcoming"}
                </span>
            </div>

            <p className="mt-2 text-gray-600">
                <strong>Location:</strong> {i.location || "—"}
            </p>

            {i.notes && (
                <p className="mt-1 text-gray-600">
                    <strong>Notes:</strong> {i.notes}
                </p>
            )}
        </div>
    );
}