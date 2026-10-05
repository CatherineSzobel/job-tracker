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
        // h-full + justify-evenly: fills the height of the card next to it and spreads the bars out
        <div className="card h-full flex flex-col">
            <h2 className="card-title mb-4">Goals</h2>
            <div className="flex-1 flex flex-col justify-evenly gap-6">
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
