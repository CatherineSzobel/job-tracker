import { useEffect, useState } from "react";
import { addDays, endOfDay, format, isWithinInterval, parseISO, startOfToday } from "date-fns";
import API from "../../api/axios";
import { COMING_UP_DAYS } from "../../constants/dashboard";
import { useToastStore } from "../../stores/useToastStore";
import { isoDateFromToday } from "../../utils/dueDate";

// Interviews and open, dated to-dos from today through the next days, grouped by day in the
// browser's time: [{ date: "2026-10-09", interviews, todos }], earliest first, empty days left out.
// Overdue to-dos are left to the Reminders and Quick to-dos cards.
function groupByDay(interviews, todos) {
  const windowStart = startOfToday();
  const windowEnd = endOfDay(addDays(windowStart, COMING_UP_DAYS - 1));
  const firstDate = isoDateFromToday(0);
  const lastDate = isoDateFromToday(COMING_UP_DAYS - 1);
  const daysByDate = new Map();

  const dayFor = (date) => {
    if (!daysByDate.has(date)) daysByDate.set(date, { date, interviews: [], todos: [] });
    return daysByDate.get(date);
  };

  interviews
    .map((interview) => ({ ...interview, startsAt: parseISO(interview.interview_date) }))
    .filter((interview) => isWithinInterval(interview.startsAt, { start: windowStart, end: windowEnd }))
    .sort((first, second) => first.startsAt - second.startsAt)
    .forEach((interview) => dayFor(format(interview.startsAt, "yyyy-MM-dd")).interviews.push(interview));

  todos
    .filter((todo) => !todo.done && todo.due_date && todo.due_date >= firstDate && todo.due_date <= lastDate)
    .forEach((todo) => dayFor(todo.due_date).todos.push(todo));

  return [...daysByDate.values()].sort((first, second) => first.date.localeCompare(second.date));
}

// reloadSignal: when it changes, refetch quietly, keeping the current days on screen
export default function useComingUp(reloadSignal = 0) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ignore a response that arrives after a newer reload started
    let current = true;
    Promise.all([API.get("/interviews"), API.get("/todos")])
      .then(([interviewsResponse, todosResponse]) => {
        if (current) setDays(groupByDay(interviewsResponse.data.data, todosResponse.data.data));
      })
      .catch((err) => {
        console.error(err);
        if (current) useToastStore.getState().showToast("Couldn't load what's coming up");
      })
      .finally(() => current && setLoading(false));
    return () => {
      current = false;
    };
  }, [reloadSignal]);

  return { days, loading };
}
