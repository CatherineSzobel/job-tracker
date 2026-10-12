import { CalendarDays, LayoutGrid } from "lucide-react";

// The list views of Applications and Interviews (UI/ViewToggle, UI/useSavedView); the first is the default
export const LIST_VIEWS = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "grouped", label: "By date", icon: CalendarDays },
];

export const DEFAULT_LIST_VIEW = LIST_VIEWS[0].value;
