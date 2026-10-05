import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import FeatureCard from "../components/Landing/FeatureCard";
import LandingHeader from "../components/Landing/LandingHeader";
import Screenshot from "../components/Landing/Screenshot";
import { ABOUT, GITHUB_URL, LANDING_FEATURES, TECH_STACK, screenshotFor } from "../constants/landing";
import { useAuthStore } from "../stores/useAuthStore";
import { showToast } from "../stores/useToastStore";

const EXTERNAL_LINK_CLASSES = "text-accent dark:text-accent-muted hover:underline";

// What Job Tracker is and does, for visitors who aren't logged in (shown at "/" by ProtectedRoute)
export default function Landing() {
  const navigate = useNavigate();
  const demoLoginAction = useAuthStore((state) => state.demoLoginAction);
  const [loggingIn, setLoggingIn] = useState(false);
  const dashboardScreenshot = screenshotFor("dashboard.png");
  const prepScreenshot = screenshotFor("interview-prep.png");

  const tryDemo = async () => {
    setLoggingIn(true);
    try {
      await demoLoginAction();
      navigate("/");
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Demo login failed");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-light dark:bg-dark transition-colors">
      <LandingHeader />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 flex flex-col gap-16 sm:gap-24 py-10 sm:py-16">
        {/* Hero */}
        <section className={`grid gap-10 items-center ${dashboardScreenshot ? "lg:grid-cols-2" : ""}`}>
          <div className={`flex flex-col gap-6 ${dashboardScreenshot ? "" : "max-w-3xl mx-auto text-center items-center"}`}>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-light-text dark:text-dark-text">
              Keep every job application, interview and follow-up in one place.
            </h1>
            <p className="text-lg text-light-muted dark:text-dark-muted">
              Track your applications, prepare for interviews and never miss a follow-up — all in one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button type="button" onClick={tryDemo} disabled={loggingIn} className="btn-primary shadow px-6 py-3 text-lg">
                {loggingIn ? "Logging in…" : "Try the demo"}
              </button>
              <Link to="/register" className="btn-toolbar px-6 py-3 text-lg text-center">
                Create an account
              </Link>
            </div>
            <p className="text-sm text-light-muted dark:text-dark-muted">The demo is a shared sample account — no sign-up needed.</p>
          </div>
          <Screenshot src={dashboardScreenshot} alt="The Job Tracker dashboard: today's agenda, reminders and quick to-dos" />
        </section>

        {/* Features */}
        <section aria-labelledby="features-heading" className="flex flex-col gap-8">
          <h2 id="features-heading" className="text-2xl sm:text-3xl font-bold text-center text-light-text dark:text-dark-text">
            Everything your job search needs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LANDING_FEATURES.map((feature) => (
              <FeatureCard key={feature.title} icon={feature.icon} title={feature.title} text={feature.text} />
            ))}
          </div>
        </section>

        {/* Highlight */}
        <section className="max-w-4xl mx-auto w-full">
          <Screenshot
            src={prepScreenshot}
            alt="An interview prep page with its checklist, people and linked bank answers"
            caption="Prepare for every interview: checklist, people, questions and your bank answers in one place."
            lazy
          />
        </section>

        {/* Built with + About */}
        <section className="flex flex-col items-center gap-6 text-center">
          <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">Built with</h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {TECH_STACK.map((technology) => (
              <li
                key={technology}
                className="px-3 py-1 rounded-full text-sm bg-light-soft dark:bg-dark-soft border border-border dark:border-dark-subtle text-light-text dark:text-dark-text"
              >
                {technology}
              </li>
            ))}
          </ul>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={`font-medium ${EXTERNAL_LINK_CLASSES}`}>
            View on GitHub →
          </a>
          <p className="max-w-2xl text-light-muted dark:text-dark-muted">
            Built by <strong className="text-light-text dark:text-dark-text">{ABOUT.name}</strong> — {ABOUT.text}
            {ABOUT.linkUrl && (
              <>
                {" "}
                <a href={ABOUT.linkUrl} target="_blank" rel="noopener noreferrer" className={EXTERNAL_LINK_CLASSES}>
                  {ABOUT.linkLabel}
                </a>
              </>
            )}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
