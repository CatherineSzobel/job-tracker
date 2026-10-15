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
    <div className="flex flex-col gap-4">
      {groups.length === 0 && !uploading && (
        <p className="text-muted">Your library is empty. Upload a document to attach it.</p>
      )}

      {groups.map((group) => (
        <fieldset key={group.key}>
          <legend className="group-label mb-1">
            {group.label}
          </legend>
          <div className="flex flex-col">
            {group.documents.map((item) => (
              <label key={item.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-soft">
                <input type="checkbox" className="size-5 shrink-0" checked={selectedIds.has(item.id)} onChange={() => toggle(item.id)} />
                {item.name}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {uploading ? (
        <div className="rounded-xl border border-line bg-soft p-4">
          <DocumentForm mode="file" onSaved={addUploaded} onCancel={() => setUploading(false)} />
        </div>
      ) : (
        <button type="button" onClick={() => setUploading(true)} className="btn-soft self-start">
          Upload a new file
        </button>
      )}

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave([...selectedIds])}
          disabled={saving || uploading}
          className="btn-primary"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
