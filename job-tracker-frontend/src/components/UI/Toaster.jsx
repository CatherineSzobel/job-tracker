import { X } from "lucide-react";
import { useToastStore } from "../../stores/useToastStore";

// Full class strings (not built at runtime) so Tailwind can find them
const TYPE_CLASSES = {
  error: "border-red-300 dark:border-red-800 text-red-700 dark:text-red-300",
  success: "border-green-300 dark:border-green-800 text-green-700 dark:text-green-300",
};

// Stack of messages from useToastStore, bottom-right. aria-live so screen readers announce them.
// z-60: above Modal (z-50), so a failed save inside a dialog is still visible.
export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 left-4 sm:left-auto z-60 flex flex-col gap-2 sm:w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.type === "error" ? "alert" : "status"}
          className={`flex items-start gap-3 rounded-lg border bg-surface dark:bg-dark-soft px-4 py-3 text-sm shadow-lg ${TYPE_CLASSES[toast.type]}`}
        >
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss"
            className="text-light-muted dark:text-dark-muted hover:text-accent transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
