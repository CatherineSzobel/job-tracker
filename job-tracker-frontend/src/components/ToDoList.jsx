import { useEffect, useState } from "react";
import API from "../api/axios";
import TodoInput from "./Todo/TodoInput";
import TodoItem from "./Todo/TodoItem";
import TodoEmptyState from "./Todo/TodoEmptyState";

// utils
function formatTodoDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();

    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
        (today - date) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-CA"); // YYYY-MM-DD
}

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
            console.error("Failed to add todo:", err.response?.data || err.message);
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

    const sortedTodos = [...todos].sort((a, b) => {
        if (a.done === b.done) return 0;
        return a.done ? 1 : -1; 
    });

    if (loading) {
        return <p className="text-sm text-gray-500">Loading todos…</p>;
    }

    return (
        <div className="flex flex-col gap-4">
            <TodoInput
                value={newTodo}
                onChange={setNewTodo}
                onAdd={addTodo}
            />

            {todos.length === 0 ? (
                <TodoEmptyState />
            ) : (
                <ul className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                    {sortedTodos.map(todo => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={toggleTodo}
                            onDelete={deleteTodo}
                            formatDate={formatTodoDate}
                        />
                    ))}
                </ul>
            )}
        </div >
    );
}
