import { useEffect, useState } from "react";
import API from "../api/axios";

export default function TodoList() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [loading, setLoading] = useState(true);

    // Load todos
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
        try {
            const res = await API.put(`/todos/${todo.id}`, {
                done: !todo.done,
            });

            setTodos(prev =>
                prev.map(t => (t.id === res.data.id ? res.data : t))
            );
        } catch (err) {
            console.error(err);
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

    if (loading) return <p className="text-sm text-gray-500">Loading todos…</p>;

    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="New todo..."
                    value={newTodo}
                    onChange={e => setNewTodo(e.target.value)}
                    className="flex-1 border rounded px-2 py-1"
                />
                <button
                    onClick={addTodo}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                >
                    Add
                </button>
            </div>

            <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {todos.map(todo => (
                    <li
                        key={todo.id}
                        className={`flex justify-between items-center px-2 py-1 border rounded ${todo.done ? "line-through text-gray-400" : ""
                            }`}
                    >
                        <span
                            onClick={() => toggleTodo(todo)}
                            className="cursor-pointer"
                        >
                            {todo.text}
                        </span>
                        <button
                            onClick={() => deleteTodo(todo.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
