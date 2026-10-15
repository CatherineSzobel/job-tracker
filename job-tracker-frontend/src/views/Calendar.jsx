import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../components/UI/Card";
import PageLoader from "../components/UI/PageLoader";
import TodoItem from "../components/Todo/TodoItem";
import useTodos from "../components/Todo/useTodos";
import { interviewTypeLabel } from "../constants/jobs";
import { countOf } from "../utils/plural";

const WEEK_OPTIONS = { weekStartsOn: 1 };
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// Cells show a few pills, then "+N more"
const PILLS_PER_CELL = 3;

// Each kind's pill (desktop cells), dot (phone cells) and legend colours.
// Full class strings (not built at runtime) so Tailwind can find them.
const EVENT_KINDS = {
  interview: { label: "Interview", pill: "bg-accent-soft text-accent-text", dot: "bg-accent" },
  todo: { label: "To-do", pill: "bg-tag-green-bg text-tag-green-fg", dot: "bg-bar-offer" },
  overdue: { label: "Overdue", pill: "bg-rejected-bg text-rejected-fg", dot: "bg-bar-rejected" },
};

export default function Calendar() {
  const [interviews, setInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const { todos, loading: loadingTodos, updateTodo, deleteTodo } = useTodos();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(startOfToday());

  useEffect(() => {
    // All of the user's interviews, including ones on archived jobs
    API.get("/interviews")
      .then(res => setInterviews(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingInterviews(false));
  }, []);

  // Whole weeks, Monday first, so the grid starts and ends with the neighbouring months' days
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), WEEK_OPTIONS),
    end: endOfWeek(endOfMonth(currentMonth), WEEK_OPTIONS),
  });
  const today = startOfToday();

  const getInterviewsForDay = (day) =>
    interviews
      .filter(i => isSameDay(parseISO(i.interview_date), day))
      .sort((first, second) => parseISO(first.interview_date) - parseISO(second.interview_date));

  // Only dated to-dos appear; done ones stay visible (ticked) on their day
  const getTodosForDay = (day) =>
    todos.filter(todo => todo.due_date && isSameDay(parseISO(todo.due_date), day));

  // A cell's events in display order: interviews by time, then to-dos
  const eventsForDay = (day) => [
    ...getInterviewsForDay(day).map((interview) => ({
      key: `interview-${interview.id}`,
      kind: "interview",
      text: `${format(parseISO(interview.interview_date), "HH:mm")} ${interview.job?.company_name ?? "Interview"}`,
    })),
    ...getTodosForDay(day).map((todo) => ({
      key: `todo-${todo.id}`,
      kind: !todo.done && isBefore(parseISO(todo.due_date), today) ? "overdue" : "todo",
      text: todo.text,
    })),
  ];

  const showMonth = (month) => setCurrentMonth(month);
  const goToToday = () => {
    setCurrentMonth(today);
    setSelectedDay(today);
  };

  if (loadingInterviews || loadingTodos) {
    return <PageLoader text="Loading calendar..." />;
  }

  const selectedInterviews = getInterviewsForDay(selectedDay);
  const selectedTodos = getTodosForDay(selectedDay);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="page-title" aria-live="polite">
          {format(currentMonth, "MMMM yyyy")}
        </h1>
        <div className="flex items-center gap-2">
          <button type="button" onClick={goToToday} className="btn-secondary">
            Today
          </button>
          <button type="button" onClick={() => showMonth(subMonths(currentMonth, 1))} aria-label="Previous month" className="btn-secondary w-12 px-0">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => showMonth(addMonths(currentMonth, 1))} aria-label="Next month" className="btn-secondary w-12 px-0">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <section aria-label="Month" className="flex min-w-0 flex-[3_1_560px] flex-col gap-2 rounded-2xl border border-line bg-surface p-2 sm:p-4">
          <ul className="flex flex-wrap gap-4 px-2 pt-1 pb-2 text-sm text-muted" aria-label="Legend">
            {Object.values(EVENT_KINDS).map(({ label, dot }) => (
              <li key={label} className="inline-flex items-center gap-1.5">
                <span aria-hidden="true" className={`size-3 rounded ${dot}`} />
                {label}
              </li>
            ))}
          </ul>

          <div aria-hidden="true" className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((name) => (
              <span key={name} className="p-1 text-center text-sm font-semibold text-muted">
                <span className="sm:hidden">{name[0]}</span>
                <span className="hidden sm:inline">{name.slice(0, 3)}</span>
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const events = eventsForDay(day);
              const inMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, today);
              const isSelected = isSameDay(day, selectedDay);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  aria-pressed={isSelected}
                  aria-label={`${format(day, "EEEE d MMMM")}${isToday ? ", today" : ""}, ${countOf(events.length, "item")}`}
                  className={`flex min-h-14 flex-col items-stretch gap-1 overflow-hidden rounded-lg border p-1 text-left transition-colors sm:min-h-28 sm:p-1.5 ${
                    isSelected ? "border-accent bg-accent-soft" : inMonth ? "border-subtle bg-surface hover:bg-soft" : "border-subtle bg-soft text-muted"
                  }`}
                >
                  <span
                    className={`inline-flex h-7 min-w-7 items-center justify-center self-start rounded-full px-1 text-sm font-semibold ${
                      isToday ? "bg-accent text-white" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Desktop: pills with the time and company or the to-do; phones: a dot per item */}
                  <span className="hidden flex-col gap-1 sm:flex">
                    {events.slice(0, PILLS_PER_CELL).map((event) => (
                      <span key={event.key} className={`truncate rounded px-1.5 text-xs/5 font-semibold ${EVENT_KINDS[event.kind].pill}`}>
                        {event.text}
                      </span>
                    ))}
                    {events.length > PILLS_PER_CELL && (
                      <span className="px-1.5 text-xs/5 font-semibold text-muted">+{events.length - PILLS_PER_CELL} more</span>
                    )}
                  </span>
                  {events.length > 0 && (
                    <span className="flex flex-wrap gap-0.5 pl-1 sm:hidden">
                      {events.map((event) => (
                        <span key={event.key} className={`size-2 rounded-full ${EVENT_KINDS[event.kind].dot}`} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex min-w-0 flex-[1_1_280px] flex-col">
          <Card title={`${format(selectedDay, "EEEE d MMMM")}${isSameDay(selectedDay, today) ? " · Today" : ""}`}>
            {selectedInterviews.length === 0 && selectedTodos.length === 0 && <p className="text-muted">Nothing planned for this day.</p>}

            {selectedInterviews.length > 0 && (
              <ul className="flex flex-col gap-2">
                {selectedInterviews.map((interview) => (
                  <li key={interview.id}>
                    <Link to={`/interviews/${interview.id}`} className="flex gap-3 rounded-xl bg-soft p-3 text-ink transition-colors hover:bg-subtle">
                      <span aria-hidden="true" className="w-1 shrink-0 rounded-full bg-accent" />
                      <span className="flex min-w-0 flex-col">
                        <strong className="font-semibold break-words">{interview.job?.company_name ?? "Interview"}</strong>
                        <span className="text-sm text-muted">
                          {format(parseISO(interview.interview_date), "HH:mm")} · {interviewTypeLabel(interview.type)} interview
                          {interview.job?.position && ` · ${interview.job.position}`}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {selectedTodos.length > 0 && (
              <ul className="flex flex-col gap-2">
                {selectedTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} onUpdate={updateTodo} onDelete={deleteTodo} />
                ))}
              </ul>
            )}

            <div className="flex flex-wrap gap-2 border-t border-subtle pt-4">
              <Link to="/interviews" className="btn-soft">
                Add interview
              </Link>
              <Link to="/todos" className="btn-small">
                Add to-do
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
