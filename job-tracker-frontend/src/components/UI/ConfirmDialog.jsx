import Modal from "./Modal";
import { useConfirmStore } from "../../stores/useConfirmStore";

// Shows the question asked with confirmAction() (stores/useConfirmStore); mounted once in App
export default function ConfirmDialog() {
  const request = useConfirmStore((state) => state.request);
  const answer = useConfirmStore((state) => state.answer);

  if (!request) return null;

  return (
    <Modal title="Please confirm" onClose={() => answer(false)} maxWidth="max-w-md">
      <p className="whitespace-pre-line">{request.message}</p>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button type="button" onClick={() => answer(false)} className="btn-secondary">
          Cancel
        </button>
        <button type="button" autoFocus onClick={() => answer(true)} className={request.danger ? "btn-danger" : "btn-primary"}>
          {request.confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
