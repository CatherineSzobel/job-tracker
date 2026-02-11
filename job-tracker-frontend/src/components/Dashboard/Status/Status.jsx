export default function Status({ label, count, total }) {
    // Define colors for light and dark mode
    const statusColors = {
        applied: {
            light: "bg-blue-100 text-blue-700",
            dark: "bg-blue-800 text-blue-300",
        },
        interview: {
            light: "bg-yellow-100 text-yellow-700",
            dark: "bg-yellow-800 text-yellow-300",
        },
        offer: {
            light: "bg-green-100 text-green-700",
            dark: "bg-green-800 text-green-300",
        },
        rejected: {
            light: "bg-red-100 text-red-700",
            dark: "bg-red-800 text-red-300",
        },
    };

    const percentage = Math.min((count / total) * 100, 100);
    const key = label.toLowerCase();

    return (
        <div className="mb-2">
            {/* Badge */}
            <span
                className={`inline-block px-2 py-1 rounded text-sm font-medium
          ${statusColors[key].light} dark:${statusColors[key].dark}`}
            >
                {label}: {count}
            </span>

            {/* Progress Bar */}
            <div className="h-2 bg-light-muted dark:bg-dark-subtle rounded mt-1">
                <div
                    className={`h-2 rounded ${statusColors[key].light} dark:${statusColors[key].dark}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
