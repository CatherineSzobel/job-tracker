import { ChevronRight } from "lucide-react";
import { groupJobsByDate } from "../../utils/groupJobsByDate";

const GRID_CLASSES = "grid gap-6 mt-3 mb-2 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
const SECTION_CLASSES = "group/year rounded-xl bg-surface dark:bg-dark-soft p-3 sm:p-4 shadow-sm border border-border dark:border-dark-subtle transition-colors";
// list-none + the webkit rule hide the browser's own triangle; ours rotates instead
const SUMMARY_CLASSES = "list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none flex flex-wrap items-center gap-2 rounded-lg px-2 py-2 text-light-text dark:text-dark-text hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors";
const COUNT_CLASSES = "px-2 py-0.5 rounded-full text-xs font-medium bg-light-soft dark:bg-dark-subtle text-light-muted dark:text-dark-muted";

function countLabel(count) {
  return `${count} application${count === 1 ? "" : "s"}`;
}

// Collapsible year → month sections (native <details>). The newest year and its newest month start open.
// renderJob(job) draws a card. renderGroupActions(jobs) can add controls to a month header; a button
// inside <summary> must call event.preventDefault(), or clicking it also opens/closes the section.
export default function JobGroups({ jobs, renderJob, renderGroupActions }) {
  const groups = groupJobsByDate(jobs);

  return (
    <div className="flex flex-col gap-4">
      {groups.map(({ year, months }, yearIndex) => {
        if (year === null) {
          const [undated] = months;
          return (
            <details key="undated" open={groups.length === 1} className={SECTION_CLASSES}>
              <summary className={`${SUMMARY_CLASSES} text-lg font-semibold`}>
                <ChevronRight size={20} aria-hidden="true" className="transition-transform group-open/year:rotate-90" />
                {undated.label}
                <span className={COUNT_CLASSES}>{countLabel(undated.jobs.length)}</span>
                {renderGroupActions?.(undated.jobs)}
              </summary>
              <div className={GRID_CLASSES}>{undated.jobs.map(renderJob)}</div>
            </details>
          );
        }

        const yearCount = months.reduce((total, month) => total + month.jobs.length, 0);
        return (
          <details key={year} open={yearIndex === 0} className={SECTION_CLASSES}>
            <summary className={`${SUMMARY_CLASSES} text-lg font-semibold`}>
              <ChevronRight size={20} aria-hidden="true" className="transition-transform group-open/year:rotate-90" />
              {year}
              <span className={COUNT_CLASSES}>{countLabel(yearCount)}</span>
            </summary>

            <div className="mt-1 ml-2 sm:ml-4 flex flex-col gap-1 border-l border-border dark:border-dark-subtle pl-2 sm:pl-3">
              {months.map((month, monthIndex) => (
                <details key={month.key} open={yearIndex === 0 && monthIndex === 0} className="group/month">
                  <summary className={`${SUMMARY_CLASSES} font-medium`}>
                    <ChevronRight size={18} aria-hidden="true" className="transition-transform group-open/month:rotate-90" />
                    {month.label}
                    <span className={COUNT_CLASSES}>{countLabel(month.jobs.length)}</span>
                    {renderGroupActions?.(month.jobs)}
                  </summary>
                  <div className={GRID_CLASSES}>{month.jobs.map(renderJob)}</div>
                </details>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
