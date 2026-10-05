import Modal from "./Modal";
import { useConfirmStore } from "../../stores/useConfirmStore";

// Shows the question asked with confirmAction() (stores/useConfirmStore); mounted once in Layout
export default function ConfirmDialog() {
  const request = useConfirmStore((state) => state.request);
  const answer = useConfirmStore((state) => state.answer);

  if (!request) return null;

  return (
    <Modal title="Please confirm" onClose={() => answer(false)} maxWidth="max-w-md">
      <p className="whitespace-pre-line text-light-text dark:text-dark-text">{request.message}</p>
      <div className="flex justify-end gap-3 mt-6">
        <button type="button" onClick={() => answer(false)} className="btn-toolbar">
          Cancel
        </button>
        <button
          type="button"
          autoFocus
          onClick={() => answer(true)}
          className={request.danger ? "px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors" : "btn-primary"}
        >
          {request.confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
