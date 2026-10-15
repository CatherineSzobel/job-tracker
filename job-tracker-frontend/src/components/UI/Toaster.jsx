import { CircleAlert, CircleCheck, X } from "lucide-react";
import { useToastStore } from "../../stores/useToastStore";

// Each type's icon and its colour (full class strings so Tailwind can find them)
const TOAST_TYPES = {
  error: { icon: CircleAlert, iconClasses: "text-rejected-fg" },
  success: { icon: CircleCheck, iconClasses: "text-offer-fg" },
};

// Stack of messages from useToastStore, bottom-right (full width on phones). aria-live so screen readers
// announce them. z-60: above Modal (z-50), so a failed save inside a dialog is still visible.
export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div aria-live="polite" className="fixed right-4 bottom-4 left-4 z-60 flex flex-col gap-2 sm:left-auto sm:w-96">
      {toasts.map((toast) => {
        const { icon: Icon, iconClasses } = TOAST_TYPES[toast.type];
        return (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className="flex items-start gap-3 rounded-xl border border-line bg-surface py-2 pr-2 pl-4 text-ink shadow-menu"
          >
            <Icon size={20} aria-hidden="true" className={`mt-2.5 shrink-0 ${iconClasses}`} />
            <p className="flex-1 py-2">{toast.message}</p>
            <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Dismiss" className="btn-icon-sm">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
