import { Link, useLocation } from "react-router-dom";
import { NAV_LINKS, SECONDARY_LINKS, isLinkActive } from "../constants/navigation";

const linkClasses = (isActive) =>
  `flex min-h-12 items-center gap-3 rounded-lg px-3 transition-colors ${
    isActive ? "bg-accent-soft font-semibold text-accent-text" : "font-medium text-muted-2 hover:bg-soft hover:text-ink"
  }`;

function NavList({ label, links, pathname }) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = isLinkActive(link, pathname);
          return (
            <li key={link.to}>
              <Link to={link.to} aria-current={isActive ? "page" : undefined} className={linkClasses(isActive)}>
                <Icon size={20} aria-hidden="true" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// Desktop (lg+) only; phones get PhoneBar's menu instead. Stays in view while the page scrolls.
export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-line bg-surface p-4 lg:flex">
      <Link to="/" className="flex min-h-12 items-center px-2 text-xl/8 font-bold text-ink">
        Job Tracker
      </Link>
      <NavList label="Main" links={NAV_LINKS} pathname={pathname} />
      <div role="separator" className="my-2 h-px bg-line" />
      <NavList label="More" links={SECONDARY_LINKS} pathname={pathname} />
    </aside>
  );
}
