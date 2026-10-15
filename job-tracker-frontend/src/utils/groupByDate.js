import { format, isThisYear, parseISO, startOfWeek, subWeeks } from "date-fns";

// Groups items by a date into years and months: [{ year: "2026", months: [{ key: "2026-09", label: "September", items }] }].
// getDateString(item): an ISO date or date-time, or empty. order: "newest" (latest year and month first) or "oldest".
// Items keep the order they're given in inside a month, so sort them first. Items without a date come last
// as { year: null, months: [{ key: "undated", label: "No date", items }] }.
export function groupByDate(items, getDateString, order = "newest") {
  const years = new Map();
  const undatedItems = [];

  for (const item of items) {
    const dateString = getDateString(item);
    if (!dateString) {
      undatedItems.push(item);
      continue;
    }
    const date = parseISO(dateString);
    const year = format(date, "yyyy");
    const monthKey = format(date, "yyyy-MM");

    if (!years.has(year)) years.set(year, new Map());
    const months = years.get(year);
    if (!months.has(monthKey)) months.set(monthKey, { key: monthKey, label: format(date, "MMMM"), items: [] });
    months.get(monthKey).items.push(item);
  }

  const direction = order === "oldest" ? 1 : -1;
  const compareKeys = (first, second) => direction * first.localeCompare(second);

  const groups = [...years.entries()]
    .sort(([firstYear], [secondYear]) => compareKeys(firstYear, secondYear))
    .map(([year, months]) => ({
      year,
      months: [...months.values()].sort((first, second) => compareKeys(first.key, second.key)),
    }));

  if (undatedItems.length > 0) {
    groups.push({ year: null, months: [{ key: "undated", label: "No date", items: undatedItems }] });
  }
  return groups;
}

// Groups items by how recent their date is, newest first: "This week", "Last week", then one group per month
// ("September", or "September 2025" outside this year), and "No date" last. Weeks start on Monday.
// Returns [{ key, label, items }]; inside a group the newest item comes first.
export function groupByRecency(items, getDateString, today = new Date()) {
  const thisWeekStart = startOfWeek(today, { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  const groups = new Map();
  const undatedItems = [];

  const groupFor = (date) => {
    if (date >= thisWeekStart) return { key: "this-week", label: "This week" };
    if (date >= lastWeekStart) return { key: "last-week", label: "Last week" };
    return { key: format(date, "yyyy-MM"), label: format(date, isThisYear(date) ? "MMMM" : "MMMM yyyy") };
  };

  const dated = items
    .filter((item) => {
      if (getDateString(item)) return true;
      undatedItems.push(item);
      return false;
    })
    .map((item) => ({ item, date: parseISO(getDateString(item)) }))
    .sort((first, second) => second.date - first.date);

  for (const { item, date } of dated) {
    const { key, label } = groupFor(date);
    if (!groups.has(key)) groups.set(key, { key, label, items: [] });
    groups.get(key).items.push(item);
  }

  const result = [...groups.values()];
  if (undatedItems.length > 0) result.push({ key: "undated", label: "No date", items: undatedItems });
  return result;
}
