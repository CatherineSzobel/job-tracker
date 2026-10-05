import { useState } from "react";
import API from "../../api/axios";
import { showToast } from "../../stores/useToastStore";
import Modal from "../UI/Modal";
import DocumentPicker from "./DocumentPicker";
import OpenDocumentButton from "./OpenDocumentButton";
import { apiErrorMessage } from "./documentUtils";
import { CATEGORY_BY_VALUE } from "../../constants/documents";

// "Sent with this application": the documents attached to one job
export default function AttachedDocuments({ jobId, documents, onChange }) {
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async (documentIds) => {
    setSaving(true);
    try {
      const res = await API.put(`/job-applications/${jobId}/documents`, { document_ids: documentIds });
      onChange(res.data.data);
      setPicking(false);
    } catch (err) {
      console.error(err);
      showToast(apiErrorMessage(err, "Failed to save documents"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-light-soft dark:bg-dark-soft rounded-xl p-6 mb-6 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-accent dark:text-accent">Sent with this application</h2>
        <button
          className="text-sm text-accent dark:text-accent hover:text-accent-soft dark:hover:text-accent-soft transition-colors"
          onClick={() => setPicking(true)}
        >
          Edit
        </button>
      </div>

      {documents.length ? (
        <ul className="flex flex-col gap-2">
          {documents.map((item) => {
            const { icon: Icon, label } = CATEGORY_BY_VALUE[item.category];
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-3">
                <Icon size={18} className="text-accent dark:text-accent-muted shrink-0" />
                <span className="text-light-text dark:text-dark-text break-words">{item.name}</span>
                <span className="text-xs text-light-muted dark:text-dark-muted">{label}</span>
                {item.archived_at && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-light dark:bg-dark-subtle text-light-muted dark:text-dark-muted">
                    archived
                  </span>
                )}
                <span className="ml-auto">
                  <OpenDocumentButton document={item} />
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-light-muted dark:text-dark-muted text-sm">No documents attached yet.</p>
      )}

      {picking && (
        <Modal title="Sent with this application" onClose={() => setPicking(false)}>
          <DocumentPicker attachedDocuments={documents} onSave={save} onCancel={() => setPicking(false)} saving={saving} />
        </Modal>
      )}
    </div>
  );
}
