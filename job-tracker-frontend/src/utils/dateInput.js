import { format } from "date-fns";

// Value for <input type="datetime-local">: "2026-10-09T14:00" in the browser's time ("" when empty)
export function toDateTimeInputValue(dateString) {
  return dateString ? format(new Date(dateString), "yyyy-MM-dd'T'HH:mm") : "";
}

// The other way: the input's value (the browser's time) as a UTC timestamp for the API, so the server doesn't
// read "14:00" as 14:00 UTC ("" stays "", for the server's required check)
export function fromDateTimeInputValue(inputValue) {
  return inputValue ? new Date(inputValue).toISOString() : "";
}
