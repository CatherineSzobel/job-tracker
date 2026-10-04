import { Link } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";

// "Prep 3/7 · Open prep →" on an interview card; the count shows once the interview has a checklist
export default function PrepProgressLink({ interview }) {
  const progress = interview.prep_progress;

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      {progress?.total > 0 ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-light-soft dark:bg-dark-subtle text-light-text dark:text-dark-text">
          <ClipboardCheck size={14} aria-hidden="true" />
          Prep {progress.done}/{progress.total}
        </span>
      ) : (
        <span />
      )}
      <Link to={`/interviews/${interview.id}`} className="text-accent dark:text-accent-muted hover:underline">
        Open prep →
      </Link>
    </div>
  );
}
