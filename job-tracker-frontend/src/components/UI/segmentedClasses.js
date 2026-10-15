// Segmented control (DESIGN_E.md §5): a subtle track with the chosen segment raised.
// Used by Tabs (Today/Insights, Prep/Debrief) and ViewToggle (Grid/By date).
export const SEGMENTED_TRACK_CLASSES = "inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-subtle p-1";

export const segmentClasses = (isSelected) =>
  `inline-flex min-h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 font-semibold transition-colors ${
    isSelected ? "bg-raised text-ink" : "text-muted hover:text-ink"
  }`;
