import { useEffect, useState } from "react";
import API from "../../api/axios";
import PageLoader from "../UI/PageLoader";
import DocumentForm from "./DocumentForm";
import { DOCUMENT_CATEGORIES } from "../../constants/documents";

// Active library grouped by category. Archived documents aren't in the library, but stay
// attached (listed separately) unless they're unticked.
export default function DocumentPicker({ attachedDocuments, onSave, onCancel, saving }) {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(() => new Set(attachedDocuments.map((item) => item.id)));
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    API.get("/documents")
      .then((res) => setLibrary(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addUploaded = (created) => {
    setLibrary((prev) => [created, ...prev]);
    setSelectedIds((prev) => new Set(prev).add(created.id));
    setUploading(false);
  };

  const archivedAttached = attachedDocuments.filter((item) => item.archived_at);
  const groups = [
    ...DOCUMENT_CATEGORIES.map(({ value, label }) => ({
      key: value,
      label,
      documents: library.filter((item) => item.category === value),
    })),
    { key: "archived", label: "Archived (still attached)", documents: archivedAttached },
  ].filter((group) => group.documents.length > 0);

  if (loading) {
    return <PageLoader text="Loading documents..." compact />;
  }

  return (
    <div className="space-y-4">
      {groups.length === 0 && !uploading && (
        <p className="text-sm text-light-muted dark:text-dark-muted">Your library is empty. Upload a document to attach it.</p>
      )}

      {groups.map((group) => (
        <fieldset key={group.key}>
          <legend className="text-xs font-semibold uppercase tracking-wide text-light-muted dark:text-dark-muted mb-2">
            {group.label}
          </legend>
          <div className="space-y-1">
            {group.documents.map((item) => (
              <label key={item.id} className="flex items-center gap-2 text-sm text-light-text dark:text-dark-text">
                <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggle(item.id)} />
                {item.name}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {uploading ? (
        <div className="p-4 rounded-lg bg-light-soft dark:bg-dark border border-border dark:border-dark-subtle">
          <DocumentForm mode="file" onSaved={addUploaded} onCancel={() => setUploading(false)} />
        </div>
      ) : (
        <button onClick={() => setUploading(true)} className="text-sm text-accent hover:text-accent-soft transition-colors">
          + Upload new
        </button>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg bg-border dark:bg-dark-subtle text-light-text dark:text-dark-text hover:bg-light-muted/25 dark:hover:bg-dark-subtle/80 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave([...selectedIds])}
          disabled={saving || uploading}
          className="px-6 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
