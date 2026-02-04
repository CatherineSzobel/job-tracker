import { useEffect, useState } from "react";
import API from "../api/axios";

export default function TodoList() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/todos")
            .then(res => {
                const todosArray = Array.isArray(res.data)
                    ? res.data
                    : res.data.data;

                setTodos(todosArray ?? []);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const addTodo = async () => {
        if (!newTodo.trim()) return;

        try {
            const res = await API.post("/todos", {
                text: newTodo,
            });

            setTodos(prev => [res.data, ...prev]);
            setNewTodo("");
        } catch (err) {
            console.error(err);
            alert("Failed to add todo");
        }
    };

    const toggleTodo = async todo => {
        const previousTodos = [...todos];
        setTodos(prev =>
            prev.map(t =>
                t.id === todo.id ? { ...t, done: !t.done } : t
            )
        );
        try {
            await API.put(`/todos/${todo.id}`, {
                done: !todo.done,
            });
        } catch (err) {
            console.error(err);
            setTodos(previousTodos);
            alert("Failed to update todo");
        }
    };

    const deleteTodo = async id => {
        try {
            await API.delete(`/todos/${id}`);
            setTodos(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete todo");
        }
    };

    function formatTodoDate(dateString) {
        const date = new Date(dateString)
        const today = new Date()

        // normalize to midnight
        date.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)

        const diffDays = Math.round(
            (today - date) / (1000 * 60 * 60 * 24)
        )

        if (diffDays === 0) return "today"
        if (diffDays === 1) return "yesterday"
        if (diffDays < 7) return `${diffDays} days ago`

        return date.toLocaleDateString("en-CA") // YYYY-MM-DD
    }

    if (loading) return <p className="text-sm text-gray-500">Loading todos…</p>;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTodo}
                    onChange={e => setNewTodo(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition"
                />
                <button
                    onClick={addTodo}
                    className="bg-accent hover:bg-accent-soft text-surface px-4 py-2 rounded-lg transition"
                >
                    Add
                </button>
            </div>

            <ul className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                {todos.map(todo => (
                    <li
                        key={todo.id}
                        className={`flex items-center gap-3 px-3 py-2 border rounded-lg transition
                            ${todo.done
                                ? "line-through text-secondary-text bg-secondary-soft"
                                : "bg-surface hover:bg-surface-hover"
                            }`}
                    >

                        <input
                            type="checkbox"
                            checked={todo.done}
                            onChange={() => toggleTodo(todo)}
                            className="cursor-pointer"
                        />

                        <span className="flex-1 cursor-pointer truncate">
                            {todo.text}
                        </span>

                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                {formatTodoDate(todo.created_at)}
                            </span>

                            <button
                                onClick={() => alert("Calendar integration coming soon!")}
                                className="px-3 py-1 text-xs rounded-full border bg-blue-50 text-blue-600 hover:bg-blue-100 transition whitespace-nowrap"
                            >
                                Add to calendar
                            </button>

                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                                ✕
                            </button>
                        </div>
                    </li>
                ))}
            </ul>

        </div>
    );
}
