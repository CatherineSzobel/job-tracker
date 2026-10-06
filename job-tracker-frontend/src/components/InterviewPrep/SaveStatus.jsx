// "Saving…" / "Saved" / "Couldn't save · Retry" next to the page title
export default function SaveStatus({ status, onRetry }) {
  if (status === "idle") return null;

  if (status === "error") {
    return (
      <p role="status" className="text-sm text-red-500 dark:text-red-400">
        Couldn&apos;t save ·{" "}
        <button type="button" onClick={onRetry} className="underline hover:no-underline">
          Retry
        </button>
      </p>
    );
  }

  return (
    <p role="status" className="text-sm text-light-muted dark:text-dark-muted">
      {status === "saving" ? "Saving…" : "Saved"}
    </p>
  );
}
