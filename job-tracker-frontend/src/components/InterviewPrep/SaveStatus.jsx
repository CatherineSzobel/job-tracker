import { Check } from "lucide-react";

// "Saving…" / "Saved" / "Couldn't save · Retry" next to the page title
export default function SaveStatus({ status, onRetry }) {
  if (status === "idle") return null;

  if (status === "error") {
    return (
      <p role="status" className="text-sm font-semibold text-danger">
        Couldn&apos;t save ·{" "}
        <button type="button" onClick={onRetry} className="underline hover:no-underline">
          Retry
        </button>
      </p>
    );
  }

  if (status === "saving") {
    return (
      <p role="status" className="text-sm text-muted">
        Saving…
      </p>
    );
  }

  return (
    <p role="status" className="inline-flex items-center gap-1.5 text-sm font-semibold text-offer-fg">
      <Check size={16} strokeWidth={2.5} aria-hidden="true" />
      Saved
    </p>
  );
}
