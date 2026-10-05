import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useToastStore } from "../../stores/useToastStore";
import { isoDateFromToday } from "../../utils/dueDate";

const showToast = (message) => useToastStore.getState().showToast(message);
const byDaysSinceUpdate = (first, second) => second.days_since_update - first.days_since_update;
const byDueDate = (first, second) => (first.due_date < second.due_date ? -1 : 1);

// GET /api/reminders plus the card's actions. Every action is optimistic: the row disappears at once
// and comes back (with a toast) if the request fails. onTodosChanged() runs after a to-do was saved,
// so the Dashboard can reload the Quick Todo widget.
export default function useReminders(onTodosChanged) {
  const [applications, setApplications] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  // "today" or "permanent", for the Dismiss button's tooltip (null until the settings are loaded)
  const dismissMode = useSettingsStore((state) => state.settings?.reminder_dismiss_mode ?? null);

  useEffect(() => {
    API.get("/reminders")
      .then((res) => {
        setApplications(res.data.data.applications);
        setTodos(res.data.data.todos);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
    loadSettings().catch((err) => console.error(err));
  }, [loadSettings]);

  const dismiss = async (job) => {
    setApplications((currentJobs) => currentJobs.filter((existing) => existing.id !== job.id));
    try {
      await API.post(`/job-applications/${job.id}/dismiss-reminder`);
    } catch (err) {
      console.error(err);
      setApplications((currentJobs) => [...currentJobs, job].sort(byDaysSinceUpdate));
      showToast("Failed to dismiss the reminder");
    }
  };

  // Done, or moved to tomorrow: either way it's no longer due today
  const resolveTodo = async (todo, changes) => {
    setTodos((currentTodos) => currentTodos.filter((existing) => existing.id !== todo.id));
    try {
      await API.patch(`/todos/${todo.id}`, changes);
      onTodosChanged?.();
    } catch (err) {
      console.error(err);
      setTodos((currentTodos) => [...currentTodos, todo].sort(byDueDate));
      showToast("Failed to update the to-do");
    }
  };

  return {
    applications,
    todos,
    loading,
    dismissMode,
    dismiss,
    markTodoDone: (todo) => resolveTodo(todo, { done: true }),
    postponeTodo: (todo) => resolveTodo(todo, { due_date: isoDateFromToday(1) }),
  };
}
