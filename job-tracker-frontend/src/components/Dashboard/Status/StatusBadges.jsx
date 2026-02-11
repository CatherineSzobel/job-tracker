// Define the statuses you want to display
import Status from "./Status";

const statusItems = [
    { label: "Applied", key: "applied" },
    { label: "Interview", key: "interview" },
    { label: "Offer", key: "offer" },
    { label: "Rejected", key: "rejected" },
];

export default function StatusBadges({ stats }) {
    return (
        <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 flex flex-wrap gap-4 justify-between transition-colors transition-shadow hover:shadow-xl">
            {statusItems.map(({ label, key }) => (
                <div key={key} className="flex-1 min-w-30">
                    <Status
                        label={label}
                        count={stats[key] ?? 0}
                        total={stats?.total ?? 1}
                        className="text-light-text dark:text-white"
                    />
                </div>
            ))}
        </div>
    );
}
