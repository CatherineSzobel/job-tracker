import { ChevronRight } from "lucide-react";
import { groupByDate } from "../../utils/groupByDate";
import { countOf } from "../../utils/plural";

const GRID_CLASSES = "my-2 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4";
const SECTION_CLASSES = "group/year rounded-2xl border border-line bg-surface p-2 sm:p-4";
// list-none + the webkit rule hide the browser's own triangle; ours rotates instead
const SUMMARY_CLASSES = "list-none [&::-webkit-details-marker]:hidden cursor-pointer select-none flex min-h-12 flex-wrap items-center gap-2 rounded-lg px-2 text-ink transition-colors hover:bg-soft";
const COUNT_CLASSES = "rounded-full bg-subtle px-2 text-sm/6 font-semibold text-muted-2";

// Collapsible year → month sections (native <details>); the first year and its first month start open.
// items are grouped by getDateString(item) in `order` ("newest" or "oldest" first, see groupByDate).
// itemLabel: "application", "interview", … for the counts. renderItem(item) draws one card (an <li>).
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
        className="text-sm/6 font-semibold text-accent-text hover:underline"
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
              <summary className={`${SUMMARY_CLASSES} text-xl/8 font-semibold`}>
                <ChevronRight size={20} aria-hidden="true" className="transition-transform group-open/year:rotate-90" />
                {undated.label}
                <span className={COUNT_CLASSES}>{countLabel(undated.items.length)}</span>
                {selectAllButton(undated.items)}
              </summary>
              <ul className={GRID_CLASSES}>{undated.items.map(renderItem)}</ul>
            </details>
          );
        }

        const yearCount = months.reduce((total, month) => total + month.items.length, 0);
        return (
          <details key={year} open={yearIndex === 0} className={SECTION_CLASSES}>
            <summary className={`${SUMMARY_CLASSES} text-xl/8 font-semibold`}>
              <ChevronRight size={20} aria-hidden="true" className="transition-transform group-open/year:rotate-90" />
              {year}
              <span className={COUNT_CLASSES}>{countLabel(yearCount)}</span>
            </summary>

            <div className="mt-1 ml-2 sm:ml-4 flex flex-col gap-1 border-l border-line pl-2 sm:pl-3">
              {months.map((month, monthIndex) => (
                <details key={month.key} open={yearIndex === 0 && monthIndex === 0} className="group/month">
                  <summary className={`${SUMMARY_CLASSES} font-semibold`}>
                    <ChevronRight size={18} aria-hidden="true" className="transition-transform group-open/month:rotate-90" />
                    {month.label}
                    <span className={COUNT_CLASSES}>{countLabel(month.items.length)}</span>
                    {selectAllButton(month.items)}
                  </summary>
                  <ul className={GRID_CLASSES}>{month.items.map(renderItem)}</ul>
                </details>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
