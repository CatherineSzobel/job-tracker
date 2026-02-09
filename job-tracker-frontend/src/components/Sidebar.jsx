import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import {
  Home,
  ClipboardList,
  Calendar,
  User,
  Link as LinkIcon,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react"; // Optional icons

export default function Sidebar() {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false); // Sidebar collapse state
  const [menuOpen, setMenuOpen] = useState(false); // Mobile menu
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    API.get("/user")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleMenuChange = (e) => {
    const value = e.target.value;
    if (value === "logout") {
      API.post("/logout")
        .then(() => {
          setUser(null);
          localStorage.removeItem("token");
          navigate("/login");
        })
        .catch(console.error);
    } else {
      navigate(`/${value}`);
    }
    e.target.value = "";
  };

  const links = [
    { name: "Dashboard", to: "/", icon: <Home size={20} /> },
    { name: "Applications", to: "/applications", icon: <ClipboardList size={20} /> },
    { name: "Interviews", to: "/interviews", icon: <ClipboardList size={20} /> },
    { name: "Calendar", to: "/calendar", icon: <Calendar size={20} /> },
  ];

  return (
    <div className="flex">
      {/* Desktop Sidebar */}
      <aside
        className={`bg-primary-soft text-surface min-h-screen p-4 shadow-lg flex flex-col justify-between transition-all duration-300
        ${collapsed ? "w-20" : "w-64"} hidden lg:flex`}
      >
        {/* Logo + Collapse Button */}
        <div className="flex items-center justify-between mb-8">
          {!collapsed && (
            <Link to="/" className="text-xl font-bold hover:text-accent">
              Job Tracker
            </Link>
          )}
          <button
            className="p-1 rounded hover:bg-primary"
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
              className={`flex items-center gap-2 p-2 rounded hover:bg-primary hover:text-surface transition-colors
                ${location.pathname === link.to ? "bg-accent text-surface" : ""}`}
            >
              {link.icon}
              {!collapsed && link.name}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="mt-4">
          {user ? (
            <div className={`flex flex-col gap-2 ${collapsed ? "items-center" : ""}`}>
              {!collapsed && <p className="text-sm">{`Hello, ${user.name}`}</p>}
              <select
                onChange={handleMenuChange}
                defaultValue=""
                className={`text-sm rounded border border-border p-1 bg-surface text-primary hover:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all
                  ${collapsed ? "w-12" : "w-full"}`}
              >
                <option value="" disabled>
                  Menu
                </option>
                <option value="profile">Profile</option>
                <option value="links">Links</option>
                <option value="settings">Settings</option>
                <option value="logout">Logout</option>
              </select>
            </div>
          ) : (
            <div className={`flex flex-col gap-2 text-sm ${collapsed ? "items-center" : ""}`}>
              <Link to="/register" className="hover:text-accent-soft">
                {!collapsed ? "Register" : "R"}
              </Link>
              <Link to="/login" className="hover:text-accent-soft">
                {!collapsed ? "Login" : "L"}
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden flex flex-col w-full">
        <div className="flex items-center justify-between p-4 bg-primary-soft shadow-md">
          <Link to="/" className="text-lg font-bold hover:text-accent">
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
          <div className="flex flex-col p-4 gap-2 bg-primary-soft">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`p-2 rounded hover:bg-primary hover:text-surface ${
                  location.pathname === link.to ? "bg-accent text-surface" : ""
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
                className="text-sm rounded border border-border p-1 bg-surface text-primary hover:border-accent focus:outline-none focus:ring-1 focus:ring-accent mt-2"
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
                <Link to="/register" className="hover:text-accent-soft">
                  Register
                </Link>
                <Link to="/login" className="hover:text-accent-soft">
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
