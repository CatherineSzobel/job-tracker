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

// The "See it in action" tabs; a tab whose screenshot file isn't there is left out
export const LANDING_SHOWCASE = [
  {
    id: "applications",
    label: "Applications",
    fileName: "applications.png",
    alt: "The applications page with job cards, tags and filters",
    caption: "Every application in a grid or grouped by date, with tags, filters and batch edits.",
  },
  {
    id: "interviews",
    label: "Interviews",
    fileName: "interviews.png",
    alt: "The interviews page with upcoming interview cards, filters and search",
    caption: "Upcoming and past interviews, with search and a calendar view.",
  },
  {
    id: "interview-prep",
    label: "Interview prep",
    fileName: "interview-prep.png",
    alt: "An interview prep page with its checklist, people and linked bank answers",
    caption: "Prepare for every interview: checklist, people, questions and your bank answers in one place.",
  },
  {
    id: "question-bank",
    label: "Question bank",
    fileName: "question-bank.png",
    alt: "The question bank with prepared answers grouped by category",
    caption: "Write your answers once and link them into any interview.",
  },
  {
    id: "calendar",
    label: "Calendar",
    fileName: "calendar.png",
    alt: "The calendar showing interviews and to-dos by day",
    caption: "Interviews and to-dos on one calendar, so nothing sneaks up on you.",
  },
  {
    id: "todos",
    label: "To-dos",
    fileName: "todos.png",
    alt: "The to-do list with due dates and linked applications",
    caption: "Follow-ups with due dates, linked to the applications they belong to.",
  },
  {
    id: "documents",
    label: "Documents",
    fileName: "documents.png",
    alt: "The documents page with CVs, cover letters and portfolio links",
    caption: "Keep every CV, cover letter and portfolio link in one place.",
  },
];

// Screenshots are optional files in src/assets/landing/; a missing one simply isn't shown. Each can have an
// optional dark-mode version next to it ("dashboard.png" → "dashboard-dark.png"), used in dark mode when present.
const SCREENSHOT_FILES = import.meta.glob("../assets/landing/*.png", { eager: true, import: "default" });

const fileUrl = (fileName) => SCREENSHOT_FILES[`../assets/landing/${fileName}`] ?? null;

export function screenshotFor(fileName, darkMode = false) {
  const lightUrl = fileUrl(fileName);
  if (!lightUrl || !darkMode) return lightUrl;
  return fileUrl(fileName.replace(/\.png$/, "-dark.png")) ?? lightUrl;
}
