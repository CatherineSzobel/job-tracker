import { useState } from "react";
import Modal from "../UI/Modal";

// Asked when archiving applications that still have open to-dos (setting "ask").
// For a batch, selectedCount > 1 and applicationCount says how many of them have open to-dos.
export default function ArchiveTodosPrompt({ openTodosCount, applicationCount = 1, selectedCount = 1, onConfirm, onCancel }) {
  const [remember, setRemember] = useState(false);
  const isBatch = selectedCount > 1;
  const todosText = `${openTodosCount} open to-do${openTodosCount === 1 ? "" : "s"}`;
  const question = isBatch
    ? `${applicationCount} of these applications ${applicationCount === 1 ? "has" : "have"} ${todosText}. Delete them?`
    : `This application has ${todosText}. Delete them?`;

  return (
    <Modal
      title={isBatch ? `Archive ${selectedCount} applications` : "Archive application"}
      onClose={onCancel}
      maxWidth="max-w-md"
    >
      <p className="text-light-text dark:text-dark-text">{question}</p>

      <label className="mt-4 flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted">
        <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
        Remember my choice
      </label>

      <div className="flex flex-wrap justify-end gap-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-border dark:bg-dark-subtle text-light-text dark:text-dark-text hover:bg-light-muted/25 dark:hover:bg-dark-subtle/80 transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onConfirm(false, remember)}
          className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition"
        >
          Keep them
        </button>
        <button
          type="button"
          onClick={() => onConfirm(true, remember)}
          className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
          Delete to-dos
        </button>
      </div>
    </Modal>
  );
}
