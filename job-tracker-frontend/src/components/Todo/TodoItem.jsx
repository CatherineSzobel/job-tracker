import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Trash2 } from "lucide-react";
import DueChip from "./DueChip";
import { describeDueDate, isoDateFromToday } from "../../utils/dueDate";

// Click the text to edit it (Enter or leaving the field saves, Escape cancels).
// showApplication: false where the page is already about that application.
export default function TodoItem({ todo, onUpdate, onDelete, showApplication = true }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(todo.text);
  const cancelled = useRef(false);
  const dueState = todo.done ? "none" : describeDueDate(todo.due_date).state;
  const overdue = dueState === "overdue";
  // An open to-do that's due today or overdue can be moved to tomorrow in one click
  const canPostpone = overdue || dueState === "today";

  const startEditing = () => {
    cancelled.current = false;
    setText(todo.text);
    setEditing(true);
  };

  const finishEditing = () => {
    setEditing(false);
    const trimmed = text.trim();
    if (cancelled.current || !trimmed || trimmed === todo.text) return;
    onUpdate(todo, { text: trimmed });
  };

  // Enter saves (by leaving the field), Escape cancels. Escape stops here so a surrounding dialog
  // (e.g. the Calendar's day view) doesn't close as well.
  const handleEditKeyDown = (event) => {
    if (event.key === "Escape") {
      cancelled.current = true;
      event.stopPropagation();
    }
    if (event.key === "Enter" || event.key === "Escape") {
      event.currentTarget.blur();
    }
  };

  return (
    <li
      className={`flex items-center gap-3 px-4 py-3 border rounded-lg transition-all hover:shadow-sm
        ${todo.done
          ? "text-light-muted dark:text-dark-muted bg-light-soft dark:bg-dark-subtle border-light-muted dark:border-dark-subtle opacity-80"
          : overdue
            ? "bg-light dark:bg-dark border-red-300 dark:border-red-800 text-light-text dark:text-white"
            : "bg-light dark:bg-dark border-light-muted dark:border-dark-subtle hover:bg-light-soft dark:hover:bg-dark-soft text-light-text dark:text-white"
        }`}
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onUpdate(todo, { done: !todo.done })}
        aria-label={todo.done ? "Mark as not done" : "Mark as done"}
        className="h-5 w-5 cursor-pointer rounded accent-accent"
      />

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {editing ? (
          <input
            autoFocus
            value={text}
            maxLength={255}
            onChange={(event) => setText(event.target.value)}
            onBlur={finishEditing}
            onKeyDown={handleEditKeyDown}
            className="input-field py-1"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            title="Click to edit"
            className={`text-left font-medium break-words ${todo.done ? "line-through" : ""}`}
          >
            {todo.text}
          </button>
        )}

        {(todo.due_date || (showApplication && todo.job_application)) && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <DueChip dueDate={todo.due_date} done={todo.done} />
            {showApplication && todo.job_application && (
              <Link to={`/jobs/${todo.job_application.id}`} className="text-accent dark:text-accent-muted hover:underline truncate">
                {todo.job_application.company_name} · {todo.job_application.position}
              </Link>
            )}
          </div>
        )}
      </div>

      {canPostpone && (
        <button
          type="button"
          onClick={() => onUpdate(todo, { due_date: isoDateFromToday(1) })}
          aria-label="Move to tomorrow"
          title="Move to tomorrow"
          className="text-light-muted dark:text-dark-muted hover:text-accent dark:hover:text-accent-muted p-1 rounded-full transition-colors"
        >
          <CalendarClock size={16} />
        </button>
      )}

      <button
        onClick={() => onDelete(todo)}
        aria-label="Delete to-do"
        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-1 rounded-full transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}
