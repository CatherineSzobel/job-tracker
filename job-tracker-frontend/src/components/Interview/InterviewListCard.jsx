import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock, EllipsisVertical, MapPin } from "lucide-react";
import DateBlock from "../UI/DateBlock";
import Menu, { MenuDivider, MenuItem } from "../UI/Menu";
import { isUpcoming } from "./interviewFilters";
import { interviewTypeLabel } from "../../constants/jobs";

// An interview on the Interviews page: date block (filled for the next one), company (link to the prep page)
// and position, ⋮ with Edit and Delete, type / time / place, then prep progress or the debrief link.
// In select mode clicking the card calls onToggleSelect(id), and the links and actions are hidden.
export default function InterviewListCard({ interview, isNext = false, onEdit, onDelete, selecting = false, selected = false, onToggleSelect }) {
  const upcoming = isUpcoming(interview);
  const date = new Date(interview.interview_date);
  const company = interview.job?.company_name ?? "Interview";
  const progress = interview.prep_progress;
  const hasChecklist = progress?.total > 0;
  const progressPercent = hasChecklist ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <li
      onClick={selecting ? () => onToggleSelect(interview.id) : undefined}
      className={`flex min-w-0 flex-col gap-4 rounded-2xl border bg-surface px-4 py-5 sm:px-6 ${
        selected ? "border-accent ring-1 ring-accent" : "border-line"
      } ${selecting ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start gap-4">
        <DateBlock date={date} size="lg" tone={isNext ? "highlight" : upcoming ? "default" : "muted"} />
        <div className="flex min-w-0 flex-1 flex-col">
          {selecting ? (
            <span className="text-lg/7 font-semibold break-words">{company}</span>
          ) : (
            <Link to={`/interviews/${interview.id}`} className="text-lg/7 font-semibold break-words text-ink hover:underline">
              {company}
            </Link>
          )}
          <span className="break-words text-muted">{interview.job?.position}</span>
        </div>
        {selecting ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(interview.id)}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Select the interview at ${company}`}
            className="mt-1 size-5 shrink-0 cursor-pointer"
          />
        ) : (
          <div className="-mt-1 -mr-2">
            <Menu label={`Actions for ${company}`} buttonClassName="btn-icon-sm" buttonContent={<EllipsisVertical size={20} aria-hidden="true" />} width="w-48">
              <MenuItem onClick={() => onEdit(interview)}>Edit</MenuItem>
              <MenuDivider />
              <MenuItem onClick={() => onDelete(interview)} danger>
                Delete
              </MenuItem>
            </Menu>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        <span className="rounded-full bg-accent-soft px-2.5 leading-6 font-semibold text-accent-text">{interviewTypeLabel(interview.type)}</span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={16} aria-hidden="true" />
          {format(date, upcoming ? "HH:mm" : "d MMM yyyy · HH:mm")}
        </span>
        {interview.location && (
          <span className="inline-flex min-w-0 items-center gap-1.5 break-words">
            <MapPin size={16} aria-hidden="true" className="shrink-0" />
            {interview.location}
          </span>
        )}
      </div>

      {!selecting && (
        <div className="mt-auto flex items-center gap-4 border-t border-subtle pt-4">
          {upcoming ? (
            <>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="text-sm font-semibold">{hasChecklist ? `Prep ${progress.done} of ${progress.total}` : "No prep checklist yet"}</span>
                {hasChecklist && (
                  <div
                    role="progressbar"
                    aria-label="Prep progress"
                    aria-valuenow={progress.done}
                    aria-valuemin={0}
                    aria-valuemax={progress.total}
                    className="h-2 overflow-hidden rounded-full bg-accent-soft"
                  >
                    <div className="h-full rounded-full bg-accent" style={{ width: `${progressPercent}%` }} />
                  </div>
                )}
              </div>
              <Link to={`/interviews/${interview.id}?tab=prep`} className="btn-primary min-h-10 shrink-0 px-3 text-sm">
                Open prep
              </Link>
            </>
          ) : (
            <Link to={`/interviews/${interview.id}?tab=debrief`} className="btn-small ml-auto">
              Open debrief
            </Link>
          )}
        </div>
      )}
    </li>
  );
}
