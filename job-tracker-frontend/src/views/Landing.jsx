import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Github, Play } from "lucide-react";
import Footer from "../components/Footer";
import LandingHeader from "../components/Landing/LandingHeader";
import Screenshot from "../components/Landing/Screenshot";
import SectionHeading from "../components/Landing/SectionHeading";
import Showcase from "../components/Landing/Showcase";
import { ABOUT, GITHUB_URL, HOW_IT_WORKS, TECH_STACK, screenshotFor } from "../constants/landing";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeStore } from "../stores/useThemeStore";
import { showToast } from "../stores/useToastStore";

// Each section's content column: 1280px max, 16px gutter on phones, 32px from sm
const CONTAINER = "mx-auto w-full max-w-[1280px] px-4 sm:px-8";

// The 56px landing calls to action (full class strings: btn-primary's own height and padding would clash)
const CTA_BASE = "inline-flex min-h-14 flex-auto items-center justify-center gap-2 rounded-lg px-6 text-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const CTA_CLASSES = {
  primary: `${CTA_BASE} bg-accent text-white not-disabled:hover:bg-accent-hover`,
  outline: `${CTA_BASE} border border-input bg-surface text-ink hover:bg-soft`,
  // On the navy sign-up band
  onAccent: `${CTA_BASE} bg-white text-accent not-disabled:hover:bg-white/90`,
  onAccentOutline: `${CTA_BASE} border border-white text-white hover:bg-white/10`,
};

const EYEBROW_CLASSES = "text-sm/6 font-semibold tracking-[0.08em] text-accent-text uppercase";

const FOOTER_LINKS = [
  { label: "GitHub", href: GITHUB_URL },
  { label: "Log in", to: "/login" },
  { label: "Sign up", to: "/register" },
];

// What Job Tracker is and does, for visitors who aren't logged in (shown at "/" by ProtectedRoute)
export default function Landing() {
  const demoLoginAction = useAuthStore((state) => state.demoLoginAction);
  const [loggingIn, setLoggingIn] = useState(false);
  const darkMode = useThemeStore((state) => state.darkMode);
  const dashboardScreenshot = screenshotFor("dashboard.png", darkMode);

  const tryDemo = async () => {
    setLoggingIn(true);
    try {
      // Once the user is set, ProtectedRoute shows the Dashboard at "/" by itself
      await demoLoginAction();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Demo login failed");
    } finally {
      setLoggingIn(false);
    }
  };

  const demoLabel = loggingIn ? "Logging in…" : "Try the demo";

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero: the text, then the dashboard screenshot beside it (below it on phones) */}
        <section aria-labelledby="hero-heading" className={`${CONTAINER} flex flex-wrap items-center gap-12 py-12 md:py-16 lg:py-24`}>
          <div className={`flex min-w-0 flex-[1_1_400px] flex-col gap-6 ${dashboardScreenshot ? "" : "mx-auto max-w-3xl items-center text-center"}`}>
            <p className="self-start rounded-full bg-accent-soft px-3 py-1 text-sm/6 font-semibold text-accent-text">
              A portfolio project by {ABOUT.name}
            </p>
            <h1 id="hero-heading" className="text-[clamp(40px,4.4vw,56px)] leading-[1.15] font-bold tracking-[-0.02em]">
              Keep every job application, interview and follow-up in one place.
            </h1>
            <p className="max-w-[560px] text-lg/8 text-muted">
              Track your applications, prepare for interviews and never miss a follow-up — all in one dashboard.
            </p>
            <div className="flex flex-wrap gap-4">
              <button type="button" onClick={tryDemo} disabled={loggingIn} className={CTA_CLASSES.primary}>
                <Play size={20} aria-hidden="true" />
                {demoLabel}
              </button>
              <Link to="/register" className={CTA_CLASSES.outline}>
                Create an account
              </Link>
            </div>
            <p className="flex items-center gap-2 text-sm/6 text-muted">
              <Check size={16} strokeWidth={2.5} aria-hidden="true" className="shrink-0 text-accent-text" />
              The demo is a shared sample account — no sign-up needed.
            </p>
          </div>
          {dashboardScreenshot && (
            <figure className="min-w-0 flex-[1.25_1_560px]">
              <Screenshot src={dashboardScreenshot} alt="The Job Tracker dashboard: today's agenda, reminders and quick to-dos" />
            </figure>
          )}
        </section>

        {/* How it works */}
        <section aria-labelledby="steps-heading" className="border-t border-line">
          <div className={`${CONTAINER} flex flex-col gap-12 py-16 lg:py-24`}>
            <SectionHeading id="steps-heading" title="How it works" subtitle="Three steps from the first application to the follow-up." />
            <ol className="grid gap-8 md:grid-cols-3">
              {HOW_IT_WORKS.map((step, index) => (
                <li key={step.title} className="flex flex-col gap-4">
                  <span aria-hidden="true" className="inline-flex size-12 items-center justify-center rounded-full bg-accent text-xl font-bold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-2xl/8 font-bold">{step.title}</h3>
                  <p className="text-lg/8 text-muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <Showcase />

        {/* About: who built it, and the tech stack */}
        <section aria-label="About" className={`${CONTAINER} grid gap-12 py-16 md:grid-cols-2 lg:py-24`}>
          <div className="flex flex-col gap-4">
            <p className={EYEBROW_CLASSES}>About</p>
            <h2 className="text-[clamp(28px,2.8vw,32px)] leading-10 font-bold">Built by {ABOUT.name}</h2>
            <p className="text-lg/8 text-muted">
              {ABOUT.text}
              {ABOUT.linkUrl && (
                <>
                  {" "}
                  <a href={ABOUT.linkUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text hover:underline">
                    {ABOUT.linkLabel}
                  </a>
                </>
              )}
            </p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 self-start rounded-lg border border-accent-text px-4 font-semibold text-accent-text transition-colors hover:bg-accent-soft"
            >
              <Github size={20} aria-hidden="true" />
              View on GitHub
            </a>
          </div>
          <div className="flex flex-col gap-4">
            <p className={EYEBROW_CLASSES}>Built with</p>
            <ul className="grid grid-cols-2 gap-2">
              {TECH_STACK.map((technology) => (
                <li key={technology} className="rounded-lg border border-line bg-soft px-4 py-3 font-medium">
                  {technology}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sign-up band */}
        <section aria-labelledby="cta-heading" className="bg-accent text-white">
          <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-8 py-12 lg:py-20`}>
            <div className="flex flex-[1_1_400px] flex-col gap-2">
              <h2 id="cta-heading" className="text-[clamp(28px,2.8vw,32px)] leading-10 font-bold">
                Start tracking your job search today.
              </h2>
              <p className="text-lg/8 text-white/85">Look around the demo first — no sign-up needed.</p>
            </div>
            <div className="flex flex-auto flex-wrap gap-4 md:flex-none">
              <button type="button" onClick={tryDemo} disabled={loggingIn} className={CTA_CLASSES.onAccent}>
                {demoLabel}
              </button>
              <Link to="/register" className={CTA_CLASSES.onAccentOutline}>
                Create an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer links={FOOTER_LINKS} />
    </div>
  );
}
