import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";

// Due dates are plain "YYYY-MM-DD" dates. parseISO reads them as local midnight, so
// "today" and "overdue" follow the user's own calendar day, not UTC.

// "Thu 2 Oct"
export function formatDueDate(dateString) {
  return format(parseISO(dateString), "EEE d MMM");
}

// e.g. { label: "3 days overdue", state: "overdue" } or { label: "Tomorrow", state: "upcoming" }
export function describeDueDate(dateString, today = new Date()) {
  if (!dateString) return { label: "", state: "none" };

  const days = differenceInCalendarDays(parseISO(dateString), today);
  if (days < 0) return { label: `${-days} day${days === -1 ? "" : "s"} overdue`, state: "overdue" };
  if (days === 0) return { label: "Today", state: "today" };
  if (days === 1) return { label: "Tomorrow", state: "upcoming" };
  return { label: formatDueDate(dateString), state: "upcoming" };
}

// "YYYY-MM-DD" for the day `days` from today (local)
export function isoDateFromToday(days) {
  return format(addDays(new Date(), days), "yyyy-MM-dd");
}
