import { Home, Briefcase, ClipboardList, MessageSquareText, Calendar, ListTodo } from "lucide-react";

// Main pages, shown in the sidebar (and its mobile menu)
export const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/applications", label: "Applications", icon: Briefcase },
  { to: "/interviews", label: "Interviews", icon: ClipboardList },
  { to: "/question-bank", label: "Question bank", icon: MessageSquareText },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/todos", label: "To-dos", icon: ListTodo },
];

// Account pages, shown in the navbar's user menu
export const ACCOUNT_LINKS = [
  { to: "/profile", label: "Profile" },
  { to: "/documents", label: "Documents & links" },
  { to: "/settings", label: "Settings" },
];

const PAGE_TITLES = {
  ...Object.fromEntries([...NAV_LINKS, ...ACCOUNT_LINKS].map(({ to, label }) => [to, label])),
  "/archives": "Archive",
};

export function getPageTitle(pathname) {
  if (pathname.startsWith("/interviews/")) return "Interview prep";
  if (pathname.startsWith("/jobs/")) return "Application";
  return PAGE_TITLES[pathname] || "Page";
}
