import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

// Centered dialog over a dimmed backdrop. Escape and backdrop clicks call onClose.
// When dialogs are stacked (e.g. a confirm over Manage tags), Escape only closes the top one.
export default function Modal({ title, onClose, maxWidth = "max-w-2xl", children }) {
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
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 p-3 sm:p-4"
      onClick={onClose}
    >
      {/* Scrolls inside itself when taller than the screen (long forms on phones) */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-surface dark:bg-dark-soft rounded-xl shadow-xl p-4 sm:p-6 w-full ${maxWidth} max-h-full overflow-y-auto transition-colors`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}
