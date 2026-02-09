import { Calendar, Trash2 } from "lucide-react";

export default function TodoItem({ todo, onToggle, onDelete, formatDate }) {
  return (
    <li
      className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all hover:shadow-sm
        ${todo.done ? "line-through text-secondary-text bg-secondary-soft" : "bg-surface hover:bg-surface-hover"}`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo)}
        className="h-5 w-5 accent-accent cursor-pointer"
      />

      {/* Todo text + date */}
      <div className="flex-1 flex flex-col">
        <span className="font-medium break-words">{todo.text}</span>
        <span className="text-xs text-gray-400 mt-1">{formatDate(todo.created_at)}</span>
      </div>

      {/* Action icons */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => alert("Calendar integration coming soon!")}
          className="text-blue-600 hover:text-blue-800 p-1 rounded-full transition-colors"
        >
          <Calendar size={16} />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-red-500 hover:text-red-700 p-1 rounded-full transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
