import { Briefcase, Calendar, CalendarCheck, ClipboardList, FolderOpen, ListChecks, MessageSquareText } from "lucide-react";

export const GITHUB_URL = "https://github.com/CatherineSzobel/job-tracker";

// "How it works": the three numbered steps
export const HOW_IT_WORKS = [
  { title: "Add your applications", text: "Company, position, status, priority and link — or import them from Excel." },
  { title: "Prepare for interviews", text: "A prep page per interview with a checklist, the people you'll meet and your bank answers." },
  { title: "Follow up on time", text: "To-dos with due dates and a daily 08:00 reminder email, so nothing goes quiet." },
];

export const TECH_STACK = ["Laravel 12", "PHP 8.4", "React 19", "Vite", "Tailwind CSS v4", "Laravel Sanctum", "zustand", "PHPUnit"];

// linkUrl / linkLabel: a LinkedIn or portfolio link; null hides it
export const ABOUT = {
  name: "Catherine Szobel",
  text: "Full-stack developer; I built this to run my own job search.",
  linkUrl: null,
  linkLabel: null,
};

// "Everything your job search needs": pick a feature to see its screenshot. A feature whose screenshot
// file isn't there is left out.
export const LANDING_SHOWCASE = [
  {
    id: "applications",
    label: "Applications",
    icon: Briefcase,
    fileName: "applications.png",
    alt: "The applications page with job cards, tags and filters",
    caption: "Every application in a grid or grouped by date, with tags, filters and batch edits.",
  },
  {
    id: "interviews",
    label: "Interviews",
    icon: ClipboardList,
    fileName: "interviews.png",
    alt: "The interviews page with upcoming interview cards, filters and search",
    caption: "Upcoming and past interviews, with search and a calendar view.",
  },
  {
    id: "interview-prep",
    label: "Interview prep",
    icon: ListChecks,
    fileName: "interview-prep.png",
    alt: "An interview prep page with its checklist, people and linked bank answers",
    caption: "A checklist, the people you'll meet, your questions and a debrief for every interview.",
  },
  {
    id: "question-bank",
    label: "Question bank",
    icon: MessageSquareText,
    fileName: "question-bank.png",
    alt: "The question bank with prepared answers grouped by category",
    caption: "Write your answers once and link them into any interview.",
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: Calendar,
    fileName: "calendar.png",
    alt: "The calendar showing interviews and to-dos by day",
    caption: "Interviews and to-dos on one calendar, so nothing sneaks up on you.",
  },
  {
    id: "todos",
    label: "To-dos & reminders",
    icon: CalendarCheck,
    fileName: "todos.png",
    alt: "The to-do list with due dates and linked applications",
    caption: "Follow-ups with due dates, linked to their applications, plus a daily reminder email.",
  },
  {
    id: "documents",
    label: "Documents & links",
    icon: FolderOpen,
    fileName: "documents.png",
    alt: "The documents page with CVs, cover letters and portfolio links",
    caption: "CVs, cover letters and portfolio links, attached to the applications you sent them with.",
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
