// Mirrors App\Enums\ReminderDismissMode
export const REMINDER_DISMISS_OPTIONS = [
  { value: "today", label: "For today" },
  { value: "permanent", label: "Completely, until I update the application" },
];

// Same range as the backend validation
export const REMINDER_DAYS_MIN = 1;
export const REMINDER_DAYS_MAX = 60;

// What a reminder's Dismiss will do (setting reminder_dismiss_mode), shown as its tooltip
export const REMINDER_DISMISS_HINTS = {
  today: "Hide until tomorrow",
  permanent: "Hide until you update this application",
};
