import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Archive, Bookmark, CircleCheck, History, MessagesSquare, Paperclip, Send, Shuffle } from "lucide-react";
import API from "../../api/axios";
import { interviewTypeLabel, jobStatusLabel } from "../../constants/jobs";
import Card from "../UI/Card";
import PageLoader from "../UI/PageLoader";

// Each event type's icon and what it says (GET /job-applications/{id}/activity, ApplicationActivityService)
const EVENTS = {
  saved: { icon: Bookmark, text: () => "Saved for later" },
  applied: { icon: Send, text: () => "Applied" },
  status: { icon: Shuffle, text: (event) => `${jobStatusLabel(event.from)} → ${jobStatusLabel(event.to)}` },
  interview: {
    icon: MessagesSquare,
    text: (event) => (
      <Link to={`/interviews/${event.interview_id}?tab=debrief`} className="font-semibold text-accent-text hover:underline">
        {interviewTypeLabel(event.interview_type)} interview
      </Link>
    ),
  },
  todo_done: { icon: CircleCheck, text: (event) => `Done: ${event.text}` },
  document_sent: { icon: Paperclip, text: (event) => `Sent ${event.document_name}` },
  archived: { icon: Archive, text: () => "Archived" },
};

// The application's history, newest first. refreshKey: anything that changes when the history may have (a save,
// a status change, a to-do ticked off, documents attached), so it's fetched again.
export default function ApplicationActivity({ jobId, refreshKey }) {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    // Ignore a response that arrives after a newer request
    let current = true;
    API.get(`/job-applications/${jobId}/activity`)
      .then((res) => current && setEvents(res.data.data))
      .catch((err) => console.error(err));
    return () => {
      current = false;
    };
  }, [jobId, refreshKey]);

  return (
    <Card title="Activity" icon={History}>
      {events === null ? (
        <PageLoader text="Loading activity..." compact />
      ) : events.length === 0 ? (
        <p className="text-muted">Nothing yet.</p>
      ) : (
        <ol className="flex flex-col">
          {events.map((event, index) => {
            const { icon: Icon, text } = EVENTS[event.type] ?? { icon: History, text: () => event.type };
            const isLast = index === events.length - 1;
            return (
              <li key={`${event.type}-${event.at}-${index}`} className="flex gap-3">
                {/* The icon with a line down to the next one */}
                <div className="flex flex-col items-center">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-text">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  {!isLast && <span aria-hidden="true" className="w-px flex-1 bg-line" />}
                </div>
                <div className={`flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 pt-1 ${isLast ? "" : "pb-4"}`}>
                  <span className="min-w-0 break-words">{text(event)}</span>
                  <time dateTime={event.at} className="shrink-0 text-sm text-muted">
                    {format(parseISO(event.at), "d MMM yyyy")}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
