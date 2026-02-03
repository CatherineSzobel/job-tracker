import { useState } from "react";

export default function Links() {
  const [links, setLinks] = useState([]);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  const addLink = () => {
    if (!label || !url) return;

    setLinks((prev) => [
      ...prev,
      {
        id: Date.now(),
        label,
        url,
      },
    ]);

    setLabel("");
    setUrl("");
  };

  const removeLink = (id) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-2">Links</h1>
      <p className="text-gray-500 mb-6">
        Store all your important links like LinkedIn, GitHub, or your portfolio.
      </p>

      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="input p-2"
            placeholder="Label (e.g. GitHub)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <input
            className="input p-2"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            className="btn btn-primary w-full md:w-auto border rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            onClick={addLink}
          >
            Add Link
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {links.length === 0 && (
          <p className="text-sm text-gray-400">
            No links added yet.
          </p>
        )}

        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between bg-white border rounded-lg p-4"
          >
            <div>
              <p className="font-medium">{link.label}</p>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {link.url}
              </a>
            </div>

            <button
              className="text-sm text-red-500 hover:text-red-600"
              onClick={() => removeLink(link.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
