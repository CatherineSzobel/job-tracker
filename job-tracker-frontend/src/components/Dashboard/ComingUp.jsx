import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, CalendarDays, MapPin, Phone, SquareCheck, Video } from "lucide-react";
import Card, { CardLink } from "../UI/Card";
import PageLoader from "../UI/PageLoader";
import { COMING_UP_DAYS } from "../../constants/dashboard";
import { interviewTypeLabel } from "../../constants/jobs";
import { describeDueDate, formatDueDate } from "../../utils/dueDate";

const INTERVIEW_TYPE_ICONS = { phone: Phone, online: Video, onsite: MapPin };

// "Today", "Tomorrow · Fri 9 Oct", "Sun 11 Oct"
const dayLabel = (date) => {
  const { label } = describeDueDate(date);
  return label === "Tomorrow" ? `${label} · ${formatDueDate(date)}` : label;
};

// One agenda line: a type icon in a square, the title with its application link under it, and the time
function AgendaRow({ icon, title, linkTo, linkText, time }) {
  const Icon = icon;
  return (
    <li className="flex items-center gap-4 rounded-xl bg-soft px-4 py-3">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-accent-text">
        <Icon size={20} aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold break-words">{title}</span>
        {linkTo && (
          <Link to={linkTo} className="truncate text-sm text-accent-text hover:underline">
            {linkText}
          </Link>
        )}
      </div>
      {time && <span className="shrink-0 font-semibold text-muted tabular-nums">{time}</span>}
    </li>
  );
}

// This week's interviews and to-dos, by day. Read-only: to-dos are ticked in Quick to-dos, which shares
// its to-do list with this card. days / loading come from useComingUp (the Dashboard also counts them).
export default function ComingUp({ days, loading }) {
  return (
    <Card
      title="Coming up"
      icon={CalendarDays}
      action={
        <CardLink to="/calendar">
          Calendar
          <ArrowRight size={16} aria-hidden="true" />
        </CardLink>
      }
    >
      {loading ? (
        <PageLoader text="Loading your week..." compact />
      ) : days.length === 0 ? (
        <p className="text-muted">Nothing in the next {COMING_UP_DAYS} days.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {days.map((day) => (
            <li key={day.date} className="flex flex-col gap-2">
              <h3 className="group-label">{dayLabel(day.date)}</h3>
              <ul className="flex flex-col gap-2">
                {day.interviews.map((interview) => (
                  // Before an interview its prep page is where you go; the job is linked from there
                  <AgendaRow
                    key={`interview-${interview.id}`}
                    icon={INTERVIEW_TYPE_ICONS[interview.type] ?? CalendarDays}
                    title={`${interviewTypeLabel(interview.type)} interview`}
                    linkTo={`/interviews/${interview.id}`}
                    linkText={interview.job ? `${interview.job.company_name} · ${interview.job.position}` : "Open prep"}
                    time={format(interview.startsAt, "HH:mm")}
                  />
                ))}
                {day.todos.map((todo) => (
                  <AgendaRow
                    key={`todo-${todo.id}`}
                    icon={SquareCheck}
                    title={todo.text}
                    linkTo={todo.job_application && `/jobs/${todo.job_application.id}`}
                    linkText={todo.job_application && `${todo.job_application.company_name} · ${todo.job_application.position}`}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
