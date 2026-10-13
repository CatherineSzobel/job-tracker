import { useEffect, useState } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { useToastStore } from "../../stores/useToastStore";

const TOAST_DURATION_MS = 4000;
// Longer when there's a button (Undo) to reach
const ACTION_TOAST_DURATION_MS = 8000;

// Each type's icon and its colour (full class strings so Tailwind can find them)
const TOAST_TYPES = {
  error: { icon: CircleAlert, iconClasses: "text-rejected-fg" },
  success: { icon: CircleCheck, iconClasses: "text-offer-fg" },
};

// One message. It dismisses itself after a few seconds, but waits while the pointer or keyboard focus is
// on it, so there's time to read it and reach its button.
function Toast({ toast, onDismiss }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { icon: Icon, iconClasses } = TOAST_TYPES[toast.type];
  const paused = hovered || focused;
  const duration = toast.action ? ACTION_TOAST_DURATION_MS : TOAST_DURATION_MS;

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(timer);
  }, [paused, duration, onDismiss, toast.id]);

  const runAction = () => {
    onDismiss(toast.id);
    toast.action.onClick();
  };

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      className="flex items-start gap-3 rounded-xl border border-line bg-surface py-2 pr-2 pl-4 text-ink shadow-menu"
    >
      <Icon size={20} aria-hidden="true" className={`mt-2.5 shrink-0 ${iconClasses}`} />
      <p className="flex-1 py-2">{toast.message}</p>
      {toast.action && (
        <button type="button" onClick={runAction} className="btn-small">
          {toast.action.label}
        </button>
      )}
      <button type="button" onClick={() => onDismiss(toast.id)} aria-label="Dismiss" className="btn-icon-sm">
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

// Stack of messages from useToastStore, bottom-right (full width on phones). aria-live so screen readers
// announce them. z-60: above Modal (z-50), so a failed save inside a dialog is still visible.
export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div aria-live="polite" className="fixed right-4 bottom-4 left-4 z-60 flex flex-col gap-2 sm:left-auto sm:w-96">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
