// Mirrors the backend enums in app/Enums (JobStatus, Priority, InterviewType)

export const JOB_STATUSES = [
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const INTERVIEW_TYPES = [
  { value: "phone", label: "Phone" },
  { value: "online", label: "Online" },
  { value: "onsite", label: "On-site" },
];

// Same defaults as the backend (JobStatus::Applied, Priority::Medium)
export const DEFAULT_STATUS = "applied";
export const DEFAULT_PRIORITY = "medium";

// Blank "Add job" / "Add interview" form state
export const EMPTY_JOB = {
  position: "",
  company_name: "",
  location: "",
  status: DEFAULT_STATUS,
  priority: DEFAULT_PRIORITY,
  notes: "",
  job_link: "",
};

export const EMPTY_INTERVIEW = {
  job_id: "",
  type: "",
  interview_date: "",
  location: "",
  notes: "",
};

// Hex colors for inline styles and charts
export const STATUS_COLORS = {
  applied: "#3b82f6",
  interview: "#facc15",
  offer: "#22c55e",
  rejected: "#ef4444",
  archived: "#06b6d4",
};

// Full class strings (not built at runtime) so Tailwind can find them
export const STATUS_BADGE_CLASSES = {
  applied: "bg-blue-200 text-blue-700 dark:bg-blue-700 dark:text-blue-300",
  interview: "bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300",
  offer: "bg-green-200 text-green-700 dark:bg-green-800 dark:text-green-300",
  rejected: "bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-300",
};

export const PRIORITY_CLASSES = {
  low: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
  medium: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
  high: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300",
};

// Mirrors the column defaults on users (daily_goal, weekly_goal)
export const DEFAULT_GOALS = { daily_goal: 5, weekly_goal: 20 };
