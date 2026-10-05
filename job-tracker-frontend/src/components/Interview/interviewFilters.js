import { startOfToday } from "date-fns";

// The date filter on the Interviews page; "upcoming" is the default
export const INTERVIEW_WHEN_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

// From the start of today on, so today's interviews stay "upcoming" all day (also used for the card's badge)
export function isUpcoming(interview, todayStart = startOfToday()) {
  return new Date(interview.interview_date) >= todayStart;
}

// Upcoming: soonest first. Past and All: newest first (like Applications), so a month is never split
export const sortOrderFor = (when) => (when === "upcoming" ? "oldest" : "newest");

// The interviews for a date filter ("upcoming" | "past" | "all") and a search over company and position
// (case-insensitive, surrounding spaces ignored), in the order that filter shows them
export function filterInterviews(interviews, { when, search }) {
  const todayStart = startOfToday();
  const searchText = search.trim().toLowerCase();

  const matching = interviews.filter((interview) => {
    const upcoming = isUpcoming(interview, todayStart);
    const dateMatches = when === "all" || (when === "upcoming" ? upcoming : !upcoming);
    const nameMatches =
      !searchText ||
      [interview.job?.company_name, interview.job?.position].some((name) => name?.toLowerCase().includes(searchText));
    return dateMatches && nameMatches;
  });

  const direction = sortOrderFor(when) === "oldest" ? 1 : -1;
  return matching.sort((first, second) => direction * (new Date(first.interview_date) - new Date(second.interview_date)));
}
