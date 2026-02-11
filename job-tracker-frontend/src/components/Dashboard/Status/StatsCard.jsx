// components/StatsCard.jsx
export default function StatsCard({
    label,
    value,
    icon,
    accent = "text-indigo-600",
}) {
    return (
        <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 flex items-center justify-between transition-colors hover:shadow-xl">
            <div>
                <p className="text-sm font-medium text-dark dark:text-light">{label}</p>
                <p className="text-3xl sm:text-4xl font-bold text-dark dark:text-light">
                    {value}
                </p>
            </div>

            {icon && (
                <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-light-muted dark:bg-dark-subtle ${accent}`}
                >
                    {icon}
                </div>
            )}
        </div>
    );
}
