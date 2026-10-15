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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === "file" && (
        <div>
          <label htmlFor="document-file" className="input-label">File</label>
          <input id="document-file" type="file" accept={ACCEPTED_FILE_TYPES} onChange={pickFile} className="input-field py-2.5 file:mr-3 file:rounded-md file:border-0 file:bg-accent-soft file:px-3 file:py-1 file:font-semibold file:text-accent-text" required />
          <p className="mt-2 text-sm text-muted">
            Up to {MAX_FILE_SIZE_MB} MB · {ACCEPTED_FILE_EXTENSIONS.join(", ")}
          </p>
        </div>
      )}

      {mode === "link" && (
        <div>
          <label htmlFor="document-url" className="input-label">Link</label>
          <input
            id="document-url"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="document-name" className="input-label">Name</label>
          <input
            id="document-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CV – backend v3"
            className="input-field"
            maxLength={255}
            required
          />
        </div>
        <div>
          <label htmlFor="document-category" className="input-label">Type</label>
          <select id="document-category" value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
            {DOCUMENT_CATEGORIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || (mode === "file" && !file)}
          className="btn-primary"
        >
          {saving ? "Saving…" : mode === "edit" ? "Save changes" : mode === "link" ? "Add link" : "Upload"}
        </button>
      </div>
    </form>
  );
}
