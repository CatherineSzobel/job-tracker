import { format, isThisYear, parseISO } from "date-fns";

// "28 Sep" this year, "28 Sep 2025" otherwise ("" when empty). Takes "YYYY-MM-DD" or a full ISO date.
export function formatShortDate(dateString) {
  if (!dateString) return "";
  const date = parseISO(dateString);
  return format(date, isThisYear(date) ? "d MMM" : "d MMM yyyy");
}
