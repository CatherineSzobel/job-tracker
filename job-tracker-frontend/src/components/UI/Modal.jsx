import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const focusableIn = (container) =>
  [...container.querySelectorAll(FOCUSABLE)].filter((element) => element.getClientRects().length > 0);

// Centered dialog over a dimmed backdrop (560px wide unless maxWidth says otherwise).
// Escape, the × button and backdrop clicks call onClose.
// When dialogs are stacked (e.g. a confirm over Manage tags), Escape and Tab only act on the top one.
// Tab and Shift+Tab cycle inside the dialog; on close, focus goes back to the element that opened it.
export default function Modal({ title, onClose, maxWidth = "max-w-[560px]", children }) {
  const dialogRef = useRef(null);
  // Read while rendering: by the time effects run, an autoFocus child already has focus
  const [opener] = useState(() => document.activeElement);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.contains(document.activeElement)) dialog.focus();

    return () => {
      // Still on the page means StrictMode's test unmount, not a real close
      if (dialog.isConnected) return;
      if (opener?.isConnected && opener !== document.body) opener.focus();
    };
  }, [opener]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const dialog = dialogRef.current;
      const openDialogs = document.querySelectorAll('[aria-modal="true"]');
      if (openDialogs[openDialogs.length - 1] !== dialog) return;

      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = focusableIn(dialog);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isOutside = !dialog.contains(active) || active === dialog;

      if (event.shiftKey && (active === first || isOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || isOutside)) {
        event.preventDefault();
        first.focus();
      }
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
        tabIndex={-1}
        className={`max-h-full w-full ${maxWidth} overflow-y-auto rounded-2xl border border-line bg-surface p-4 text-ink shadow-menu outline-none sm:p-6`}
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
