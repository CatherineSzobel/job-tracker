import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../stores/useThemeStore";

// Moon/Sun icon button that switches between light and dark mode
export default function ThemeToggle() {
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  const label = darkMode ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button type="button" onClick={toggleDarkMode} aria-label={label} title={label} className="btn-icon">
      {darkMode ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
    </button>
  );
}
