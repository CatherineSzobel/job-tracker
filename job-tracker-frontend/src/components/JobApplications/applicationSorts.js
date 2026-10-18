// Orders for the Applications grid. The first is the default: last updated, so one just added or changed
// (a Saved one too, which has no applied date yet) is at the top. "By date" always groups by applied date instead.
export const APPLICATION_SORTS = [
  { value: "updated", label: "Last updated" },
  { value: "applied-newest", label: "Applied: newest first" },
  { value: "applied-oldest", label: "Applied: oldest first" },
  { value: "company", label: "Company A–Z" },
  { value: "priority", label: "Priority: high first" },
  { value: "deadline", label: "Deadline: soonest first" },
  { value: "salary", label: "Salary: highest first" },
];

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

// Ignores case and accents; built once rather than per comparison
const companyCollator = new Intl.Collator(undefined, { sensitivity: "base" });

// Stand-ins that put applications without a value last: no deadline counts as the far future, and no salary as
// -1 (salaries can't be negative)
const NO_DEADLINE = "9999-12-31";
const NO_SALARY = -1;

// The top of the range (or its only end). Currencies aren't converted, so mixed currencies only roughly line up.
const salaryOf = (job) => job.salary_max ?? job.salary_min ?? NO_SALARY;

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
  company: (first, second) => companyCollator.compare(first.company_name, second.company_name) || byAppliedNewest(first, second),
  priority: (first, second) =>
    (PRIORITY_RANK[first.priority] ?? 3) - (PRIORITY_RANK[second.priority] ?? 3) || byAppliedNewest(first, second),
  deadline: (first, second) =>
    (first.deadline ?? NO_DEADLINE).localeCompare(second.deadline ?? NO_DEADLINE) || byAppliedNewest(first, second),
  salary: (first, second) => salaryOf(second) - salaryOf(first) || byAppliedNewest(first, second),
};

// A sorted copy of jobs; ties fall back to applied date, newest first
export function sortApplications(jobs, sort) {
  return [...jobs].sort(COMPARE[sort] ?? COMPARE[APPLICATION_SORTS[0].value]);
}
