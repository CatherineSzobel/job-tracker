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
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <span className="text-xs font-medium text-gray-500">
          {percentage.toFixed(0)}%
        </span>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{current} done</span>
        <span>{goal} goal</span>
      </div>

      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out
            ${isComplete ? "bg-green-500" : color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
