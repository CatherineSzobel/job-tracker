import { describeDueDate, formatDueDate } from "../../utils/dueDate";

// Full class strings (not built at runtime) so Tailwind can find them
const STATE_CLASSES = {
  overdue: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  today: "bg-accent text-white",
  upcoming: "bg-light-soft text-light-muted dark:bg-dark-subtle dark:text-dark-muted",
};

// A done to-do just shows its date: it can't be overdue any more
export default function DueChip({ dueDate, done = false }) {
  const { label, state } = describeDueDate(dueDate);
  if (state === "none") return null;

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${done ? STATE_CLASSES.upcoming : STATE_CLASSES[state]}`}>
      {done ? formatDueDate(dueDate) : label}
    </span>
  );
}
