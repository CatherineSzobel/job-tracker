export default function GoalBar({
  label,
  current,
  goal,
  color = "bg-indigo-500",
}) {
  const percentage = goal ? Math.min((current / goal) * 100, 100) : 0;
  const isComplete = current >= goal;

  return (
    <div className="space-y-1">
      {/* Label + % */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-light-text dark:text-white">{label}</p>
        <span className="text-xs font-medium text-dark dark:text-light">
          {percentage.toFixed(0)}%
        </span>
      </div>

      {/* Current / Goal */}
      <div className="flex justify-between text-xs text-dark dark:text-light">
        <span>{current} done</span>
        <span>{goal} goal</span>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-dark-soft dark:bg-light rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out
            ${isComplete ? "bg-green-500 dark:bg-green-400" : color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
