const BUTTON_CLASSES = "px-3 py-2 rounded-md text-sm border border-light-muted dark:border-dark-subtle text-light-text dark:text-dark-text hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors";

// Header buttons for select mode: "Select" to start; while selecting, "Select all (N)" for the
// visible items and Cancel
export default function SelectModeButtons({ selecting, visibleCount, onStart, onSelectAll, onCancel }) {
  if (!selecting) {
    return (
      <button type="button" onClick={onStart} className={BUTTON_CLASSES}>
        Select
      </button>
    );
  }

  return (
    <>
      <button type="button" onClick={onSelectAll} className={BUTTON_CLASSES}>
        Select all ({visibleCount})
      </button>
      <button type="button" onClick={onCancel} className={BUTTON_CLASSES}>
        Cancel
      </button>
    </>
  );
}
