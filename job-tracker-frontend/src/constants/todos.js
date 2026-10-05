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
