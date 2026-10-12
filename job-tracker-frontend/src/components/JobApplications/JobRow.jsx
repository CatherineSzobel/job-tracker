import { Link } from "react-router-dom";
import { formatShortDate } from "../../utils/formatDate";
import StatusChip from "../UI/StatusChip";

// One application as a compact row (Applications "By date"): position, company · location, status, date.
// The whole row links to the detail page.
export default function JobRow({ job }) {
  return (
    <li>
      <Link
        to={`/jobs/${job.id}`}
        className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-ink transition-colors hover:bg-soft"
      >
        <span className="flex min-w-0 flex-[1_1_240px] flex-col">
          <strong className="font-semibold break-words">{job.position}</strong>
          <span className="text-sm text-muted">
            {job.company_name}
            {job.location && ` · ${job.location}`}
          </span>
        </span>
        <StatusChip status={job.status} />
        <span className="w-24 text-right text-sm text-muted">{formatShortDate(job.applied_date)}</span>
      </Link>
    </li>
  );
}
