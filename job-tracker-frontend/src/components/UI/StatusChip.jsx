import { STATUS_BADGE_CLASSES, jobStatusLabel } from "../../constants/jobs";

// An application's status as a 24px pill: always the word, with its colour as a second cue
export default function StatusChip({ status }) {
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-sm font-semibold ${STATUS_BADGE_CLASSES[status] ?? "bg-subtle text-muted-2"}`}
    >
      {jobStatusLabel(status)}
    </span>
  );
}
