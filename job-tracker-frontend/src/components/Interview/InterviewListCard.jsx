import PrepProgressLink from "./PrepProgressLink";
import { isUpcoming } from "./interviewFilters";
import { interviewTypeLabel } from "../../constants/jobs";

// An interview on the Interviews page. In select mode clicking the card calls onToggleSelect(id),
// and Edit, Delete and Open prep are hidden so a click can't open or change anything.
export default function InterviewListCard({ interview, onEdit, onDelete, selecting = false, selected = false, onToggleSelect }) {
  const upcoming = isUpcoming(interview);

  return (
    <div
      onClick={selecting ? () => onToggleSelect(interview.id) : undefined}
      className={`card relative flex flex-col gap-4 h-full ${selecting ? "cursor-pointer" : ""} ${selected ? "ring-2 ring-accent" : ""}`}
    >
      {selecting && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(interview.id)}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Select ${interview.job?.company_name ?? "interview"}`}
          className="absolute top-4 right-4 h-5 w-5 cursor-pointer accent-accent"
        />
      )}

      <h3 className="font-semibold text-lg pr-8 line-clamp-2 text-light-text dark:text-dark-text">
        {interview.job?.company_name} – {interview.job?.position}
      </h3>

      <div className="flex flex-wrap gap-2">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
          {interviewTypeLabel(interview.type)}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-light-soft dark:bg-dark-subtle text-light-text dark:text-dark-text">
          {new Date(interview.interview_date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            upcoming
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          }`}
        >
          {upcoming ? "Upcoming" : "Past"}
        </span>
      </div>

      <p className="text-sm text-light-muted dark:text-dark-muted">
        <strong>Location:</strong> {interview.location || "—"}
      </p>

      {interview.notes && (
        <p className="text-sm text-light-muted dark:text-dark-muted">
          <strong>Prep notes:</strong> {interview.notes}
        </p>
      )}

      {!selecting && (
        <>
          <PrepProgressLink interview={interview} />
          <div className="flex justify-end gap-2 mt-auto">
            <button type="button" onClick={() => onEdit(interview)} className="btn-small">
              Edit
            </button>
            <button type="button" onClick={() => onDelete(interview)} className="btn-small-danger">
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
