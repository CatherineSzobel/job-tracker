// Pinned to the bottom while items are selected: "N selected", the page's actions (children), Cancel
export default function SelectionBar({ count, onCancel, children }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl flex flex-wrap items-center gap-2 p-3 rounded-2xl border border-border dark:border-dark-subtle bg-surface dark:bg-dark-soft shadow-xl transition-colors">
      <span className="mr-auto font-medium text-light-text dark:text-dark-text">{count} selected</span>
      {children}
      <button type="button" onClick={onCancel} className="btn-bar">
        Cancel
      </button>
    </div>
  );
}
