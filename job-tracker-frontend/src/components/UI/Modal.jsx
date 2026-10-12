import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Centered dialog over a dimmed backdrop (560px wide unless maxWidth says otherwise).
// Escape, the × button and backdrop clicks call onClose.
// When dialogs are stacked (e.g. a confirm over Manage tags), Escape only closes the top one.
export default function Modal({ title, onClose, maxWidth = "max-w-[560px]", children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      const openDialogs = document.querySelectorAll('[aria-modal="true"]');
      if (openDialogs[openDialogs.length - 1] === dialogRef.current) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // On <body>, so a transformed ancestor (e.g. a card's hover lift) can't trap the fixed overlay
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      {/* Scrolls inside itself when taller than the screen (long forms on phones) */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-full w-full ${maxWidth} overflow-y-auto rounded-2xl border border-line bg-surface p-4 text-ink shadow-menu sm:p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="pt-1 text-xl/8 font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="btn-icon-sm -mt-1 -mr-2">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
