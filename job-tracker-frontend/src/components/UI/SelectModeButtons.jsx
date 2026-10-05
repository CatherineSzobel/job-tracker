// Header buttons for select mode: "Select" to start; while selecting, "Select all (N)" for the
// visible items and Cancel
export default function SelectModeButtons({ selecting, visibleCount, onStart, onSelectAll, onCancel }) {
  if (!selecting) {
    return (
      <button type="button" onClick={onStart} className="btn-toolbar">
        Select
      </button>
    );
  }

  return (
    <>
      <button type="button" onClick={onSelectAll} className="btn-toolbar">
        Select all ({visibleCount})
      </button>
      <button type="button" onClick={onCancel} className="btn-toolbar">
        Cancel
      </button>
    </>
  );
}
