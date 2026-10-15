const ACTIVE_CHIP = "border-accent bg-accent text-white";
const INACTIVE_CHIP = "border-input bg-surface text-ink hover:bg-soft";

// A filter chip's classes (Documents, To-dos): a 40px pill, filled with the accent colour when chosen.
// shrink-0 so a long row can scroll sideways instead of squashing the labels.
export const filterChipClasses = (isActive) =>
  `inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 font-semibold transition-colors ${isActive ? ACTIVE_CHIP : INACTIVE_CHIP}`;

// The optional count bubble inside a chip ("Applied 8")
export const filterChipCountClasses = (isActive) =>
  `min-w-6 rounded-full px-1.5 text-center text-sm/6 ${isActive ? "bg-white text-accent" : "bg-subtle text-muted-2"}`;
