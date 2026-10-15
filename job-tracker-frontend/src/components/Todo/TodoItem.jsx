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
      className={`flex items-center gap-3 rounded-xl border py-3 pr-2 pl-4 ${
        todo.done ? "border-line bg-soft text-muted" : overdue ? "border-rejected-line bg-surface" : "border-line bg-surface"
      }`}
    >
      <input
        type="checkbox"
        checked={todo.done}
        onChange={() => onUpdate(todo, { done: !todo.done })}
        aria-label={todo.done ? `Mark as not done: ${todo.text}` : `Mark done: ${todo.text}`}
        className="size-5 shrink-0 cursor-pointer"
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
            aria-label="To-do text"
            className="input-field"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            title="Click to edit"
            className={`text-left font-semibold break-words ${todo.done ? "line-through" : ""}`}
          >
            {todo.text}
          </button>
        )}

        {(todo.due_date || (showApplication && todo.job_application)) && (
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
            <DueChip dueDate={todo.due_date} done={todo.done} />
            {showApplication && todo.job_application && (
              <Link to={`/jobs/${todo.job_application.id}`} className="min-w-0 truncate text-accent-text hover:underline">
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
          className="btn-icon-sm"
        >
          <CalendarClock size={18} aria-hidden="true" />
        </button>
      )}

      <button
        type="button"
        onClick={() => onDelete(todo)}
        aria-label="Delete to-do"
        title="Delete to-do"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-danger transition-colors hover:bg-rejected-bg"
      >
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </li>
  );
}
