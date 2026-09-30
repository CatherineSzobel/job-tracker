import { useState } from "react";
import PageLoader from "../components/UI/PageLoader";
import TodoInput from "../components/Todo/TodoInput";
import TodoItem from "../components/Todo/TodoItem";
import useTodos from "../components/Todo/useTodos";
import { EMPTY_TODO_DRAFT } from "../constants/todos";
import { describeDueDate } from "../utils/dueDate";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "linked", label: "Linked to an application" },
  { value: "general", label: "General" },
];

// Open to-dos are grouped by due state; done ones sit in a collapsed section at the end
const SECTIONS = [
  { state: "overdue", title: "Overdue" },
  { state: "today", title: "Today" },
  { state: "upcoming", title: "Upcoming" },
  { state: "none", title: "No date" },
];

const CHIP_CLASSES = "px-3 py-1 rounded-full text-sm transition-colors";
const ACTIVE_CHIP = "bg-accent text-white";
const INACTIVE_CHIP = "bg-light dark:bg-dark-soft text-light-muted dark:text-dark-muted border border-border dark:border-dark-subtle hover:text-accent";

export default function Todos() {
  const { todos, loading, addTodo, updateTodo, deleteTodo } = useTodos();
  const [draft, setDraft] = useState(EMPTY_TODO_DRAFT);
  const [filter, setFilter] = useState("all");
  const [showDone, setShowDone] = useState(false);

  const visibleTodos = todos.filter((todo) => filter === "all" || (filter === "linked") === Boolean(todo.job_application));
  const openTodos = visibleTodos.filter((todo) => !todo.done);
  const doneTodos = visibleTodos.filter((todo) => todo.done);

  const renderItem = (todo) => (
    <TodoItem
      key={todo.id}
      todo={todo}
      onUpdate={updateTodo}
      onDelete={deleteTodo}
    />
  );

  if (loading) {
    return <PageLoader text="Loading to-dos..." />;
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 sm:mt-10 sm:px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">To-dos</h1>
        <p className="text-light-muted dark:text-dark-muted">Follow-ups for your applications, and anything else on your list.</p>
      </div>

      <div className="bg-light dark:bg-dark-soft rounded-xl p-4 shadow-sm border border-border dark:border-dark-subtle transition-colors">
        <TodoInput draft={draft} onDraftChange={setDraft} onAdd={addTodo} />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`${CHIP_CLASSES} ${filter === value ? ACTIVE_CHIP : INACTIVE_CHIP}`}
          >
            {label}
          </button>
        ))}
      </div>

      {openTodos.length === 0 && (
        <p className="text-sm text-light-muted dark:text-dark-muted">Nothing to do. Add a follow-up above.</p>
      )}

      {SECTIONS.map(({ state, title }) => {
        const sectionTodos = openTodos.filter((todo) => describeDueDate(todo.due_date).state === state);
        if (sectionTodos.length === 0) return null;

        return (
          <section key={state}>
            <h2 className={`text-sm font-semibold uppercase tracking-wide mb-2 ${state === "overdue" ? "text-red-600 dark:text-red-400" : "text-light-muted dark:text-dark-muted"}`}>
              {title} ({sectionTodos.length})
            </h2>
            <ul className="flex flex-col gap-2">{sectionTodos.map(renderItem)}</ul>
          </section>
        );
      })}

      {doneTodos.length > 0 && (
        <section>
          <button
            onClick={() => setShowDone((shown) => !shown)}
            aria-expanded={showDone}
            className="text-sm font-semibold uppercase tracking-wide mb-2 text-light-muted dark:text-dark-muted hover:text-accent transition-colors"
          >
            {showDone ? "▾" : "▸"} Done ({doneTodos.length})
          </button>
          {showDone && <ul className="flex flex-col gap-2">{doneTodos.map(renderItem)}</ul>}
        </section>
      )}
    </div>
  );
}
