// Orders for the Applications grid (the first is the default). "By date" always groups by applied date instead.
export const APPLICATION_SORTS = [
  { value: "applied-newest", label: "Applied: newest first" },
  { value: "applied-oldest", label: "Applied: oldest first" },
  { value: "updated", label: "Last updated" },
  { value: "company", label: "Company A–Z" },
  { value: "priority", label: "Priority: high first" },
];

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

// Applied date, newest first, without a date last; then the newest added (the highest id) first
const byAppliedNewest = (first, second) =>
  (second.applied_date ?? "").localeCompare(first.applied_date ?? "") || second.id - first.id;

const COMPARE = {
  "applied-newest": byAppliedNewest,
  "applied-oldest": (first, second) => {
    if (!first.applied_date || !second.applied_date) return byAppliedNewest(first, second);
    return first.applied_date.localeCompare(second.applied_date) || first.id - second.id;
  },
  // ISO timestamps, so comparing the strings compares the times
  updated: (first, second) => (second.updated_at ?? "").localeCompare(first.updated_at ?? "") || byAppliedNewest(first, second),
  company: (first, second) =>
    first.company_name.localeCompare(second.company_name, undefined, { sensitivity: "base" }) || byAppliedNewest(first, second),
  priority: (first, second) =>
    (PRIORITY_RANK[first.priority] ?? 3) - (PRIORITY_RANK[second.priority] ?? 3) || byAppliedNewest(first, second),
};

// A sorted copy of jobs; ties fall back to applied date, newest first
export function sortApplications(jobs, sort) {
  return [...jobs].sort(COMPARE[sort] ?? byAppliedNewest);
}
