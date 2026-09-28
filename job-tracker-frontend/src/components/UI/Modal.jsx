import { useEffect } from "react";

// Centered dialog over a dimmed backdrop. Escape and backdrop clicks call onClose.
export default function Modal({ title, onClose, maxWidth = "max-w-2xl", children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 p-3 sm:p-4"
      onClick={onClose}
    >
      {/* Scrolls inside itself when taller than the screen (long forms on phones) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-surface dark:bg-dark-soft rounded-xl shadow-xl p-4 sm:p-6 w-full ${maxWidth} max-h-full overflow-y-auto transition-colors`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text">{title}</h2>
        {children}
      </div>
    </div>
  );
}
