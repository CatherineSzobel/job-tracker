// One stat tile on the Dashboard's Insights tab: a label, a big number and, optionally, what it's based on
export default function StatTile({ label, value, note }) {
  return (
    <li className="card flex flex-col gap-2">
      {/* Two lines reserved for the label, so the numbers line up when one wraps; stacked from the top, so a
          longer note doesn't push its number out of line */}
      <span className="min-h-12 font-medium text-muted">{label}</span>
      <span className="text-[40px] leading-12 font-bold">{value}</span>
      {note && <span className="text-sm text-muted">{note}</span>}
    </li>
  );
}
