import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Pencil, Pin, PinOff, Plus, StickyNote, Trash2 } from "lucide-react";
import API from "../api/axios";
import { showToast } from "../stores/useToastStore";
import Card from "./UI/Card";
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

    // "6 Oct 2026"
    const formatDate = (dateString) => format(new Date(dateString), "d MMM yyyy");

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
            showToast("Failed to add note");
        }
    };

    const deleteNote = async (id) => {
        try {
            await API.delete(`/notes/${id}`);
            setNotes((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error(err);
            showToast("Failed to delete note");
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
            showToast("Failed to update note");
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
            showToast("Failed to update pinned state");
        }
    };

    const addNoteButton = (
        <button type="button" onClick={() => setShowAddForm((prev) => !prev)} aria-expanded={showAddForm} className="btn-small">
            {showAddForm ? (
                "Cancel"
            ) : (
                <>
                    <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                    Add note
                </>
            )}
        </button>
    );

    return (
        <Card title="Notes" icon={StickyNote} action={addNoteButton}>
            {showAddForm && (
                <div className="flex flex-col gap-4 rounded-xl border border-line bg-soft p-4">
                    <div>
                        <label htmlFor="new-note-title" className="input-label">Title</label>
                        <input
                            id="new-note-title"
                            type="text"
                            className="input-field"
                            value={newNote.title}
                            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                        />
                    </div>
                    <div>
                        <label htmlFor="new-note-content" className="input-label">Note</label>
                        <textarea
                            id="new-note-content"
                            rows={3}
                            className="input-field"
                            value={newNote.content}
                            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        />
                    </div>
                    <button type="button" onClick={addNote} disabled={!newNote.title.trim()} className="btn-primary self-start">
                        Save note
                    </button>
                </div>
            )}

            {loading ? (
                <PageLoader text="Loading notes..." compact />
            ) : notes.length === 0 ? (
                <p className="py-4 text-center text-muted">No notes yet.</p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {sortedNotes.map((note) => {
                        const isEditing = editingId === note.id;
                        return (
                            <li key={note.id} className="flex flex-col gap-2 rounded-xl border border-note-line bg-note-bg p-4">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            aria-label="Note title"
                                            className="input-field"
                                            value={editingNote.title}
                                            onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                                        />
                                        <textarea
                                            aria-label="Note"
                                            rows={3}
                                            className="input-field"
                                            value={editingNote.content}
                                            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => saveEdit(note.id)} className="btn-primary min-h-10 text-sm">
                                                Save
                                            </button>
                                            <button type="button" onClick={() => setEditingId(null)} className="btn-small">
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-2">
                                            <div className="flex min-w-0 flex-1 flex-col">
                                                <strong className="font-semibold break-words">{note.title}</strong>
                                                {note.is_pinned && (
                                                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-note-fg">
                                                        <Pin size={14} aria-hidden="true" />
                                                        Pinned
                                                    </span>
                                                )}
                                            </div>
                                            <div className="-my-2 -mr-2 flex shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => togglePinned(note)}
                                                    aria-label={note.is_pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
                                                    title={note.is_pinned ? "Unpin" : "Pin"}
                                                    className="btn-icon-sm text-note-fg"
                                                >
                                                    {note.is_pinned ? <PinOff size={18} aria-hidden="true" /> : <Pin size={18} aria-hidden="true" />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(note)}
                                                    aria-label={`Edit ${note.title}`}
                                                    title="Edit"
                                                    className="btn-icon-sm text-note-fg"
                                                >
                                                    <Pencil size={18} aria-hidden="true" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteNote(note.id)}
                                                    aria-label={`Delete ${note.title}`}
                                                    title="Delete"
                                                    className="inline-flex size-10 items-center justify-center rounded-lg text-danger transition-colors hover:bg-rejected-bg"
                                                >
                                                    <Trash2 size={18} aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                        {note.content && <p className="whitespace-pre-wrap">{note.content}</p>}
                                        <span className="text-sm text-note-fg">{formatDate(note.created_at)}</span>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
}

