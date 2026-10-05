import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import API from "../../api/axios";
import { COMING_UP_DAYS } from "../../constants/dashboard";
import { useToastStore } from "../../stores/useToastStore";
import { isoDateFromToday } from "../../utils/dueDate";

// Interviews and open, dated to-dos from today through the next days, grouped by day in the
// browser's time: [{ date: "2026-10-09", interviews, todos }], earliest first, empty days left out.
// Overdue to-dos are left to Quick to-dos.
function groupByDay(interviews, todos) {
  const firstDate = isoDateFromToday(0);
  const lastDate = isoDateFromToday(COMING_UP_DAYS - 1);
  const isThisWeek = (date) => date >= firstDate && date <= lastDate;
  const daysByDate = new Map();

  const dayFor = (date) => {
    if (!daysByDate.has(date)) daysByDate.set(date, { date, interviews: [], todos: [] });
    return daysByDate.get(date);
  };

  interviews
    .filter((interview) => isThisWeek(interview.date))
    .forEach((interview) => dayFor(interview.date).interviews.push(interview));

  todos
    .filter((todo) => !todo.done && todo.due_date && isThisWeek(todo.due_date))
    .forEach((todo) => dayFor(todo.due_date).todos.push(todo));

  return [...daysByDate.values()].sort((first, second) => first.date.localeCompare(second.date));
}

// Loads the interviews once; the to-dos come from the Dashboard's to-do list, so ticking one in
// Quick to-dos updates this straight away. Each interview gets startsAt (Date) and date ("YYYY-MM-DD").
export default function useComingUp(todos) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/interviews")
      .then((res) =>
        setInterviews(
          res.data.data
            .map((interview) => {
              const startsAt = parseISO(interview.interview_date);
              return { ...interview, startsAt, date: format(startsAt, "yyyy-MM-dd") };
            })
            .sort((first, second) => first.startsAt - second.startsAt)
        )
      )
      .catch((err) => {
        console.error(err);
        useToastStore.getState().showToast("Couldn't load what's coming up");
      })
      .finally(() => setLoading(false));
  }, []);

  const days = useMemo(() => groupByDay(interviews, todos), [interviews, todos]);

  return { days, loading };
}
