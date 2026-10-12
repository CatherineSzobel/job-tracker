import { useId, useState } from "react";
import { ListTodo, Plus } from "lucide-react";
import TodoItem from "./Todo/TodoItem";
import TodoEmptyState from "./Todo/TodoEmptyState";
import Card, { CardLink } from "./UI/Card";
import PageLoader from "./UI/PageLoader";
import { DASHBOARD_TODO_LIMIT } from "../constants/todos";

// Dashboard card: the next open to-dos, with a one-line add (text only; the To-dos page has the full form).
// Takes useTodos()'s result as props: the Dashboard shares the same list with Coming up.
export default function TodoList({ todos, loading, addTodo, updateTodo, deleteTodo }) {
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const inputId = useId();
  const openTodos = todos.filter((todo) => !todo.done).slice(0, DASHBOARD_TODO_LIMIT);

  // The text is only cleared when the save worked
  const add = async (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || adding) return;

    setAdding(true);
    const saved = await addTodo({ text: trimmed, due_date: null, job_application_id: null });
    setAdding(false);
    if (saved) setText("");
  };

  return (
    <Card title="Quick to-dos" icon={ListTodo} action={<CardLink to="/todos">View all</CardLink>}>
      <form onSubmit={add} className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          New to-do
        </label>
        <input
          id={inputId}
          type="text"
          value={text}
          maxLength={255}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add a to-do…"
          className="input-field min-w-0 flex-1"
        />
        <button type="submit" disabled={!text.trim() || adding} aria-label="Add to-do" className="btn-primary w-12 shrink-0 px-0">
          <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>
      </form>

      {loading ? (
        <PageLoader text="Loading to-dos..." compact />
      ) : openTodos.length === 0 ? (
        todos.length > 0 ? (
          // Only done to-dos left: "No to-dos yet" would be wrong
          <p className="py-4 text-center text-muted">All done. Nice work.</p>
        ) : (
          <TodoEmptyState />
        )
      ) : (
        <ul className="flex flex-col gap-2">
          {openTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onUpdate={updateTodo} onDelete={deleteTodo} />
          ))}
        </ul>
      )}
    </Card>
  );
}
