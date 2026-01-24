// src/views/Profile.jsx
import { useState, useEffect } from "react";
import API from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState({ name: "", url: "" });

  useEffect(() => {
    // Fetch user info and links (mock for now)
    API.get("/user-profile")
      .then(res => {
        setUser(res.data.user);
        setLinks(res.data.links || []);
      })
      .catch(err => console.error(err));
  }, []);

  const addLink = () => {
    if (!newLink.name.trim() || !newLink.url.trim()) return;
    setLinks(prev => [...prev, { id: Date.now(), ...newLink }]);
    setNewLink({ name: "", url: "" });
  };

  const deleteLink = id => setLinks(prev => prev.filter(link => link.id !== id));

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {user && (
        <div className="mb-6">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Links</h2>

        <ul className="mb-2">
          {links.map(link => (
            <li key={link.id} className="flex justify-between items-center mb-1">
              <a href={link.url} target="_blank" className="text-blue-600 hover:underline">{link.name}</a>
              <button
                onClick={() => deleteLink(link.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Link name"
            value={newLink.name}
            onChange={e => setNewLink(prev => ({ ...prev, name: e.target.value }))}
            className="border rounded px-2 py-1 flex-1"
          />
          <input
            type="url"
            placeholder="URL"
            value={newLink.url}
            onChange={e => setNewLink(prev => ({ ...prev, url: e.target.value }))}
            className="border rounded px-2 py-1 flex-1"
          />
          <button
            onClick={addLink}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
