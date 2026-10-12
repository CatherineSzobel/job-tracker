import { useState } from "react";
import { ChevronRight } from "lucide-react";
import PageHeader from "../components/UI/PageHeader";
import PageLoader from "../components/UI/PageLoader";
import TodoInput from "../components/Todo/TodoInput";
import TodoItem from "../components/Todo/TodoItem";
import useTodos from "../components/Todo/useTodos";
import { EMPTY_TODO_DRAFT } from "../constants/todos";
import { describeDueDate } from "../utils/dueDate";
import { filterChipClasses } from "../components/UI/filterChipClasses";

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
  { state: "none", title: "No due date" },
];

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
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
      <PageHeader title="To-dos" description="Follow-ups for your applications, and anything else on your list." />

      <div className="card">
        <TodoInput draft={draft} onDraftChange={setDraft} onAdd={addTodo} />
      </div>

      <div role="group" aria-label="Filter to-dos" className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={filterChipClasses(filter === value)}>
            {label}
          </button>
        ))}
      </div>

      {openTodos.length === 0 && <p className="text-muted">Nothing to do. Add a follow-up above.</p>}

      {SECTIONS.map(({ state, title }) => {
        const sectionTodos = openTodos.filter((todo) => describeDueDate(todo.due_date).state === state);
        if (sectionTodos.length === 0) return null;

        return (
          <section key={state} aria-label={title} className="flex flex-col gap-2">
            <h2 className={`group-label ${state === "overdue" ? "text-rejected-fg" : ""}`}>
              {title} ({sectionTodos.length})
            </h2>
            <ul className="flex flex-col gap-2">{sectionTodos.map(renderItem)}</ul>
          </section>
        );
      })}

      {doneTodos.length > 0 && (
        <section className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowDone((shown) => !shown)}
            aria-expanded={showDone}
            className="group-label inline-flex min-h-10 items-center gap-1 self-start hover:text-ink"
          >
            <ChevronRight size={16} aria-hidden="true" className={`transition-transform ${showDone ? "rotate-90" : ""}`} />
            Done ({doneTodos.length})
          </button>
          {showDone && <ul className="flex flex-col gap-2">{doneTodos.map(renderItem)}</ul>}
        </section>
      )}
    </div>
  );
}
