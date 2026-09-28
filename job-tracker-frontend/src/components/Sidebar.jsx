import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ChevronLeft } from "lucide-react";
import { NAV_LINKS } from "../constants/navigation";

const linkClasses = (isActive) =>
  `rounded transition-colors ${isActive
    ? "bg-accent text-surface"
    : "hover:bg-light-soft hover:text-light-text dark:hover:bg-dark-soft dark:hover:text-dark-text"
  }`;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex">
      {/* Desktop Sidebar */}
      <aside
        className={`min-h-screen flex flex-col justify-between p-4 shadow-lg transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          bg-light-soft text-light-text dark:bg-dark-soft dark:text-dark-text hidden lg:flex`}
      >
        {/* Logo + Collapse */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <Link to="/" className="text-xl font-bold hover:text-accent dark:hover:text-accent-soft">
              Job Tracker
            </Link>
          )}
          <button
            className="p-1 rounded hover:bg-border dark:hover:bg-dark-subtle transition-colors"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 flex flex-col gap-2">
          {NAV_LINKS.map(({ to, label, icon }) => {
            const Icon = icon;
            return (
              <Link
                key={to}
                to={to}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-2 p-2 ${linkClasses(location.pathname === to)}`}
              >
                <Icon size={20} />
                {!collapsed && label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden flex flex-col w-full">
        <div className="flex items-center justify-between p-4 bg-light-soft dark:bg-dark-soft shadow-md transition-colors">
          <Link to="/" className="text-lg font-bold hover:text-accent dark:hover:text-accent-soft">
            Job Tracker
          </Link>
          <button
            className="text-xl px-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <nav className="flex flex-col p-4 gap-2 bg-light-soft dark:bg-dark-soft transition-colors">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`p-2 ${linkClasses(location.pathname === to)}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
