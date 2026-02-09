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
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode);
      document.documentElement.classList.toggle("dark", newMode);
      return newMode;
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
    <header className="flex items-center justify-between p-4 bg-primary-soft shadow-md text-white">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>

      {/* Right: User info + Dark mode */}
      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded hover:bg-primary transition-colors"
          title="Toggle dark mode"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <div className="flex items-center gap-2">
            <p className="text-sm hidden md:block">{`Hello, ${user.name}`}</p>
            <select
              onChange={handleMenuChange}
              defaultValue=""
              className="text-sm rounded border border-border p-1 bg-surface text-primary hover:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
          <div className="flex gap-2 text-sm">
            <Link to="/register" className="hover:text-accent-soft">
              Register
            </Link>
            <Link to="/login" className="hover:text-accent-soft">
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
