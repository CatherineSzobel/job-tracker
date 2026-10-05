import { Briefcase, CalendarCheck, ClipboardList, FolderOpen, LayoutDashboard, MessageSquareText } from "lucide-react";

export const GITHUB_URL = "https://github.com/CatherineSzobel/job-tracker";

export const LANDING_FEATURES = [
  { icon: Briefcase, title: "Applications", text: "Grid or grouped by date, with tags, filters and batch edits." },
  { icon: ClipboardList, title: "Interviews & prep", text: "A checklist, the people you'll meet, your questions and a debrief for every interview." },
  { icon: MessageSquareText, title: "Question bank", text: "Your prepared answers, linked into each interview." },
  { icon: CalendarCheck, title: "To-dos & reminders", text: "Follow-ups with due dates and a daily reminder email." },
  { icon: LayoutDashboard, title: "Dashboard", text: "Today's agenda, goals and insights at a glance." },
  { icon: FolderOpen, title: "Documents & links", text: "CVs and portfolios, attached to the applications you sent them with." },
];

export const TECH_STACK = ["Laravel 12", "PHP 8.4", "React 19", "Vite", "Tailwind CSS v4", "Laravel Sanctum", "zustand", "PHPUnit"];

// linkUrl / linkLabel: a LinkedIn or portfolio link; null hides it
export const ABOUT = {
  name: "Catherine Szobel",
  text: "full-stack developer; I built this to run my own job search.",
  linkUrl: null,
  linkLabel: null,
};

// Screenshots are optional files in src/assets/landing/; a missing one simply isn't shown
const SCREENSHOT_FILES = import.meta.glob("../assets/landing/*.png", { eager: true, import: "default" });

export function screenshotFor(fileName) {
  return SCREENSHOT_FILES[`../assets/landing/${fileName}`] ?? null;
}
