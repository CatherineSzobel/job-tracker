import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Footer from "../Footer";

// Log in / Sign up: a slim header (wordmark, Back to home), the form centred on the page, the footer
function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-2 sm:px-8">
          <Link to="/" className="text-xl/8 font-bold text-ink">
            Job Tracker
          </Link>
          <Link to="/" className="inline-flex min-h-12 items-center gap-2 font-semibold text-accent-text">
            <ArrowLeft size={20} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8 md:py-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AuthLayout;
