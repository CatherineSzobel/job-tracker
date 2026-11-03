import { fromDateTimeInputValue, toDateTimeInputValue } from "../../utils/dateInput";

// InterviewForm's values for editing an interview from the API
export function toInterviewForm(interview) {
  return {
    job_id: interview.job_application_id,
    type: interview.type ?? "",
    interview_date: toDateTimeInputValue(interview.interview_date),
    location: interview.location ?? "",
    meeting_url: interview.meeting_url ?? "",
    notes: interview.notes ?? "",
  };
}

// The request body for creating or updating an interview from InterviewForm's values:
// the date and time as UTC, empty fields as null (job_id goes in the URL instead)
export function toInterviewPayload(form) {
  return {
    type: form.type,
    interview_date: fromDateTimeInputValue(form.interview_date),
    location: form.location || null,
    meeting_url: form.meeting_url || null,
    notes: form.notes || null,
  };
}
