import { X } from "lucide-react";

// 40px × button for removing a row; label is read out and shown as the tooltip
export default function RemoveButton({ label, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-soft hover:text-danger">
      <X size={16} aria-hidden="true" />
    </button>
  );
}
