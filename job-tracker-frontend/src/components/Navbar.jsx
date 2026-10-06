import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { ACCOUNT_LINKS, getPageTitle } from "../constants/navigation";

const menuItemClasses =
  "block w-full text-left px-4 py-2 text-sm hover:bg-light-soft dark:hover:bg-dark-subtle focus:bg-light-soft dark:focus:bg-dark-subtle focus:outline-none transition-colors";

// Account menu: closes on outside click, on Escape (returning focus to the button) and after picking an item
function UserMenu({ onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-1 text-sm rounded-lg border px-3 py-1 border-border dark:border-dark-subtle hover:bg-light-soft dark:hover:bg-dark-subtle focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
      >
        Menu
        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 py-1 z-20 rounded-lg shadow-lg border bg-light border-border dark:bg-dark-soft dark:border-dark-subtle">
          {ACCOUNT_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setOpen(false)} className={menuItemClasses}>
              {label}
            </Link>
          ))}
          <button type="button" onClick={onLogout} className={menuItemClasses}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logoutAction);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    // The landing page, which is what "/" shows to a visitor who isn't logged in
    navigate("/");
  };

  return (
    <header
      className="
        flex items-center justify-between p-4 shadow-md
        bg-light text-light-text
        dark:bg-dark-soft dark:text-dark-text
      "
    >
      <h1 className="text-lg font-semibold">{getPageTitle(location.pathname)}</h1>

      {user && (
        <div className="flex items-center gap-2">
          <p className="text-sm hidden md:block">Hello, {user.name}</p>
          <UserMenu onLogout={handleLogout} />
        </div>
      )}
    </header>
  );
}
