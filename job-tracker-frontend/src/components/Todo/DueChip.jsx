import { describeDueDate, formatDueDate } from "../../utils/dueDate";

// Full class strings (not built at runtime) so Tailwind can find them
const STATE_CLASSES = {
  overdue: "bg-rejected-bg text-rejected-fg",
  today: "bg-accent text-white",
  upcoming: "bg-subtle text-muted-2",
};

// A done to-do just shows its date: it can't be overdue any more
export default function DueChip({ dueDate, done = false }) {
  if (!dueDate) return null;

  const { label, state } = done
    ? { label: formatDueDate(dueDate), state: "upcoming" }
    : describeDueDate(dueDate);

  return (
    <span className={`rounded-full px-2 text-sm/6 font-semibold whitespace-nowrap ${STATE_CLASSES[state]}`}>
      {label}
    </span>
  );
}
