import { percentOf } from "../../utils/percent";

// Labelled bars with their counts, each as long as its share of the largest count.
// rows: [{ key, label, count, barClassName? }] (the bar is the accent colour unless barClassName is given)
export default function BarList({ rows }) {
  const largest = Math.max(0, ...rows.map(({ count }) => count));

  return (
    <ul className="flex flex-col gap-4">
      {rows.map(({ key, label, count, barClassName = "bg-accent" }) => (
        <li key={key} className="grid grid-cols-[136px_minmax(0,1fr)_32px] items-center gap-4">
          <span className="font-medium">{label}</span>
          <div className="h-6 rounded bg-soft">
            <div className={`h-full rounded ${barClassName}`} style={{ width: `${percentOf(count, largest)}%` }} />
          </div>
          <span className="text-right font-bold">{count}</span>
        </li>
      ))}
    </ul>
  );
}
