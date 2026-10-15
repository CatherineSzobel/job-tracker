import { useState } from "react";
import { ListTodo } from "lucide-react";
import Card from "../UI/Card";
import PageLoader from "../UI/PageLoader";
import { followUpQuickAdds } from "./quickAdds";
import TodoInput from "./TodoInput";
import TodoItem from "./TodoItem";
import useTodos from "./useTodos";
import { EMPTY_TODO_DRAFT } from "../../constants/todos";

// This application's to-dos. Quick-add chips only prefill the form; nothing is created until Add.
// onChange() runs after a to-do is changed or deleted (ticking one off shows in the activity timeline).
export default function JobFollowUps({ job, onChange }) {
  const { todos, loading, addTodo, updateTodo, deleteTodo } = useTodos({ job_application_id: job.id });
  const [draft, setDraft] = useState(EMPTY_TODO_DRAFT);

  const updateAndNotify = async (todo, changes) => {
    await updateTodo(todo, changes);
    onChange?.();
  };

  const deleteAndNotify = async (todo) => {
    await deleteTodo(todo);
    onChange?.();
  };

  const quickAdds = followUpQuickAdds(job);

  return (
    <Card title="Follow-ups" icon={ListTodo}>
      {loading ? (
        <PageLoader text="Loading follow-ups..." compact />
      ) : todos.length === 0 ? (
        <p className="text-muted">No follow-ups yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {todos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onUpdate={updateAndNotify} onDelete={deleteAndNotify} showApplication={false} />
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Quick add:</span>
        {quickAdds.map(({ label, text, due_date }) => (
          <button
            key={label}
            type="button"
            onClick={() => setDraft({ text, due_date, job_application_id: "" })}
            className="inline-flex min-h-10 items-center rounded-full border border-input bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:bg-soft"
          >
            {label}
          </button>
        ))}
      </div>

      <TodoInput draft={draft} onDraftChange={setDraft} onAdd={addTodo} fixedApplicationId={job.id} label="New follow-up" />
    </Card>
  );
}
