// The Dashboard's tabs; the first is the default (no ?tab in the URL)
export const DASHBOARD_TABS = [
  { id: "today", label: "Today" },
  { id: "insights", label: "Insights" },
];

export const DEFAULT_DASHBOARD_TAB = DASHBOARD_TABS[0].id;

// "Coming up" covers today and the following days, this many in total
export const COMING_UP_DAYS = 7;
