import { useCallback, useEffect, useState } from "react";
import { confirmAction } from "../stores/useConfirmStore";
import { Archive, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import API from "../api/axios";
import { showToast, showUndoToast } from "../stores/useToastStore";
import Modal from "../components/UI/Modal";
import PageHeader from "../components/UI/PageHeader";
import PageLoader from "../components/UI/PageLoader";
import { SEGMENTED_TRACK_CLASSES, segmentClasses } from "../components/UI/segmentedClasses";
import DocumentForm from "../components/Documents/DocumentForm";
import OpenDocumentButton from "../components/Documents/OpenDocumentButton";
import { apiErrorMessage, formatFileSize, linkDomain } from "../components/Documents/documentUtils";
import { CATEGORY_BY_VALUE, DOCUMENT_ADD_TABS, DOCUMENT_FILTER_CHIPS } from "../constants/documents";
import { formatShortDate } from "../utils/formatDate";
import { countOf } from "../utils/plural";
import { filterChipClasses } from "../components/UI/filterChipClasses";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [addTab, setAddTab] = useState(null); // "file" | "link" while the Add modal is open
  const [editingDocument, setEditingDocument] = useState(null);

  // Also run after an archive is undone, to put the document back in its place
  const loadDocuments = useCallback(
    () =>
      API.get("/documents", { params: { include_archived: showArchived ? 1 : 0 } })
        .then((res) => setDocuments(res.data.data))
        .catch((err) => console.error(err)),
    [showArchived]
  );

  useEffect(() => {
    loadDocuments().finally(() => setLoading(false));
  }, [loadDocuments]);

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

  const undoArchive = async (item) => {
    try {
      await API.post(`/documents/${item.id}/restore`);
      loadDocuments();
    } catch (err) {
      console.error(err);
      showToast(apiErrorMessage(err, "Couldn't undo archiving the document"));
    }
  };

  // The server deletes a document that isn't attached anywhere, and archives one that is (the applications keep
  // it). A real delete asks first; an archive happens straight away and the toast offers Undo. archive_only makes
  // sure an archive never turns into an unasked delete: if it was detached meanwhile, the server refuses (409) and
  // the reloaded list shows it with Delete.
  const deleteDocument = async (item) => {
    const willArchive = item.applications_count > 0;
    if (!willArchive && !(await confirmAction({ message: `Delete "${item.name}"? This can't be undone.`, confirmLabel: "Delete", danger: true }))) {
      return;
    }

    try {
      const res = await API.delete(`/documents/${item.id}`, { params: willArchive ? { archive_only: 1 } : {} });
      if (res.status === 204 || !showArchived) {
        setDocuments((prev) => prev.filter((other) => other.id !== item.id));
      } else {
        replaceDocument(res.data.data);
      }
      if (res.status !== 204) {
        const count = res.data.data.applications_count;
        showUndoToast(`"${item.name}" archived; it stays on the ${countOf(count, "application")} it was sent with`, () => undoArchive(item));
      }
    } catch (err) {
      console.error(err);
      showToast(apiErrorMessage(err, "Failed to delete document"));
      if (err.response?.status === 409) loadDocuments();
    }
  };

  const restoreDocument = async (item) => {
    try {
      const res = await API.post(`/documents/${item.id}/restore`);
      replaceDocument(res.data.data);
    } catch (err) {
      console.error(err);
      showToast(apiErrorMessage(err, "Failed to restore document"));
    }
  };

  if (loading) {
    return <PageLoader text="Loading documents..." />;
  }

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
      <PageHeader
        title="Documents & links"
        description="Your CVs, cover letters and profile links, ready to attach to applications."
        actions={
          <button type="button" onClick={() => setAddTab("file")} className="btn-primary">
            <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
            Add document or link
          </button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* The type chips scroll sideways rather than wrapping into several rows (p-0.5 keeps the focus ring visible) */}
        <div className="min-w-0 flex-[1_1_320px] overflow-x-auto p-0.5">
          <div role="group" aria-label="Filter by type" className="flex w-max gap-2">
            {DOCUMENT_FILTER_CHIPS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={categoryFilter === value}
                onClick={() => setCategoryFilter(value)}
                className={filterChipClasses(categoryFilter === value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 text-muted-2">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} className="size-5" />
          Show archived
        </label>
      </div>

      {visibleDocuments.length === 0 ? (
        <p className="text-muted">No documents here yet.</p>
      ) : (
        <ul className="divide-y divide-subtle overflow-hidden rounded-2xl border border-line bg-surface">
          {visibleDocuments.map((item) => {
            const { icon: Icon, label } = CATEGORY_BY_VALUE[item.category];
            const details = item.kind === "file" ? `${formatFileSize(item.size)} · ${formatShortDate(item.created_at)}` : linkDomain(item.url);
            const sentWith = item.applications_count > 0 ? `Sent with ${countOf(item.applications_count, "application")}` : "Not sent with an application yet";

            return (
              <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 md:px-6">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-text">
                  <Icon size={20} aria-hidden="true" />
                </span>

                <div className="flex min-w-0 flex-[1_1_200px] flex-col">
                  <strong className="font-semibold break-words">
                    {item.name}
                    {item.archived_at && (
                      <span className="ml-2 rounded-full bg-subtle px-2 text-sm font-semibold text-muted-2">Archived</span>
                    )}
                  </strong>
                  <span className="text-sm text-muted">
                    {label} · {details}
                  </span>
                  <span className="text-sm text-muted">{sentWith}</span>
                </div>

                <div className="flex items-center gap-1">
                  <OpenDocumentButton document={item} />
                  {item.archived_at ? (
                    <button type="button" onClick={() => restoreDocument(item)} className="btn-small ml-1">
                      <RotateCcw size={16} aria-hidden="true" />
                      Restore
                    </button>
                  ) : (
                    <>
                      <button type="button" onClick={() => setEditingDocument(item)} aria-label={`Rename ${item.name}`} title="Rename" className="btn-icon-sm">
                        <Pencil size={18} aria-hidden="true" />
                      </button>
                      {/* Says what it will do: archive one that's attached to applications, delete one that isn't */}
                      {item.applications_count > 0 ? (
                        <button
                          type="button"
                          onClick={() => deleteDocument(item)}
                          aria-label={`Archive ${item.name}`}
                          title="Archive (it stays on its applications)"
                          className="btn-icon-sm"
                        >
                          <Archive size={18} aria-hidden="true" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => deleteDocument(item)}
                          aria-label={`Delete ${item.name}`}
                          title="Delete"
                          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-danger transition-colors hover:bg-rejected-bg"
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {addTab && (
        <Modal title="Add document or link" onClose={() => setAddTab(null)}>
          <div role="group" aria-label="What to add" className={`${SEGMENTED_TRACK_CLASSES} mb-4`}>
            {DOCUMENT_ADD_TABS.map(({ value, label }) => (
              <button key={value} type="button" aria-pressed={addTab === value} onClick={() => setAddTab(value)} className={segmentClasses(addTab === value)}>
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
