// Mirrors the backend enums in app/Enums (JobStatus, Priority, InterviewType)

// In pipeline order, then the ways an application ends without an offer. Saved: not applied for yet.
// badge: the chip colours (UI/StatusChip); bar: the Dashboard's "Applications by status" bar. Full class strings
// (not built at runtime) so Tailwind can find them. Saved, No response and Withdrawn borrow tag colours (index.css).
export const JOB_STATUSES = [
  { value: "saved", label: "Saved", badge: "bg-tag-violet-bg text-tag-violet-fg", bar: "bg-tag-violet-fg" },
  { value: "applied", label: "Applied", badge: "bg-applied-bg text-applied-fg", bar: "bg-accent" },
  { value: "interview", label: "Interview", badge: "bg-interview-bg text-interview-fg", bar: "bg-bar-interview" },
  { value: "offer", label: "Offer", badge: "bg-offer-bg text-offer-fg", bar: "bg-bar-offer" },
  { value: "rejected", label: "Rejected", badge: "bg-rejected-bg text-rejected-fg", bar: "bg-bar-rejected" },
  { value: "no_response", label: "No response", badge: "bg-tag-slate-bg text-tag-slate-fg", bar: "bg-tag-slate-fg" },
  { value: "withdrawn", label: "Withdrawn", badge: "bg-tag-teal-bg text-tag-teal-fg", bar: "bg-tag-teal-fg" },
];

// The JOB_STATUSES entry for a status value, or undefined for an unknown one
export const jobStatusFor = (status) => JOB_STATUSES.find((option) => option.value === status);

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

// Where the job was found (ApplicationSource)
export const APPLICATION_SOURCES = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "company_website", label: "Company website" },
  { value: "job_board", label: "Job board" },
  { value: "referral", label: "Referral" },
  { value: "recruiter", label: "Recruiter" },
  { value: "other", label: "Other" },
];

// "Company website" for "company_website"; an unknown source is shown as is
export const sourceLabel = (source) => APPLICATION_SOURCES.find((option) => option.value === source)?.label ?? source;

// The salary currencies (Currency, ISO 4217 codes); euros unless picked otherwise
export const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "CAD", "AUD"];

// Same defaults as the backend (JobStatus::Applied, Priority::Medium, Currency::Eur)
export const DEFAULT_STATUS = "applied";
export const DEFAULT_PRIORITY = "medium";
export const DEFAULT_CURRENCY = "EUR";

// Blank "Add job" / "Add interview" form state
export const EMPTY_JOB = {
  position: "",
  company_name: "",
  location: "",
  status: DEFAULT_STATUS,
  priority: DEFAULT_PRIORITY,
  notes: "",
  job_link: "",
  salary_min: "",
  salary_max: "",
  salary_currency: DEFAULT_CURRENCY,
  source: "",
  contact_name: "",
  contact_details: "",
  deadline: "",
};

export const EMPTY_INTERVIEW = {
  job_id: "",
  type: "",
  interview_date: "",
  location: "",
  meeting_url: "",
  notes: "",
};

// "Applied" for "applied"; an unknown status is shown as is
export const jobStatusLabel = (status) => jobStatusFor(status)?.label ?? status;

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

// The application page's header fields, shown as inputs while editing
export const APPLICATION_EDIT_FIELDS = [
  { name: "position", label: "Position", required: true },
  { name: "company_name", label: "Company", required: true },
  { name: "location", label: "Location", required: true },
  { name: "job_link", label: "Link to the posting", type: "url" },
];
