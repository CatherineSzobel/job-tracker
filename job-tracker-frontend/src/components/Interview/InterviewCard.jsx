export default function InterviewCard({ interview }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Interview
                </h3>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                    {interview.type || "Interview"}
                </span>
            </div>

            {/* Main info */}
            <div className="flex flex-col gap-1">
                <p className="text-base font-semibold text-gray-900">
                    {interview.interview_date}
                </p>
                <p className="text-sm text-gray-500">
                    {interview.interview_time}
                </p>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                <span>{interview.location || "Location TBD"}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{interview.notes || "Location TBD"}</span>
            </div>
        </div>
    );
}
