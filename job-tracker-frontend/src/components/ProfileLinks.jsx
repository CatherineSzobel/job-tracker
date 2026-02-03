// src/components/ProfileLinks.jsx
import { useState } from "react";
import API from "../api/axios";

export default function ProfileLinks({ links, onChange }) {
    const [newLink, setNewLink] = useState({ type: "linkedin", url: "" });

    const addLink = async () => {
        const res = await API.post("/profile/links", newLink);
        onChange([...links, res.data.data]);
        setNewLink({ type: "linkedin", url: "" });
    };

    const removeLink = async (id) => {
        await API.delete(`/profile/links/${id}`);
        onChange(links.filter(l => l.id !== id));
    };

    return (
        <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Links</h2>

            <ul className="space-y-2">
                {links.map(link => (
                    <li key={link.id} className="flex gap-2 items-center">
                        <span className="text-sm text-gray-500 w-24">{link.type}</span>
                        <a
                            href={link.url}
                            target="_blank"
                            className="flex-1 text-blue-600 underline"
                        >
                            {link.url}
                        </a>
                        <button
                            className="text-red-500 text-sm"
                            onClick={() => removeLink(link.id)}
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            <div className="flex gap-2 mt-4">
                <select
                    value={newLink.type}
                    onChange={e =>
                        setNewLink({ ...newLink, type: e.target.value })
                    }
                    className="select"
                >
                    <option value="linkedin">LinkedIn</option>
                    <option value="github">GitHub</option>
                    <option value="portfolio">Portfolio</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                </select>

                <input
                    className="input flex-1"
                    placeholder="https://..."
                    value={newLink.url}
                    onChange={e =>
                        setNewLink({ ...newLink, url: e.target.value })
                    }
                />

                <button className="btn btn-primary" onClick={addLink}>
                    Add
                </button>
            </div>
        </div>
    );
}
