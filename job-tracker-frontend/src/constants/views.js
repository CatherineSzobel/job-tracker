import { CalendarDays, Kanban, LayoutGrid } from "lucide-react";

// The list views of Applications and Interviews (UI/ViewToggle, UI/useSavedView); the first is the default
export const LIST_VIEWS = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "grouped", label: "By date", icon: CalendarDays },
];

// Applications also has a board: a column per status
export const APPLICATION_VIEWS = [...LIST_VIEWS, { value: "board", label: "Board", icon: Kanban }];
