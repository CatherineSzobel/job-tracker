import Status from "./Status";
import { JOB_STATUSES } from "../../../constants/jobs";

export default function StatusBadges({ stats }) {
    return (
        <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 flex flex-wrap gap-4 justify-between transition-colors transition-shadow hover:shadow-xl">
            {JOB_STATUSES.map(({ value, label }) => (
                <div key={value} className="flex-1 min-w-30">
                    <Status
                        status={value}
                        label={label}
                        count={stats?.[value] ?? 0}
                        total={stats?.total ?? 0}
                    />
                </div>
            ))}
        </div>
    );
}
