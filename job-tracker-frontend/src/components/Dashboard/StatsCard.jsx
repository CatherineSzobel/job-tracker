// components/StatsCard.jsx
export default function StatsCard({
    label,
    value,
    icon,
    accent = "text-indigo-600",
}) {
    return (
        <div className="bg-white shadow-md rounded-2xl p-6 flex items-center justify-between transition-shadow hover:shadow-xl">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {value}
                </p>
            </div>

            {icon && (
                <div
                    className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 ${accent}`}
                >
                    {icon}
                </div>
            )}
        </div>
    );
}
