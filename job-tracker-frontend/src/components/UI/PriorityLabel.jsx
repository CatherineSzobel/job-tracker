import { Flag } from "lucide-react";
import { PRIORITY_TEXT_CLASSES, priorityLabel } from "../../constants/jobs";

// "High priority" as coloured text with a flag: quieter than the status chip on purpose
export default function PriorityLabel({ priority }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 text-sm font-semibold ${PRIORITY_TEXT_CLASSES[priority] ?? "text-muted"}`}>
      <Flag size={14} strokeWidth={2.5} aria-hidden="true" />
      {priorityLabel(priority)} priority
    </span>
  );
}
