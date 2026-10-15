import { CalendarDays, LayoutGrid } from "lucide-react";

// The list views of Applications and Interviews (UI/ViewToggle, UI/useSavedView); the first is the default
export const LIST_VIEWS = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "grouped", label: "By date", icon: CalendarDays },
];
