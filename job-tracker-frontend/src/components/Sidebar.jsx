import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
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
  const navigate = useNavigate();
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
            {user ? (
              <select
                onChange={handleMenuChange}
                defaultValue=""
                className="text-sm rounded border p-1 bg-light text-light-text border-light-muted hover:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:bg-dark dark:text-dark-text border-dark-subtle dark:hover:border-accent dark:focus:ring-accent mt-2 transition-colors"
              >
                <option value="" disabled>
                  Menu
                </option>
                <option value="profile">Profile</option>
                <option value="links">Links</option>
                <option value="settings">Settings</option>
                <option value="logout">Logout</option>
              </select>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link to="/register" className="hover:text-accent dark:hover:text-accent-soft">
                  Register
                </Link>
                <Link to="/login" className="hover:text-accent dark:hover:text-accent-soft">
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
