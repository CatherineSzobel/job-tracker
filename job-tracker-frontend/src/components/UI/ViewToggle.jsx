import { SEGMENTED_TRACK_CLASSES, segmentClasses } from "./segmentedClasses";
import { LIST_VIEWS } from "../../constants/views";

// Segmented control for the list's view: Grid or grouped by date, or the given views (e.g. with Board)
export default function ViewToggle({ view, onChange, views = LIST_VIEWS }) {
  return (
    <div role="group" aria-label="View" className={SEGMENTED_TRACK_CLASSES}>
      {views.map((option) => {
        const ViewIcon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={view === option.value}
            className={segmentClasses(view === option.value)}
          >
            <ViewIcon size={16} aria-hidden="true" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
