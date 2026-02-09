export default function Status({ label, count, total }) {
    const statusColors = {
        applied: "bg-blue-100 text-blue-700",
        interview: "bg-yellow-100 text-yellow-700",
        offer: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-700",
    };
    const percentage = Math.min((count / total) * 100, 100);
    return (
        <div className="mb-2">
            <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${statusColors[label.toLowerCase()]}`}>
                {label}: {count}
            </span>
            <div className="h-2 bg-gray-200 rounded mt-1">
                <div
                    className={`h-2 rounded ${statusColors[label.toLowerCase()]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}