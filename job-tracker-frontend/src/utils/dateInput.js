import { format } from "date-fns";

// Value for <input type="datetime-local">: "2026-10-09T14:00" in the browser's time ("" when empty)
export function toDateTimeInputValue(dateString) {
  return dateString ? format(new Date(dateString), "yyyy-MM-dd'T'HH:mm") : "";
}
