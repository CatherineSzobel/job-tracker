import { Home, Briefcase, ClipboardList, Calendar } from "lucide-react";

// Main pages, shown in the sidebar (and its mobile menu)
export const NAV_LINKS = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/applications", label: "Applications", icon: Briefcase },
  { to: "/interviews", label: "Interviews", icon: ClipboardList },
  { to: "/calendar", label: "Calendar", icon: Calendar },
];

// Account pages, shown in the navbar's user menu
export const ACCOUNT_LINKS = [
  { to: "/profile", label: "Profile" },
  { to: "/links", label: "Links" },
  { to: "/settings", label: "Settings" },
];

const PAGE_TITLES = {
  ...Object.fromEntries([...NAV_LINKS, ...ACCOUNT_LINKS].map(({ to, label }) => [to, label])),
  "/archives": "Archive",
};

export function getPageTitle(pathname) {
  if (pathname.startsWith("/jobs/")) return "Application";
  return PAGE_TITLES[pathname] || "Page";
}
