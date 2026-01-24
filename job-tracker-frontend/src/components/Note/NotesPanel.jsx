import { useState, useEffect } from "react";
import API from "../../api/axios";

export default function NotesPanel({ jobId, initialNotes }) {
  const [notes, setNotes] = useState(initialNotes || []); // fallback to empty array
  const [newNote, setNewNote] = useState("");

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote) return;

    const res = await API.post(`/job-applications/${jobId}/notes`, { content: newNote });
    setNotes([...notes, res.data]);
    setNewNote("");
  };

  return (
    <div className="mt-2 border-t pt-2">
      <h3 className="font-semibold mb-1">Notes</h3>
      <ul>
        {notes.map(note => <li key={note.id}>{note.content}</li>)}
      </ul>
      <form onSubmit={addNote} className="mt-2 flex gap-2">
        <input
          className="border p-1 flex-1"
          placeholder="Add a note..."
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-2 rounded">Add</button>
      </form>
    </div>
  );
}

