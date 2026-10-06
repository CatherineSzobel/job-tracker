import { X } from "lucide-react";

// Small × button for removing a row; label is read out and shown as the tooltip
export default function RemoveButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="shrink-0 p-1 rounded-full text-light-muted dark:text-dark-muted hover:text-red-500 dark:hover:text-red-400 transition-colors"
    >
      <X size={16} />
    </button>
  );
}
