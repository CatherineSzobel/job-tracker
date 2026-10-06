// Mirrors App\Enums\ReminderDismissMode
export const REMINDER_DISMISS_OPTIONS = [
  { value: "today", label: "for today" },
  { value: "permanent", label: "completely (until I update the application)" },
];

// Same range as the backend validation
export const REMINDER_DAYS_MIN = 1;
export const REMINDER_DAYS_MAX = 60;
