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

// "On-site" for "onsite"; an unknown type is shown as is
export const interviewTypeLabel = (type) => INTERVIEW_TYPES.find((option) => option.value === type)?.label ?? type;

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

// "Applied" for "applied"; an unknown status is shown as is
export const jobStatusLabel = (status) => JOB_STATUSES.find((option) => option.value === status)?.label ?? status;

// Status chip colours (UI/StatusChip). Full class strings (not built at runtime) so Tailwind can find them.
export const STATUS_BADGE_CLASSES = {
  applied: "bg-applied-bg text-applied-fg",
  interview: "bg-interview-bg text-interview-fg",
  offer: "bg-offer-bg text-offer-fg",
  rejected: "bg-rejected-bg text-rejected-fg",
};

// Priority is coloured text with a flag (UI/PriorityLabel), not a second chip. Full class strings for Tailwind.
export const PRIORITY_TEXT_CLASSES = {
  high: "text-rejected-fg",
  medium: "text-interview-fg",
  low: "text-muted",
};

// "High" for "high"; an unknown priority is shown as is
export const priorityLabel = (priority) => PRIORITIES.find((option) => option.value === priority)?.label ?? priority;

// Mirrors the column defaults on users (daily_goal, weekly_goal)
export const DEFAULT_GOALS = { daily_goal: 5, weekly_goal: 20 };
