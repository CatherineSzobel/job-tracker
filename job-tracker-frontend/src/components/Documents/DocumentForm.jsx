import { useState } from "react";
import API from "../../api/axios";
import {
  ACCEPTED_FILE_TYPES,
  ACCEPTED_FILE_EXTENSIONS,
  DEFAULT_FILE_CATEGORY,
  DEFAULT_LINK_CATEGORY,
  DOCUMENT_CATEGORIES,
  MAX_FILE_SIZE_MB,
} from "../../constants/documents";
import { apiErrorMessage, checkFile, fileNameWithoutExtension } from "./documentUtils";

// mode "file" uploads, "link" adds a URL, "edit" renames/re-categorises existingDocument (the file/URL is fixed)
export default function DocumentForm({ mode, existingDocument, onSaved, onCancel }) {
  const [name, setName] = useState(existingDocument?.name ?? "");
  const [category, setCategory] = useState(
    existingDocument?.category ?? (mode === "link" ? DEFAULT_LINK_CATEGORY : DEFAULT_FILE_CATEGORY)
  );
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const pickFile = (e) => {
    const picked = e.target.files[0] ?? null;
    setError("");
    if (picked) {
      const problem = checkFile(picked);
      if (problem) {
        setError(problem);
        setFile(null);
        e.target.value = "";
        return;
      }
      if (!name) setName(fileNameWithoutExtension(picked.name));
    }
    setFile(picked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let res;
      if (mode === "edit") {
        res = await API.patch(`/documents/${existingDocument.id}`, { name, category });
      } else if (mode === "link") {
        res = await API.post("/documents", { kind: "link", name, category, url });
      } else {
        const formData = new FormData();
        formData.append("kind", "file");
        formData.append("name", name);
        formData.append("category", category);
        formData.append("file", file);
        res = await API.post("/documents", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSaved(res.data.data);
    } catch (err) {
      console.error(err);
      setError(apiErrorMessage(err, "Failed to save document"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "file" && (
        <div>
          <label className="input-label">File</label>
          <input type="file" accept={ACCEPTED_FILE_TYPES} onChange={pickFile} className="input-field" required />
          <p className="mt-1 text-xs text-light-muted dark:text-dark-muted">
            Up to {MAX_FILE_SIZE_MB} MB · {ACCEPTED_FILE_EXTENSIONS.join(", ")}
          </p>
        </div>
      )}

      {mode === "link" && (
        <div>
          <label className="input-label">URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="input-field"
            maxLength={255}
            required
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="input-label">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CV – backend v3"
            className="input-field"
            maxLength={255}
            required
          />
        </div>
        <div>
          <label className="input-label">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
            {DOCUMENT_CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg bg-border dark:bg-dark-subtle text-light-text dark:text-dark-text hover:bg-light-muted/25 dark:hover:bg-dark-subtle/80 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || (mode === "file" && !file)}
          className="px-6 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "edit" ? "Save" : mode === "link" ? "Add link" : "Upload"}
        </button>
      </div>
    </form>
  );
}
