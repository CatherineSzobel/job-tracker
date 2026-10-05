import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import TodoInput from "./Todo/TodoInput";
import TodoItem from "./Todo/TodoItem";
import TodoEmptyState from "./Todo/TodoEmptyState";
import useTodos from "./Todo/useTodos";
import Modal from "./UI/Modal";
import PageLoader from "./UI/PageLoader";
import { DASHBOARD_TODO_LIMIT, EMPTY_TODO_DRAFT } from "../constants/todos";

// Dashboard widget: the next open to-dos. "Add to-do" opens the full form (text, date, application) in a dialog.
// onTodosChanged(): runs after each change, so the Dashboard can reload the Reminders card.
export default function TodoList({ onTodosChanged }) {
  const { todos, loading, addTodo, updateTodo, deleteTodo } = useTodos();
  const [draft, setDraft] = useState(EMPTY_TODO_DRAFT);
  const [showDetails, setShowDetails] = useState(false);
  const openTodos = todos.filter((todo) => !todo.done).slice(0, DASHBOARD_TODO_LIMIT);

  const afterChange = (action) => async (...args) => {
    const result = await action(...args);
    onTodosChanged?.();
    return result;
  };
  const updateAndNotify = afterChange(updateTodo);
  const deleteAndNotify = afterChange(deleteTodo);

  // Close the dialog only when the save worked, so a failed add keeps what was entered
  const addFromDetails = afterChange(async (payload) => {
    const saved = await addTodo(payload);
    if (saved) setShowDetails(false);
    return saved;
  });

  if (loading) {
    return <PageLoader text="Loading to-dos..." compact />;
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setShowDetails(true)}
        className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-soft text-surface px-4 py-2 rounded-lg transition-colors"
      >
        <CalendarPlus size={18} aria-hidden="true" />
        Add to-do
      </button>

      {openTodos.length === 0 ? (
        todos.length > 0 ? (
          // Only done to-dos left: "No todos yet" would be wrong
          <p className="text-sm text-light-muted dark:text-dark-muted text-center py-6">✅ All done. Nice work.</p>
        ) : (
          <TodoEmptyState />
        )
      ) : (
        <ul className="flex flex-col gap-2">
          {openTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={updateAndNotify}
              onDelete={deleteAndNotify}
            />
          ))}
        </ul>
      )}

      <Link to="/todos" className="self-end text-sm text-accent hover:text-accent-soft transition-colors">
        View all →
      </Link>

      {showDetails && (
        <Modal title="New to-do" onClose={() => setShowDetails(false)} maxWidth="max-w-lg">
          <TodoInput draft={draft} onDraftChange={setDraft} onAdd={addFromDetails} />
        </Modal>
      )}
    </div>
  );
}
