import { CalendarDays, LayoutGrid } from "lucide-react";

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "grouped", label: "Grouped by date", icon: CalendarDays },
];

// Icon buttons for the list's view; the name shows as a tooltip
export default function ViewToggle({ view, onChange }) {
  return (
    <div role="group" aria-label="View" className="flex rounded-md border border-light-muted dark:border-dark-subtle overflow-hidden">
      {VIEW_OPTIONS.map((option) => {
        const ViewIcon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={view === option.value}
            aria-label={option.label}
            title={option.label}
            className={`w-9 h-9 flex items-center justify-center transition-colors ${view === option.value ? "bg-accent text-surface" : "text-light-muted dark:text-dark-muted hover:bg-light-soft dark:hover:bg-dark-subtle"}`}
          >
            <ViewIcon size={18} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
