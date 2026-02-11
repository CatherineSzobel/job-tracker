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
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Links
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Store all your important links like LinkedIn, GitHub, or your portfolio.
      </p>

      {/* Add Link Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Label (e.g. GitHub)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <input
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            className="w-full md:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            onClick={addLink}
          >
            Add Link
          </button>
        </div>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No links added yet.
          </p>
        )}

        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {link.label}
              </p>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {link.url}
              </a>
            </div>

            <button
              className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
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
