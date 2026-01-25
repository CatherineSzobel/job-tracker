// components/GoalBar.jsx
export default function GoalBar({ label, current, goal, color = "bg-indigo-500" }) {
  const percentage = goal ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <div className="mb-2">
      <p className="font-semibold">{label}</p>
      <div className="flex justify-between text-sm mb-1">
        <span>{current}</span>
        <span>{goal}</span>
      </div>
      <div className="h-3 bg-gray-200 rounded">
        <div
          className={`h-3 ${color} rounded`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
