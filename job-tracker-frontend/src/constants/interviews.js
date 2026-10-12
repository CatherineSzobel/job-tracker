import { MapPin, Phone, Video } from "lucide-react";

// The icon for each interview type (App\Enums\InterviewType)
export const INTERVIEW_TYPE_ICONS = { phone: Phone, online: Video, onsite: MapPin };

// The date filter on the Interviews page; "upcoming" is the default
export const INTERVIEW_WHEN_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "all", label: "All" },
];
