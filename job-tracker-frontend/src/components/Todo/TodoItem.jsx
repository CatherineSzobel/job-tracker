import { Calendar, Trash2 } from "lucide-react";

export default function TodoItem({ todo, onToggle, onDelete, formatDate }) {
  return (
    <li
      className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all hover:shadow-sm
        ${todo.done
          ? "line-through text-light-muted dark:text-dark-subtle bg-light-soft dark:bg-dark-subtle border-light-muted dark:border-dark-subtle opacity-80"
          : "bg-light dark:bg-dark border-light-muted dark:border-dark-subtle hover:bg-light-soft dark:hover:bg-dark-soft text-light-text dark:text-white"
        }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onToggle(todo)}
        className={`h-5 w-5 cursor-pointer rounded accent-accent transition-colors
          ${todo.done ? "bg-green-500 dark:bg-green-400 border-green-500 dark:border-green-400" : ""}`}
      />

      {/* Todo text + date */}
      <div className="flex-1 flex flex-col">
        <span
          className={`font-medium wrap-break-word transition-colors
            ${todo.done ? "text-dark-muted dark:text-light-subtle" : "text-light dark:text-white"}`}
        >
          {todo.text}
        </span>
        <span
          className={`text-xs mt-1 transition-colors 
            ${todo.done ? "text-light-muted dark:text-dark-subtle" : "text-light-muted dark:text-dark-subtle"}`}
        >
          {formatDate(todo.created_at)}
        </span>
      </div>

      {/* Action icons */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => alert("Calendar integration coming soon!")}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded-full transition-colors"
        >
          <Calendar size={16} />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded-full transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
