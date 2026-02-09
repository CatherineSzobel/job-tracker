export default function TodoInput({ value, onChange, onAdd }) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Add a new task..."
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onAdd()}
        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition"
      />
      <button
        onClick={onAdd}
        disabled={!value.trim()}
        className="bg-accent hover:bg-accent-soft disabled:opacity-50 disabled:cursor-not-allowed text-surface px-4 py-2 rounded-lg transition"
      >
        Add
      </button>
    </div>
  );
}
