import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../stores/useThemeStore";

// The landing page's top bar: the app name, the theme toggle, Log in and Sign up. It stays at the top while
// scrolling, with a see-through background so the page shows faintly underneath.
export default function LandingHeader() {
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-8 py-4 bg-light/85 dark:bg-dark/85 backdrop-blur border-b border-border dark:border-dark-subtle transition-colors">
      <Link to="/" className="text-xl font-bold text-light-text dark:text-dark-text hover:text-accent dark:hover:text-accent-soft">
        Job Tracker
      </Link>
      <nav className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={darkMode ? "Light mode" : "Dark mode"}
          className="p-2 rounded-lg text-light-text dark:text-dark-text hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <Link to="/login" className="btn-toolbar">
          Log in
        </Link>
        <Link to="/register" className="btn-primary">
          Sign up
        </Link>
      </nav>
    </header>
  );
}
