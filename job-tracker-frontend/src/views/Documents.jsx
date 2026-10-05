import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import API from "../api/axios";
import Modal from "../components/UI/Modal";
import PageLoader from "../components/UI/PageLoader";
import DocumentForm from "../components/Documents/DocumentForm";
import OpenDocumentButton from "../components/Documents/OpenDocumentButton";
import { apiErrorMessage, formatFileSize, linkDomain } from "../components/Documents/documentUtils";
import { CATEGORY_BY_VALUE, DOCUMENT_CATEGORIES } from "../constants/documents";

const ADD_TABS = [
  { value: "file", label: "Upload file" },
  { value: "link", label: "Add link" },
];

const CHIP_CLASSES = "px-3 py-1 rounded-full text-sm transition-colors";
const ACTIVE_CHIP = "bg-accent text-white";
const INACTIVE_CHIP = "bg-light dark:bg-dark-soft text-light-muted dark:text-dark-muted border border-border dark:border-dark-subtle hover:text-accent";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [addTab, setAddTab] = useState(null); // "file" | "link" while the Add modal is open
  const [editingDocument, setEditingDocument] = useState(null);

  useEffect(() => {
    API.get("/documents", { params: { include_archived: showArchived ? 1 : 0 } })
      .then((res) => setDocuments(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [showArchived]);

  const visibleDocuments =
    categoryFilter === "all" ? documents : documents.filter((item) => item.category === categoryFilter);

  const replaceDocument = (updated) =>
    setDocuments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));

  const addDocument = (created) => {
    setDocuments((prev) => [created, ...prev]);
    setAddTab(null);
  };

  const saveEdit = (updated) => {
    replaceDocument(updated);
    setEditingDocument(null);
  };

  const deleteDocument = async (item) => {
    const count = item.applications_count;
    const message = count > 0
      ? `"${item.name}" is attached to ${count} application${count === 1 ? "" : "s"}, so it will be archived instead of deleted. It stays visible on those applications and you can restore it later.`
      : `Delete "${item.name}"? This can't be undone.`;
    if (!window.confirm(message)) return;

    try {
      const res = await API.delete(`/documents/${item.id}`);
      if (res.status === 204 || !showArchived) {
        setDocuments((prev) => prev.filter((other) => other.id !== item.id));
      } else {
        replaceDocument(res.data.data);
      }
    } catch (err) {
      console.error(err);
      alert(apiErrorMessage(err, "Failed to delete document"));
    }
  };

  const restoreDocument = async (item) => {
    try {
      const res = await API.post(`/documents/${item.id}/restore`);
      replaceDocument(res.data.data);
    } catch (err) {
      console.error(err);
      alert(apiErrorMessage(err, "Failed to restore document"));
    }
  };

  if (loading) {
    return <PageLoader text="Loading documents..." />;
  }

  return (
    <div className="max-w-4xl mx-auto mt-4 sm:mt-10 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">Documents & links</h1>
          <p className="text-light-muted dark:text-dark-muted">
            Your CVs, cover letters and profile links, ready to attach to applications.
          </p>
        </div>
        <button
          onClick={() => setAddTab("file")}
          className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition shrink-0"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`${CHIP_CLASSES} ${categoryFilter === "all" ? ACTIVE_CHIP : INACTIVE_CHIP}`}
        >
          All
        </button>
        {DOCUMENT_CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setCategoryFilter(value)}
            className={`${CHIP_CLASSES} ${categoryFilter === value ? ACTIVE_CHIP : INACTIVE_CHIP}`}
          >
            {label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      {/* List */}
      <div className="space-y-3">
        {visibleDocuments.length === 0 && (
          <p className="text-sm text-light-muted dark:text-dark-muted">No documents here yet.</p>
        )}

        {visibleDocuments.map((item) => {
          const { icon: Icon, label } = CATEGORY_BY_VALUE[item.category];
          const details = item.kind === "file"
            ? `${formatFileSize(item.size)} · ${new Date(item.created_at).toLocaleDateString()}`
            : linkDomain(item.url);

          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 bg-light dark:bg-dark-soft border border-border dark:border-dark-subtle rounded-lg p-4 transition-colors"
            >
              <Icon size={20} className="text-accent dark:text-accent-muted shrink-0" />

              <div className="min-w-0 flex-1">
                <p className="font-medium text-light-text dark:text-dark-text break-words">
                  {item.name}
                  {item.archived_at && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-light-soft dark:bg-dark-subtle text-light-muted dark:text-dark-muted">
                      archived
                    </span>
                  )}
                </p>
                <p className="text-sm text-light-muted dark:text-dark-muted">{label} · {details}</p>
              </div>

              <div className="flex flex-wrap items-center gap-4 shrink-0">
                <OpenDocumentButton document={item} />
                {item.archived_at ? (
                  <button onClick={() => restoreDocument(item)} className="text-sm text-accent hover:text-accent-soft transition-colors">
                    Restore
                  </button>
                ) : (
                  <>
                    <button onClick={() => setEditingDocument(item)} className="text-sm text-light-muted dark:text-dark-muted hover:text-accent transition-colors">
                      Rename
                    </button>
                    <button
                      onClick={() => deleteDocument(item)}
                      className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {addTab && (
        <Modal title="Add document" onClose={() => setAddTab(null)}>
          <div className="flex gap-2 mb-4">
            {ADD_TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setAddTab(value)}
                className={`${CHIP_CLASSES} ${addTab === value ? ACTIVE_CHIP : INACTIVE_CHIP}`}
              >
                {label}
              </button>
            ))}
          </div>
          {/* key resets the form when switching tabs */}
          <DocumentForm key={addTab} mode={addTab} onSaved={addDocument} onCancel={() => setAddTab(null)} />
        </Modal>
      )}

      {editingDocument && (
        <Modal title="Rename document" onClose={() => setEditingDocument(null)}>
          <DocumentForm
            mode="edit"
            existingDocument={editingDocument}
            onSaved={saveEdit}
            onCancel={() => setEditingDocument(null)}
          />
        </Modal>
      )}
    </div>
  );
}
