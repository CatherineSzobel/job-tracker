// Mirrors the backend enums in app/Enums (JobStatus, Priority, InterviewType)

// In pipeline order, then the ways an application ends without an offer. Saved: not applied for yet.
export const JOB_STATUSES = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
  { value: "no_response", label: "No response" },
  { value: "withdrawn", label: "Withdrawn" },
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
// Saved, No response and Withdrawn borrow tag colours (index.css), so no new tokens are needed.
export const STATUS_BADGE_CLASSES = {
  saved: "bg-tag-violet-bg text-tag-violet-fg",
  applied: "bg-applied-bg text-applied-fg",
  interview: "bg-interview-bg text-interview-fg",
  offer: "bg-offer-bg text-offer-fg",
  rejected: "bg-rejected-bg text-rejected-fg",
  no_response: "bg-tag-slate-bg text-tag-slate-fg",
  withdrawn: "bg-tag-teal-bg text-tag-teal-fg",
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

// The Dashboard's "Applications by status" bar colours. Full class strings (not built at runtime) so Tailwind can find them.
export const STATUS_BAR_CLASSES = {
  saved: "bg-tag-violet-fg",
  applied: "bg-accent",
  interview: "bg-bar-interview",
  offer: "bg-bar-offer",
  rejected: "bg-bar-rejected",
  no_response: "bg-tag-slate-fg",
  withdrawn: "bg-tag-teal-fg",
};

// The application page's header fields, shown as inputs while editing
export const APPLICATION_EDIT_FIELDS = [
  { name: "position", label: "Position", required: true },
  { name: "company_name", label: "Company", required: true },
  { name: "location", label: "Location", required: true },
  { name: "job_link", label: "Link to the posting", type: "url" },
];
