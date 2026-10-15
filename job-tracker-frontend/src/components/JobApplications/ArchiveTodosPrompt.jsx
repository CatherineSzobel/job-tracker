import { useState } from "react";
import Modal from "../UI/Modal";
import { countOf } from "../../utils/plural";

// Asked when archiving applications that still have open to-dos (setting "ask").
// For a batch, selectedCount > 1 and applicationCount says how many of them have open to-dos.
export default function ArchiveTodosPrompt({ openTodosCount, applicationCount = 1, selectedCount = 1, onConfirm, onCancel }) {
  const [remember, setRemember] = useState(false);
  const isBatch = selectedCount > 1;
  const todosText = countOf(openTodosCount, "open to-do");
  const question = isBatch
    ? `${applicationCount} of these applications ${applicationCount === 1 ? "has" : "have"} ${todosText}. Delete them?`
    : `This application has ${todosText}. Delete them?`;

  return (
    <Modal
      title={isBatch ? `Archive ${selectedCount} applications` : "Archive application"}
      onClose={onCancel}
      maxWidth="max-w-md"
    >
      <p>{question}</p>

      <label className="mt-2 flex min-h-12 items-center gap-3">
        <input type="checkbox" className="size-5" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
        Remember my choice
      </label>

      <div className="flex flex-wrap justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(false, remember)}
          className="btn-primary"
        >
          Keep them
        </button>
        <button
          type="button"
          onClick={() => onConfirm(true, remember)}
          className="btn-danger"
        >
          Delete to-dos
        </button>
      </div>
    </Modal>
  );
}
