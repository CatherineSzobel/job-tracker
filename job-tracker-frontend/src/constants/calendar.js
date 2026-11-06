// Weeks start on Monday
export const CALENDAR_WEEK_OPTIONS = { weekStartsOn: 1 };

// The month grid's column headings, Monday first
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Each kind's pill (desktop cells), dot (phone cells) and legend colours.
// Full class strings (not built at runtime) so Tailwind can find them.
export const CALENDAR_EVENT_KINDS = {
  interview: { label: "Interview", pill: "bg-accent-soft text-accent-text", dot: "bg-accent" },
  todo: { label: "To-do", pill: "bg-tag-green-bg text-tag-green-fg", dot: "bg-bar-offer" },
  overdue: { label: "Overdue", pill: "bg-rejected-bg text-rejected-fg", dot: "bg-bar-rejected" },
};
