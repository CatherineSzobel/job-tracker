import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Building2, CalendarDays, Phone, Square, Video } from "lucide-react";
import PageLoader from "../UI/PageLoader";
import { COMING_UP_DAYS } from "../../constants/dashboard";
import { INTERVIEW_TYPES } from "../../constants/jobs";
import { describeDueDate } from "../../utils/dueDate";
import useComingUp from "./useComingUp";

const LINK_CLASSES = "text-accent dark:text-accent-muted hover:underline";
const ROW_CLASSES = "flex flex-wrap items-center gap-x-2";
const ROW_ICON_CLASSES = "shrink-0 text-light-muted dark:text-dark-muted";

const INTERVIEW_TYPE_ICONS = { phone: Phone, online: Video, onsite: Building2 };

const interviewTypeLabel = (type) => INTERVIEW_TYPES.find((option) => option.value === type)?.label ?? type;

// This week's interviews and to-dos, by day ("Today", "Tomorrow", "Thu 9 Oct"). Read-only:
// to-dos are ticked in Quick to-dos, which shares its to-do list with this card.
export default function ComingUp({ todos, todosLoading }) {
  const { days, loading: interviewsLoading } = useComingUp(todos);

  return (
    <div className="card">
      <h2 className="card-title mb-4">
        <CalendarDays size={18} aria-hidden="true" />
        Coming up
      </h2>

      {interviewsLoading || todosLoading ? (
        <PageLoader text="Loading your week..." compact />
      ) : days.length === 0 ? (
        <p className="text-sm text-light-muted dark:text-dark-muted">Nothing in the next {COMING_UP_DAYS} days.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {days.map((day) => (
            <li key={day.date}>
              <h3 className="text-sm font-semibold uppercase tracking-wide mb-1 text-light-muted dark:text-dark-muted">
                {describeDueDate(day.date).label}
              </h3>
              <ul className="flex flex-col gap-1 text-sm text-light-text dark:text-dark-text">
                {day.interviews.map((interview) => {
                  const TypeIcon = INTERVIEW_TYPE_ICONS[interview.type] ?? CalendarDays;
                  return (
                    <li key={`interview-${interview.id}`} className={ROW_CLASSES}>
                      <TypeIcon size={14} aria-hidden="true" className={ROW_ICON_CLASSES} />
                      <span className="font-medium">{format(interview.startsAt, "HH:mm")}</span>
                      <span aria-hidden="true">·</span>
                      <span>{interviewTypeLabel(interview.type)}</span>
                      <span aria-hidden="true">·</span>
                      {/* Before an interview its prep page is where you go; the job is linked from there */}
                      <Link to={`/interviews/${interview.id}`} className={LINK_CLASSES}>
                        {interview.job ? `${interview.job.company_name} – ${interview.job.position}` : "Interview"}
                      </Link>
                    </li>
                  );
                })}
                {day.todos.map((todo) => (
                  <li key={`todo-${todo.id}`} className={ROW_CLASSES}>
                    <Square size={14} aria-hidden="true" className={ROW_ICON_CLASSES} />
                    <span className="break-words">{todo.text}</span>
                    {todo.job_application && (
                      <>
                        <span aria-hidden="true">·</span>
                        <Link to={`/jobs/${todo.job_application.id}`} className={LINK_CLASSES}>
                          {todo.job_application.company_name}
                        </Link>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}

      <Link to="/calendar" className="block mt-4 text-right text-sm text-accent hover:text-accent-soft transition-colors">
        Open calendar →
      </Link>
    </div>
  );
}
