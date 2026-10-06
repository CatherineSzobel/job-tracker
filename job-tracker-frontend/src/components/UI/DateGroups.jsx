import { ChevronRight } from "lucide-react";
import { groupByDate } from "../../utils/groupByDate";
import { countOf } from "../../utils/plural";

const GRID_CLASSES = "grid gap-6 mt-3 mb-2 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
const SECTION_CLASSES = "group/year rounded-xl bg-surface dark:bg-dark-soft p-3 sm:p-4 shadow-sm border border-border dark:border-dark-subtle transition-colors";
// list-none + the webkit rule hide the browser's own triangle; ours rotates instead
const SUMMARY_CLASSES = "list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none flex flex-wrap items-center gap-2 rounded-lg px-2 py-2 text-light-text dark:text-dark-text hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors";
const COUNT_CLASSES = "px-2 py-0.5 rounded-full text-xs font-medium bg-light-soft dark:bg-dark-subtle text-light-muted dark:text-dark-muted";

// Collapsible year → month sections (native <details>); the first year and its first month start open.
// items are grouped by getDateString(item) in `order` ("newest" or "oldest" first, see groupByDate).
// itemLabel: "application", "interview", … for the counts. renderItem(item) draws a card.
// onSelectAll(items), when given (select mode), adds a "Select all" button to each month header.
export default function DateGroups({ items, getDateString, order = "newest", itemLabel, renderItem, onSelectAll }) {
  const groups = groupByDate(items, getDateString, order);
  const countLabel = (count) => countOf(count, itemLabel);

  // A button inside <summary> must preventDefault, or clicking it also opens/closes the section
  const selectAllButton = (groupItems) =>
    onSelectAll && (
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          onSelectAll(groupItems);
        }}
        className="text-xs font-normal text-accent dark:text-accent-muted hover:underline"
      >
        Select all
      </button>
    );

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
                <span className={COUNT_CLASSES}>{countLabel(undated.items.length)}</span>
                {selectAllButton(undated.items)}
              </summary>
              <div className={GRID_CLASSES}>{undated.items.map(renderItem)}</div>
            </details>
          );
        }

        const yearCount = months.reduce((total, month) => total + month.items.length, 0);
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
                    <span className={COUNT_CLASSES}>{countLabel(month.items.length)}</span>
                    {selectAllButton(month.items)}
                  </summary>
                  <div className={GRID_CLASSES}>{month.items.map(renderItem)}</div>
                </details>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
