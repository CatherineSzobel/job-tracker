import { CalendarDays, LayoutGrid } from "lucide-react";
import { SEGMENTED_TRACK_CLASSES, segmentClasses } from "./segmentedClasses";

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "grouped", label: "By date", icon: CalendarDays },
];

// Segmented control for the list's view: Grid or grouped by date
export default function ViewToggle({ view, onChange }) {
  return (
    <div role="group" aria-label="View" className={SEGMENTED_TRACK_CLASSES}>
      {VIEW_OPTIONS.map((option) => {
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
