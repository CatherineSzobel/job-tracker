import {
  Home,
  Briefcase,
  ClipboardList,
  MessageSquareText,
  Calendar,
  ListTodo,
  FolderOpen,
  Archive,
  User,
  Settings2,
} from "lucide-react";

// Main pages, at the top of the sidebar and the phone menu.
// activePrefixes: detail pages that keep the link highlighted (an application under Applications).
export const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/applications", label: "Applications", icon: Briefcase, activePrefixes: ["/jobs/"] },
  { to: "/interviews", label: "Interviews", icon: ClipboardList, activePrefixes: ["/interviews/"] },
  { to: "/question-bank", label: "Question bank", icon: MessageSquareText },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/todos", label: "To-dos", icon: ListTodo },
];

// Content you come back to, below a divider in the sidebar and the phone menu
export const SECONDARY_LINKS = [
  { to: "/documents", label: "Documents & links", icon: FolderOpen },
  { to: "/archives", label: "Archive", icon: Archive },
];

// The account menu (top bar) and the end of the phone menu, followed by Log out
export const ACCOUNT_LINKS = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings2 },
];

export function isLinkActive({ to, activePrefixes = [] }, pathname) {
  return pathname === to || activePrefixes.some((prefix) => pathname.startsWith(prefix));
}

const PAGE_TITLES = Object.fromEntries(
  [...NAV_LINKS, ...SECONDARY_LINKS, ...ACCOUNT_LINKS].map(({ to, label }) => [to, label])
);

// Pages that sit under another one: the top bar's breadcrumb links back to the parent
const CHILD_PAGES = [
  { matches: (pathname) => pathname.startsWith("/jobs/"), title: "Application", parent: "/applications" },
  { matches: (pathname) => pathname.startsWith("/interviews/"), title: "Interview prep", parent: "/interviews" },
  { matches: (pathname) => pathname === "/archives", title: "Archive", parent: "/applications" },
];

// { title, parent: { to, label } | null } for the top bar's breadcrumb
export function getBreadcrumb(pathname) {
  const childPage = CHILD_PAGES.find((page) => page.matches(pathname));
  if (childPage) {
    return { title: childPage.title, parent: { to: childPage.parent, label: PAGE_TITLES[childPage.parent] } };
  }
  return { title: PAGE_TITLES[pathname] || "Page", parent: null };
}

export function getPageTitle(pathname) {
  return getBreadcrumb(pathname).title;
}
