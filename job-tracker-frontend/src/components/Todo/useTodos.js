import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useToastStore } from "../../stores/useToastStore";

const showToast = (message) => useToastStore.getState().showToast(message);

// Same order as GET /api/todos: open before done, then due date (undated last), then newest
export function sortTodos(todos) {
  return [...todos].sort((first, second) => {
    if (first.done !== second.done) return first.done ? 1 : -1;
    if (first.due_date !== second.due_date) {
      if (!first.due_date) return 1;
      if (!second.due_date) return -1;
      return first.due_date < second.due_date ? -1 : 1;
    }
    return new Date(second.created_at) - new Date(first.created_at);
  });
}

// The user's to-dos (or one application's) plus actions that keep the list in order.
// Failures are reported with a toast.
export default function useTodos({ job_application_id: applicationId, reloadSignal = 0 } = {}) {
  const [todos, setTodos] = useState([]);
  // Which list is loaded ("all" or an application id): loading until it matches the one asked for,
  // so switching applications shows the loader instead of the previous application's to-dos
  const listKey = applicationId ?? "all";
  const [loadedKey, setLoadedKey] = useState(null);
  const loading = loadedKey !== listKey;

  // Loads the list, and again, quietly, when reloadSignal changes (the Dashboard bumps it when
  // another widget changed a to-do)
  useEffect(() => {
    // Ignore a response that arrives after we've moved on to another application or a newer reload
    let current = true;
    API.get("/todos", { params: applicationId ? { job_application_id: applicationId } : {} })
      .then((res) => current && setTodos(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => current && setLoadedKey(applicationId ?? "all"));
    return () => {
      current = false;
    };
  }, [applicationId, reloadSignal]);

  const replace = (id, todo) =>
    setTodos((currentTodos) => sortTodos(currentTodos.map((existing) => (existing.id === id ? todo : existing))));

  // Returns the saved to-do, or null when it failed
  const addTodo = async (payload) => {
    try {
      const res = await API.post("/todos", payload);
      setTodos((currentTodos) => sortTodos([res.data.data, ...currentTodos]));
      return res.data.data;
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to add to-do");
      return null;
    }
  };

  // Optimistic: the list changes at once and rolls back if the save fails
  const updateTodo = async (todo, changes) => {
    replace(todo.id, { ...todo, ...changes });
    try {
      const res = await API.patch(`/todos/${todo.id}`, changes);
      replace(todo.id, res.data.data);
    } catch (err) {
      console.error(err);
      replace(todo.id, todo);
      showToast("Failed to update to-do");
    }
  };

  const deleteTodo = async (todo) => {
    try {
      await API.delete(`/todos/${todo.id}`);
      setTodos((currentTodos) => currentTodos.filter((existing) => existing.id !== todo.id));
    } catch (err) {
      console.error(err);
      showToast("Failed to delete to-do");
    }
  };

  return { todos, loading, addTodo, updateTodo, deleteTodo };
}
