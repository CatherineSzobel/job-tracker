import { Link } from "react-router-dom";
import ThemeToggle from "../UI/ThemeToggle";

// The landing page's top bar: the app name, the theme toggle, Log in and Sign up. Stays at the top while scrolling.
export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-8">
        <Link to="/" className="text-xl/8 font-bold tracking-[-0.01em] text-ink">
          Job Tracker
        </Link>
        <nav aria-label="Account" className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="inline-flex min-h-12 items-center px-2 font-semibold text-ink underline-offset-4 hover:underline">
            Log in
          </Link>
          <Link to="/register" className="btn-primary">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
