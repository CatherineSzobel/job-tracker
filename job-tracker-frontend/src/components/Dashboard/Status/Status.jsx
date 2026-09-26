import { STATUS_BADGE_CLASSES } from "../../../constants/jobs";

export default function Status({ status, label, count, total }) {
    const percentage = total ? Math.min((count / total) * 100, 100) : 0;
    const colors = STATUS_BADGE_CLASSES[status];

    return (
        <div className="mb-2">
            {/* Badge */}
            <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${colors}`}>
                {label}: {count}
            </span>

            {/* Progress Bar */}
            <div className="h-2 bg-light-muted dark:bg-dark-subtle rounded mt-1">
                <div
                    className={`h-2 rounded ${colors}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
