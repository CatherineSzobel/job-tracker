import { differenceInCalendarDays } from "date-fns";

// How soon an upcoming date is, in calendar days: "Today", "Tomorrow", "In 5 days"; null once it's past
export function countdownLabel(date, now = new Date()) {
  if (date < now) return null;
  const days = differenceInCalendarDays(date, now);
  return days === 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} days`;
}
