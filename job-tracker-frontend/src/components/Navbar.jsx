import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { usePageTitle } from "../stores/usePageTitleStore";
import { ACCOUNT_LINKS, getBreadcrumb } from "../constants/navigation";
import Avatar from "./UI/Avatar";
import Menu, { MenuDivider, MenuItem } from "./UI/Menu";
import ThemeToggle from "./UI/ThemeToggle";
import useLogout from "./Layouts/useLogout";

// Account button: initials, name and a chevron, opening Profile, Settings and Log out
function AccountMenu({ user }) {
  const logout = useLogout();

  return (
    <Menu
      buttonClassName="flex h-12 items-center gap-2 rounded-full border border-line bg-surface pr-2 pl-1 font-medium text-ink transition-colors hover:bg-soft"
      buttonContent={
        <>
          <Avatar name={user.name} />
          <span className="max-w-48 truncate">{user.name}</span>
          <ChevronDown size={16} aria-hidden="true" />
        </>
      }
    >
      {ACCOUNT_LINKS.map(({ to, label, icon }) => (
        <MenuItem key={to} to={to} icon={icon}>
          {label}
        </MenuItem>
      ))}
      <MenuDivider />
      <MenuItem onClick={logout} icon={LogOut} danger>
        Log out
      </MenuItem>
    </Menu>
  );
}

// Desktop (lg+) top bar: where you are on the left (the page itself shows the title as its h1),
// theme toggle and account menu on the right. Phones get PhoneBar instead.
export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const { pathname } = useLocation();
  const breadcrumb = getBreadcrumb(pathname);
  const title = usePageTitle(pathname) ?? breadcrumb.title;
  const { parent } = breadcrumb;

  return (
    <header className="hidden items-center justify-between gap-4 border-b border-line bg-surface px-8 py-4 lg:flex">
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex flex-wrap items-center gap-2 text-muted">
          {parent && (
            <>
              <li>
                <Link to={parent.to} className="underline-offset-4 hover:text-ink hover:underline">
                  {parent.label}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={16} />
              </li>
            </>
          )}
          <li aria-current="page" className="font-semibold text-ink">
            {title}
          </li>
        </ol>
      </nav>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && <AccountMenu user={user} />}
      </div>
    </header>
  );
}
