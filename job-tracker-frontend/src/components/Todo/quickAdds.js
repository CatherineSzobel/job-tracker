import { format, isAfter, max, parseISO, startOfToday, subDays } from "date-fns";
import { isoDateFromToday } from "../../utils/dueDate";

// The earliest interview that hasn't started yet, or undefined
function findNextInterviewDate(interviews = []) {
  return interviews
    .map((interview) => parseISO(interview.interview_date))
    .filter((date) => isAfter(date, new Date()))
    .sort((earlier, later) => earlier - later)[0];
}

// Suggested follow-ups for an application: [{ label, text, due_date }]. They only prefill the add form.
export function followUpQuickAdds(job) {
  const nextInterview = findNextInterviewDate(job.interviews);

  return [
    { label: "Follow up in 1 week", text: `Follow up with ${job.company_name}`, due_date: isoDateFromToday(7) },
    { label: "Send thank-you note", text: `Send thank-you note to ${job.company_name}`, due_date: isoDateFromToday(1) },
    // The day before the interview, but never in the past (an interview later today → today)
    nextInterview && {
      label: "Prepare for interview",
      text: `Prepare for interview at ${job.company_name}`,
      due_date: format(max([subDays(nextInterview, 1), startOfToday()]), "yyyy-MM-dd"),
    },
  ].filter(Boolean);
}
