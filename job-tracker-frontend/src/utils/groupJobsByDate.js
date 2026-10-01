import { format, parseISO } from "date-fns";

// Groups applications by applied_date into years and months, newest first:
// [{ year: "2026", months: [{ key: "2026-09", label: "September", jobs }] }].
// Applications without a date come last as { year: null, months: [{ key: "undated", label: "No date", jobs }] }.
export function groupJobsByDate(jobs) {
  const years = new Map();
  const undatedJobs = [];

  for (const job of jobs) {
    if (!job.applied_date) {
      undatedJobs.push(job);
      continue;
    }
    const date = parseISO(job.applied_date);
    const year = format(date, "yyyy");
    const monthKey = format(date, "yyyy-MM");

    if (!years.has(year)) years.set(year, new Map());
    const months = years.get(year);
    if (!months.has(monthKey)) months.set(monthKey, { key: monthKey, label: format(date, "MMMM"), jobs: [] });
    months.get(monthKey).jobs.push(job);
  }

  const groups = [...years.entries()]
    .sort(([firstYear], [secondYear]) => secondYear.localeCompare(firstYear))
    .map(([year, months]) => ({
      year,
      months: [...months.values()].sort((first, second) => second.key.localeCompare(first.key)),
    }));

  if (undatedJobs.length > 0) {
    groups.push({ year: null, months: [{ key: "undated", label: "No date", jobs: undatedJobs }] });
  }
  return groups;
}
