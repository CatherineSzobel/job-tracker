import { describeDueDate, formatDueDate } from "../../utils/dueDate";
import { DUE_STATE_CLASSES } from "../../constants/todos";

// A done to-do just shows its date: it can't be overdue any more
export default function DueChip({ dueDate, done = false }) {
  if (!dueDate) return null;

  const { label, state } = done
    ? { label: formatDueDate(dueDate), state: "upcoming" }
    : describeDueDate(dueDate);

  return (
    <span className={`rounded-full px-2 text-sm/6 font-semibold whitespace-nowrap ${DUE_STATE_CLASSES[state]}`}>
      {label}
    </span>
  );
}
