import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/user")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  // Load saved dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem("darkMode") === "true";
    setDarkMode(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("darkMode", next);
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

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

  return (
    <header
      className="
        flex items-center justify-between p-4 shadow-md
        bg-white text-gray-900
        dark:bg-gray-900 dark:text-gray-100
      "
    >
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="
            p-2 rounded transition-colors
            hover:bg-gray-200
            dark:hover:bg-gray-800
          "
          title="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <p className="text-sm hidden md:block">
              Hello, {user.name}
            </p>

            <select
              onChange={handleMenuChange}
              defaultValue=""
              className="
                text-sm rounded border p-1
                bg-white text-gray-900 border-gray-300
                dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
                focus:outline-none focus:ring-1 focus:ring-accent
              "
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
          <div className="flex gap-3 text-sm">
            <Link to="/register" className="hover:underline">
              Register
            </Link>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
