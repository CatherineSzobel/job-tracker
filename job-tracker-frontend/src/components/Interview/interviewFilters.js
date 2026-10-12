// The date filter on the Interviews page; "upcoming" is the default
export const INTERVIEW_WHEN_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];

// From now on: an interview earlier today is over ("past"), like the dashboard's count (also used by the card)
export function isUpcoming(interview, now = new Date()) {
  return new Date(interview.interview_date) >= now;
}

// Upcoming: soonest first. Past and All: newest first (like Applications), so a month is never split
export const sortOrderFor = (when) => (when === "upcoming" ? "oldest" : "newest");

// The interviews for a date filter ("upcoming" | "past" | "all") and a search over company and position
// (case-insensitive, surrounding spaces ignored), in the order that filter shows them
export function filterInterviews(interviews, { when, search }) {
  const now = new Date();
  const searchText = search.trim().toLowerCase();

  const matching = interviews.filter((interview) => {
    const upcoming = isUpcoming(interview, now);
    const dateMatches = when === "all" || (when === "upcoming" ? upcoming : !upcoming);
    const nameMatches =
      !searchText ||
      [interview.job?.company_name, interview.job?.position].some((name) => name?.toLowerCase().includes(searchText));
    return dateMatches && nameMatches;
  });

  const direction = sortOrderFor(when) === "oldest" ? 1 : -1;
  return matching.sort((first, second) => direction * (new Date(first.interview_date) - new Date(second.interview_date)));
}
