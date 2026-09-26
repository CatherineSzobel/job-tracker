import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ClipboardList,
  Briefcase,
  Calendar,
  Menu,
  ChevronLeft,
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();


  const links = [
    { name: "Dashboard", to: "/", icon: <Home size={20} /> },
    { name: "Applications", to: "/applications", icon: <Briefcase size={20} /> },
    { name: "Interviews", to: "/interviews", icon: <ClipboardList size={20} /> },
    { name: "Calendar", to: "/calendar", icon: <Calendar size={20} /> },
  ];

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
            className="p-1 rounded hover:bg-light-muted dark:hover:bg-dark-subtle transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 p-2 rounded transition-colors
                ${location.pathname === link.to
                  ? "bg-accent text-surface"
                  : "hover:bg-light-soft hover:text-light-text dark:hover:bg-dark-soft dark:hover:text-dark-text"
                }`}
            >
              {link.icon}
              {!collapsed && link.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden flex flex-col w-full">
        <div className="flex items-center justify-between p-4 bg-light-soft dark:bg-dark-soft shadow-md transition-colors">
          <Link to="/" className="text-lg font-bold hover:text-accent dark:hover:text-accent-soft">
            Job Tracker
          </Link>
          <button
            className="text-xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="flex flex-col p-4 gap-2 bg-light-soft dark:bg-dark-soft transition-colors">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`p-2 rounded transition-colors
                  ${location.pathname === link.to
                    ? "bg-accent text-surface"
                    : "hover:bg-light-soft hover:text-light-text dark:hover:bg-dark-soft dark:hover:text-dark-text"
                  }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
