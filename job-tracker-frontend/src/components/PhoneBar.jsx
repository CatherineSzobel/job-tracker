import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu as MenuIcon, X } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeStore } from "../stores/useThemeStore";
import { ACCOUNT_LINKS, NAV_LINKS, SECONDARY_LINKS, getPageTitle, isLinkActive } from "../constants/navigation";
import Avatar from "./UI/Avatar";
import Switch from "./UI/Switch";
import useLogout from "./Layouts/useLogout";

const linkClasses = (isActive) =>
  `flex min-h-12 items-center rounded-lg px-3 transition-colors ${
    isActive ? "bg-accent-soft font-semibold text-accent-text" : "font-medium text-ink hover:bg-soft"
  }`;

// Phones and tablets (below lg): a 64px bar with the Menu button, the page title and an avatar linking
// to Profile. Menu opens a drawer under the bar with every page, a dark-mode switch and Log out.
// The drawer closes on picking a link, Escape (focus goes back to the button) and clicks outside it.
export default function PhoneBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const menuButtonRef = useRef(null);
  const { pathname } = useLocation();
  const user = useAuthStore((state) => state.user);
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  const logout = useLogout();

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (!headerRef.current.contains(event.target)) setMenuOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current.focus();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const renderLinks = (links) =>
    links.map((link) => {
      const isActive = isLinkActive(link, pathname);
      return (
        <Link key={link.to} to={link.to} onClick={closeMenu} aria-current={isActive ? "page" : undefined} className={linkClasses(isActive)}>
          {link.label}
        </Link>
      );
    });

  return (
    <header ref={headerRef} className="sticky top-0 z-30 border-b border-line bg-surface lg:hidden">
      <div className="flex h-16 items-center gap-2 px-2">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="phone-menu"
          className={`btn-icon ${menuOpen ? "bg-accent-soft" : ""}`}
        >
          {menuOpen ? <X size={24} aria-hidden="true" /> : <MenuIcon size={24} aria-hidden="true" />}
        </button>
        <span className="min-w-0 flex-1 truncate text-lg font-semibold">{getPageTitle(pathname)}</span>
        {user && (
          <Link to="/profile" aria-label="Your profile" className="inline-flex size-12 shrink-0 items-center justify-center rounded-full">
            <Avatar name={user.name} />
          </Link>
        )}
      </div>

      {menuOpen && (
        <nav
          id="phone-menu"
          aria-label="Main"
          className="absolute inset-x-0 top-full flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto border-b border-line bg-surface px-4 pt-2 pb-4 shadow-menu"
        >
          {renderLinks(NAV_LINKS)}
          <div role="separator" className="my-2 h-px bg-line" />
          {renderLinks([...SECONDARY_LINKS, ...ACCOUNT_LINKS])}
          <div className="flex min-h-12 items-center justify-between px-3">
            <span>Dark mode</span>
            <Switch checked={darkMode} onChange={toggleDarkMode} label="Dark mode" />
          </div>
          <button
            type="button"
            onClick={() => {
              closeMenu();
              logout();
            }}
            className="flex min-h-12 items-center rounded-lg px-3 text-left font-semibold text-danger transition-colors hover:bg-soft"
          >
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}
