// Navy bar pinned to the bottom while items are selected: "N selected", the page's actions (children,
// styled with btn-bar / btn-bar-primary / btn-bar-danger), then Cancel
export default function SelectionBar({ count, onCancel, children }) {
  return (
    <div
      role="region"
      aria-label="Selection"
      className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 flex-wrap items-center gap-2 rounded-xl bg-accent px-4 py-3 text-white shadow-menu"
    >
      <span className="mr-auto font-semibold">{count} selected</span>
      {children}
      <button type="button" onClick={onCancel} className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm/6 font-semibold text-white underline underline-offset-4 transition-colors hover:bg-white/10">
        Cancel
      </button>
    </div>
  );
}
