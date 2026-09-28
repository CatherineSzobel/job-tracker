import { useEffect, useState } from "react";
import API from "../api/axios";
import PageLoader from "../components/UI/PageLoader";

export default function Links() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/profile/links")
      .then((res) => setLinks(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const addLink = async () => {
    if (!label || !url) return;

    setSaving(true);
    try {
      const res = await API.post("/profile/links", { type: label, url });
      setLinks((prev) => [...prev, res.data.data]);
      setLabel("");
      setUrl("");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add link");
    } finally {
      setSaving(false);
    }
  };

  const removeLink = async (id) => {
    try {
      await API.delete(`/profile/links/${id}`);
      setLinks((prev) => prev.filter((link) => link.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to remove link");
    }
  };

  if (loading) {
    return <PageLoader text="Loading links..." />;
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 sm:mt-10 sm:px-4">
      {/* Header */}
      <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
        Links
      </h1>
      <p className="text-light-muted dark:text-dark-muted mb-6">
        Store all your important links like LinkedIn, GitHub, or your portfolio.
      </p>

      {/* Add Link Form */}
      <div className="bg-light dark:bg-dark-soft rounded-xl p-4 mb-6 shadow-sm border border-border dark:border-dark-subtle transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="input-field"
            placeholder="Label (e.g. GitHub)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <input
            className="input-field"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            className="w-full md:w-auto px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition disabled:opacity-50"
            onClick={addLink}
            disabled={saving}
          >
            {saving ? "Adding..." : "Add Link"}
          </button>
        </div>
      </div>

      {/* Links List */}
      <div className="space-y-3">
        {links.length === 0 && (
          <p className="text-sm text-light-muted dark:text-dark-muted">
            No links added yet.
          </p>
        )}

        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between bg-light dark:bg-dark-soft border border-border dark:border-dark-subtle rounded-lg p-4 transition-colors"
          >
            <div>
              <p className="font-medium text-light-text dark:text-dark-text">
                {link.type}
              </p>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent dark:text-accent-muted hover:underline break-all"
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
