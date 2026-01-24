import { useState } from "react";
export default function TodoList() {
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");

    const addTodo = () => {
        if (!newTodo.trim()) return;
        setTodos(prev => [{ id: Date.now(), text: newTodo, done: false }, ...prev]);
        setNewTodo("");
    };

    const toggleTodo = id => {
        setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, done: !todo.done } : todo));
    };

    const deleteTodo = id => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };

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
                        <span onClick={() => toggleTodo(todo.id)} className="cursor-pointer">
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
