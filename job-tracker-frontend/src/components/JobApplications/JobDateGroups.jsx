import { groupByRecency } from "../../utils/groupByDate";
import JobRow from "./JobRow";

// Applications "By date": "This week", "Last week", then month by month, each a list of compact rows.
// In select mode each group shows the cards instead (renderCard), so batch changes can be previewed,
// with a "Select all" for the group (onSelectAll(jobs)).
export default function JobDateGroups({ jobs, selecting = false, renderCard, onSelectAll }) {
  const groups = groupByRecency(jobs, (job) => job.applied_date);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const headingId = `applications-${group.key}`;
        return (
          <section key={group.key} aria-labelledby={headingId} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-4">
              <h2 id={headingId} className="group-label">
                {group.label}
              </h2>
              {selecting && onSelectAll && (
                <button
                  type="button"
                  onClick={() => onSelectAll(group.items)}
                  className="inline-flex min-h-10 items-center text-sm font-semibold text-accent-text hover:underline"
                >
                  Select all
                </button>
              )}
            </div>
            {selecting ? (
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">{group.items.map(renderCard)}</ul>
            ) : (
              <ul className="divide-y divide-subtle overflow-hidden rounded-2xl border border-line bg-surface">
                {group.items.map((job) => (
                  <JobRow key={job.id} job={job} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
