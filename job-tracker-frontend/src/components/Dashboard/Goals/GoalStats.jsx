import GoalBar from "./GoalBar";


export default function GoalStats({ stats, dailyGoal, weeklyGoal }) {

    const goalItems = [
        {
            label: "Today's Applications",
            currentKey: "todayApplications",
            goal: dailyGoal,
            barColor: (current, goal) => (current >= goal ? "green" : "accent"),
        },
        {
            label: "This Week's Applications",
            currentKey: "weekApplications",
            goal: weeklyGoal,
            barColor: (current, goal) => (current >= goal ? "green" : "accent-soft"),
        },
    ];
    return (
        <div className="bg-white shadow-md rounded-2xl p-6 transition-shadow hover:shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Goals</h2>
            <div className="flex flex-col gap-4">
                {goalItems.map(({ label, currentKey, goal, barColor }) => {
                    const current = stats?.[currentKey] ?? 0;
                    return (
                        <GoalBar
                            key={currentKey}
                            label={label}
                            current={current}
                            goal={goal}
                            barColor={barColor(current, goal)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
