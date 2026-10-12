import { useState } from "react";
import API from "../../api/axios";
import { showToast } from "../../stores/useToastStore";
import { Paperclip } from "lucide-react";
import Card from "../UI/Card";
import Modal from "../UI/Modal";
import DocumentPicker from "./DocumentPicker";
import OpenDocumentButton from "./OpenDocumentButton";
import { apiErrorMessage } from "./documentUtils";
import { CATEGORY_BY_VALUE } from "../../constants/documents";

// "Documents sent": the documents attached to one job; Attach opens the picker
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
    <Card
      title="Documents sent"
      icon={Paperclip}
      action={
        <button type="button" className="btn-soft" onClick={() => setPicking(true)}>
          Attach
        </button>
      }
    >
      {documents.length ? (
        <ul className="-my-2 flex flex-col divide-y divide-subtle">
          {documents.map((item) => {
            const { icon: Icon, label } = CATEGORY_BY_VALUE[item.category];
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2">
                <Icon size={20} aria-hidden="true" className="shrink-0 text-accent-text" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="break-words">{item.name}</span>
                  <span className="text-sm text-muted">
                    {label}
                    {item.archived_at && " · archived"}
                  </span>
                </span>
                <OpenDocumentButton document={item} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted">No documents attached yet.</p>
      )}

      {picking && (
        <Modal title="Documents sent with this application" onClose={() => setPicking(false)}>
          <DocumentPicker attachedDocuments={documents} onSave={save} onCancel={() => setPicking(false)} saving={saving} />
        </Modal>
      )}
    </Card>
  );
}
