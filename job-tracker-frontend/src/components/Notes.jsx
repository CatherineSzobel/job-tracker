import { useEffect, useState } from "react";
import { StickyNote } from "lucide-react";
import API from "../api/axios";
import PageLoader from "./UI/PageLoader";

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState({ title: "", content: "" });
    const [editingId, setEditingId] = useState(null);
    const [editingNote, setEditingNote] = useState({
        title: "",
        content: "",
        is_pinned: false,
    });
    const [showAddForm, setShowAddForm] = useState(false);

    // Fetch notes
    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await API.get("/notes");
            setNotes(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    // Sort notes
    const sortedNotes = [...notes].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
            return a.is_pinned ? -1 : 1;
        }
        return new Date(b.created_at) - new Date(a.created_at);
    });

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    // Add note
    const addNote = async () => {
        if (!newNote.title.trim()) return;

        try {
            const res = await API.post("/notes", {
                ...newNote,
                is_pinned: false,
            });

            setNotes((prev) => [...prev, res.data.data]);
            setNewNote({ title: "", content: "" });
            setShowAddForm(false); // collapse after adding
        } catch (err) {
            console.error("Failed to add note:", err.response?.data || err.message);
            alert("Failed to add note");
        }
    };

    const deleteNote = async (id) => {
        try {
            await API.delete(`/notes/${id}`);
            setNotes((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete note");
        }
    };

    const startEditing = (note) => {
        setEditingId(note.id);
        setEditingNote({
            title: note.title,
            content: note.content,
            is_pinned: note.is_pinned,
        });
    };

    const saveEdit = async (id) => {
        if (!editingNote.title.trim()) return;

        try {
            const res = await API.put(`/notes/${id}`, editingNote);
            setNotes((prev) =>
                prev.map((n) => (n.id === id ? res.data.data : n))
            );
            setEditingId(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update note");
        }
    };

    const togglePinned = async (note) => {
        try {
            const res = await API.put(`/notes/${note.id}`, {
                ...note,
                is_pinned: !note.is_pinned,
            });

            setNotes((prev) =>
                prev.map((n) => (n.id === note.id ? res.data.data : n))
            );
        } catch (err) {
            console.error(err);
            alert("Failed to update pinned state");
        }
    };

    if (loading) {
        return <PageLoader text="Loading notes..." compact />
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="card-title">
                    <StickyNote size={18} aria-hidden="true" />
                    Notes
                </h2>

                <button
                    onClick={() => setShowAddForm((prev) => !prev)}
                    className="btn-small"
                >
                    {showAddForm ? "Cancel" : "Add note"}
                </button>
            </div>

            {/* Collapsible Add Form */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${showAddForm ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
            >
                <div className="flex flex-col gap-3 p-3 text-dark dark:text-light bg-light dark:bg-dark-soft border border-border dark:border-dark-subtle rounded-xl mt-2">
                    <input
                        type="text"
                        placeholder="Note title"
                        className="border p-2 rounded-md text-sm"
                        value={newNote.title}
                        onChange={(e) =>
                            setNewNote({ ...newNote, title: e.target.value })
                        }
                    />

                    <textarea
                        placeholder="Note content"
                        className="border p-2 rounded-md text-sm"
                        value={newNote.content}
                        onChange={(e) =>
                            setNewNote({ ...newNote, content: e.target.value })
                        }
                    />

                    <button
                        onClick={addNote}
                        className="px-4 py-2 bg-accent text-white rounded-md hover:opacity-90 transition text-sm"
                    >
                        Save Note
                    </button>
                </div>
            </div>

            {/* Notes List */}
            {notes.length === 0 ? (
                <div className="text-center text-light-muted text-sm py-6">
                    📝 No notes yet
                </div>
            ) : (
                <ul className="flex flex-col gap-3 flex-1 overflow-y-auto">
                    {sortedNotes.map((note) => (
                        <li
                            key={note.id}
                            className={`rounded-xl p-4 transition-all duration-200 
              ${note.is_pinned
                                    ? "bg-yellow-100 border border-yellow-500 dark:bg-yellow-500/20 dark:border-yellow-700"
                                    : "bg-light dark:bg-dark-soft border border-border dark:border-dark-subtle"
                                } 
              hover:shadow-md`}
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex flex-col flex-1">
                                    {editingId === note.id ? (
                                        <input
                                            type="text"
                                            className="border p-1 rounded-md text-sm"
                                            value={editingNote.title}
                                            onChange={(e) =>
                                                setEditingNote({
                                                    ...editingNote,
                                                    title: e.target.value,
                                                })
                                            }
                                        />
                                    ) : (
                                        <>
                                            <strong className="text-sm font-semibold text-light-text dark:text-white">
                                                {note.title}
                                            </strong>

                                            {note.is_pinned && (
                                                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                                    📌 Pinned
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-1 shrink-0">
                                    <button
                                        className="btn-small"
                                        onClick={() => togglePinned(note)}
                                    >
                                        {note.is_pinned ? "Unpin" : "Pin"}
                                    </button>

                                    <button
                                        className="btn-small"
                                        onClick={() => (editingId === note.id ? saveEdit(note.id) : startEditing(note))}
                                    >
                                        {editingId === note.id ? "Save" : "Edit"}
                                    </button>

                                    <button
                                        className="btn-small-danger"
                                        onClick={() => deleteNote(note.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="mt-2 flex flex-col gap-1">
                                {editingId === note.id ? (
                                    <textarea
                                        className="border p-2 rounded-md w-full text-sm"
                                        value={editingNote.content}
                                        onChange={(e) =>
                                            setEditingNote({
                                                ...editingNote,
                                                content: e.target.value,
                                            })
                                        }
                                    />
                                ) : (
                                    <>
                                        <p className="text-sm text-light-muted dark:text-dark-muted whitespace-pre-wrap">
                                            {note.content}
                                        </p>
                                        <p className="text-xs text-light-muted">
                                            {formatDate(note.created_at)}
                                        </p>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}