import GoalBar from "./GoalBar";

export default function GoalStats({ stats, dailyGoal, weeklyGoal }) {
    const goalItems = [
        {
            label: "Today's Applications",
            currentKey: "todayApplications",
            goal: dailyGoal,
            barColor: (current, goal) => (current >= goal ? "bg-green-500 dark:bg-green-400" : "bg-accent dark:bg-accent"),
        },
        {
            label: "This Week's Applications",
            currentKey: "weekApplications",
            goal: weeklyGoal,
            barColor: (current, goal) => (current >= goal ? "bg-green-500 dark:bg-green-400" : "bg-accent-soft dark:bg-accent-soft"),
        },
    ];

    return (
        <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 transition-colors transition-shadow hover:shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-light-text dark:text-white">Goals</h2>
            <div className="flex flex-col gap-4">
                {goalItems.map(({ label, currentKey, goal, barColor }) => {
                    const current = stats?.[currentKey] ?? 0;
                    return (
                        <GoalBar
                            key={currentKey}
                            label={label}
                            current={current}
                            goal={goal}
                            color={barColor(current, goal)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
