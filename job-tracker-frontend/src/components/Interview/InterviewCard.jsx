import { Link } from "react-router-dom";
import { format, isPast } from "date-fns";
import { ArrowRight } from "lucide-react";
import DateBlock from "../UI/DateBlock";
import { interviewTypeLabel } from "../../constants/jobs";

// One interview on the application page: a date block (filled for the next one), type and time, a short
// note, then prep progress (or the debrief once it's over). isNext: the next upcoming interview.
export default function InterviewCard({ interview, isNext = false }) {
  const date = new Date(interview.interview_date);
  const isOver = isPast(date);
  const progress = interview.prep_progress;

  return (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-soft p-4">
      <DateBlock date={date} top="month" tone={isNext ? "highlight" : isOver ? "muted" : "default"} />
      <div className="flex min-w-0 flex-[1_1_200px] flex-col">
        <strong className="font-semibold">
          {interviewTypeLabel(interview.type)} interview · {isOver ? "Done" : format(date, "HH:mm")}
        </strong>
        <span className="text-sm break-words text-muted">
          {interview.notes || interview.location || format(date, "EEEE d MMMM yyyy")}
        </span>
      </div>
      {isOver ? (
        <Link to={`/interviews/${interview.id}?tab=debrief`} className="inline-flex min-h-10 items-center px-3 text-sm font-semibold text-accent-text hover:underline">
          Open debrief
        </Link>
      ) : (
        <Link
          to={`/interviews/${interview.id}?tab=prep`}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:bg-subtle"
        >
          {progress?.total > 0 ? `Prep ${progress.done} of ${progress.total}` : "Open prep"}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </li>
  );
}
