import { format } from "date-fns";

// Size and colour variants. Full class strings (not built at runtime) so Tailwind can find them.
const SIZE_CLASSES = {
  md: "size-12 rounded-lg [&>span:last-child]:text-lg",
  lg: "size-14 rounded-xl [&>span:last-child]:text-xl",
};
const TONE_CLASSES = {
  // The next or today's item
  highlight: "border-accent bg-accent text-white",
  default: "border-line bg-surface text-ink",
  // Past items
  muted: "border-line bg-soft text-muted",
};

// A 48–56px date square: the weekday or month over the day number ("Fri / 9", "Oct / 14")
export default function DateBlock({ date, top = "weekday", size = "md", tone = "default" }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 flex-col items-center justify-center border leading-4 ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]}`}
    >
      <span className="text-xs font-semibold uppercase">{format(date, top === "month" ? "MMM" : "EEE")}</span>
      <span className="leading-6 font-bold">{format(date, "d")}</span>
    </span>
  );
}
