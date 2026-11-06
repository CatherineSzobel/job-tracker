import { useState } from "react";
import { Link } from "react-router-dom";
import PriorityLabel from "../UI/PriorityLabel";
import StatusChip from "../UI/StatusChip";
import { JOB_STATUSES, jobStatusLabel } from "../../constants/jobs";
import { formatShortDate } from "../../utils/formatDate";
import { formatSalary } from "../../utils/formatSalary";

// One application on the board: position (link), company, priority, when applied (or the deadline while
// it's only saved) and the salary. Drag it with a mouse, or pick a column from its "Move to" list (keyboard, phones).
function BoardCard({ job, dragging, onDragStart, onDragEnd, onMove }) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, { compact: true });
  const when = job.status === "saved" ? job.deadline && `Apply by ${formatShortDate(job.deadline)}` : job.applied_date && `Applied ${formatShortDate(job.applied_date)}`;

  return (
    <li
      draggable
      onDragStart={(event) => onDragStart(event, job)}
      onDragEnd={onDragEnd}
      className={`flex cursor-grab flex-col gap-2 rounded-xl border border-line bg-surface p-3 active:cursor-grabbing ${dragging ? "opacity-50" : ""}`}
    >
      <div className="flex min-w-0 flex-col">
        {/* Not draggable itself, so dragging anywhere on the card moves the card, not the link */}
        <Link to={`/jobs/${job.id}`} draggable={false} className="font-semibold break-words text-ink hover:underline">
          {job.position}
        </Link>
        <span className="text-sm break-words text-muted">{job.company_name}</span>
      </div>
      <PriorityLabel priority={job.priority} />
      {(when || salary) && <p className="text-sm text-muted">{[when, salary].filter(Boolean).join(" · ")}</p>}
      <select
        aria-label={`Move ${job.position} at ${job.company_name} to`}
        value={job.status}
        onChange={(event) => onMove(job, event.target.value)}
        className="input-field min-h-10 py-1 text-sm"
      >
        {JOB_STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>
            {value === job.status ? label : `Move to ${label}`}
          </option>
        ))}
      </select>
    </li>
  );
}

// Applications as a board: a column per status (all of them, so a card can be dropped into an empty one).
// Drag a card to another column, or use its "Move to" list, to change its status: onMove(job, status) saves it and resolves to true when it
// worked. jobs: already filtered and sorted; each column keeps that order.
export default function ApplicationBoard({ jobs, onMove }) {
  const [draggedJob, setDraggedJob] = useState(null);
  const [overStatus, setOverStatus] = useState(null);
  // Read out by screen readers after a move, since the card leaves the column it was in
  const [announcement, setAnnouncement] = useState("");

  const move = async (job, status) => {
    if (job.status === status) return;
    if (await onMove(job, status)) {
      setAnnouncement(`Moved ${job.position} at ${job.company_name} to ${jobStatusLabel(status)}`);
    }
  };

  const startDrag = (event, job) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(job.id));
    setDraggedJob(job);
  };

  const endDrag = () => {
    setDraggedJob(null);
    setOverStatus(null);
  };

  const drop = (event, status) => {
    event.preventDefault();
    const job = draggedJob;
    endDrag();
    if (job) move(job, status);
  };

  return (
    <>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {/* Scrolls sideways when the columns don't fit; on phones one column at a time snaps into place */}
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:snap-none sm:scroll-px-0 sm:px-0">
        {JOB_STATUSES.map(({ value: status, label }) => {
          const columnJobs = jobs.filter((job) => job.status === status);
          const isDropTarget = draggedJob && draggedJob.status !== status && overStatus === status;
          return (
            <section
              key={status}
              aria-label={`${label}: ${columnJobs.length}`}
              onDragOver={(event) => {
                if (!draggedJob) return;
                event.preventDefault();
                setOverStatus(status);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOverStatus(null);
              }}
              onDrop={(event) => drop(event, status)}
              className={`flex w-[min(18rem,85vw)] shrink-0 snap-start flex-col gap-3 rounded-2xl bg-soft p-3 transition-shadow ${
                isDropTarget ? "ring-2 ring-accent" : ""
              }`}
            >
              <h2 className="flex items-center justify-between gap-2">
                <StatusChip status={status} />
                <span className="text-sm font-semibold text-muted">{columnJobs.length}</span>
              </h2>
              {columnJobs.length === 0 ? (
                <p className="rounded-xl border border-dashed border-line p-4 text-center text-sm text-muted">
                  {draggedJob ? "Drop here" : "None"}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {columnJobs.map((job) => (
                    <BoardCard
                      key={job.id}
                      job={job}
                      dragging={draggedJob?.id === job.id}
                      onDragStart={startDrag}
                      onDragEnd={endDrag}
                      onMove={move}
                    />
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
