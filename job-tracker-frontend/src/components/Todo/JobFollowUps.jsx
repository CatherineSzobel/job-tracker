import { useState } from "react";
import PageLoader from "../UI/PageLoader";
import { followUpQuickAdds } from "./quickAdds";
import TodoInput from "./TodoInput";
import TodoItem from "./TodoItem";
import useTodos from "./useTodos";
import { EMPTY_TODO_DRAFT } from "../../constants/todos";

const QUICK_ADD_CLASSES = "px-3 py-1 rounded-full text-xs bg-light dark:bg-dark-subtle text-light-muted dark:text-dark-muted border border-border dark:border-dark-subtle hover:text-accent transition-colors";

// This application's to-dos. Quick-add buttons only prefill the form; nothing is created until Add.
export default function JobFollowUps({ job }) {
  const { todos, loading, addTodo, updateTodo, deleteTodo } = useTodos({ job_application_id: job.id });
  const [draft, setDraft] = useState(EMPTY_TODO_DRAFT);

  const quickAdds = followUpQuickAdds(job);

  return (
    <div className="bg-light-soft dark:bg-dark-soft rounded-xl p-6 mb-6 transition-colors">
      <h2 className="font-semibold text-accent dark:text-accent mb-4">Follow-ups</h2>

      <div className="flex flex-wrap gap-2 mb-3">
        {quickAdds.map(({ label, text, due_date }) => (
          <button
            key={label}
            type="button"
            onClick={() => setDraft({ text, due_date, job_application_id: "" })}
            className={QUICK_ADD_CLASSES}
          >
            + {label}
          </button>
        ))}
      </div>

      <TodoInput draft={draft} onDraftChange={setDraft} onAdd={addTodo} fixedApplicationId={job.id} />

      {loading ? (
        <PageLoader text="Loading follow-ups..." compact />
      ) : todos.length === 0 ? (
        <p className="mt-4 text-light-muted dark:text-dark-muted text-sm">No follow-ups yet.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
              showApplication={false}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
