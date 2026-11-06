// Blank "add to-do" form state (job_application_id is a string while it's a <select> value)
export const EMPTY_TODO_DRAFT = { text: "", due_date: "", job_application_id: "" };

export const DUE_DATE_SHORTCUTS = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "Next week", days: 7 },
];

export const DASHBOARD_TODO_LIMIT = 6;

// Mirrors App\Enums\ArchiveTodosAction
export const ARCHIVE_TODOS_OPTIONS = [
  { value: "ask", label: "Ask me each time" },
  { value: "delete", label: "Always delete them" },
  { value: "keep", label: "Always keep them" },
];

// Due chip colours by state (Todo/DueChip). Full class strings (not built at runtime) so Tailwind can find them.
export const DUE_STATE_CLASSES = {
  overdue: "bg-rejected-bg text-rejected-fg",
  today: "bg-accent text-white",
  upcoming: "bg-subtle text-muted-2",
};

// The To-dos page filter chips
export const TODO_FILTERS = [
  { value: "all", label: "All" },
  { value: "linked", label: "Linked to an application" },
  { value: "general", label: "General" },
];

// Open to-dos are grouped by due state; done ones sit in a collapsed section at the end
export const TODO_SECTIONS = [
  { state: "overdue", title: "Overdue" },
  { state: "today", title: "Today" },
  { state: "upcoming", title: "Upcoming" },
  { state: "none", title: "No due date" },
];
