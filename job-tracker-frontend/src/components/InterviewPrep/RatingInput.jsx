import { Star } from "lucide-react";
import { RATING_VALUES } from "../../constants/interviewPrep";

// 1–5 stars (48px buttons); clicking the current rating clears it (onChange(null))
export default function RatingInput({ value, onChange }) {
  return (
    <div role="group" aria-label="Rating" className="flex gap-1">
      {RATING_VALUES.map((rating) => {
        const selected = rating === value;
        const filled = value !== null && value !== undefined && rating <= value;
        return (
          <button
            key={rating}
            type="button"
            aria-pressed={selected}
            aria-label={`${rating} of ${RATING_VALUES.length}`}
            onClick={() => onChange(selected ? null : rating)}
            className="inline-flex size-12 items-center justify-center rounded-lg text-bar-interview transition-colors hover:bg-soft"
          >
            <Star size={28} fill={filled ? "currentColor" : "none"} className={filled ? "" : "text-input"} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
