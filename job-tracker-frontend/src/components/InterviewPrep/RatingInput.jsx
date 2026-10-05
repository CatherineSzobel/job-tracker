import { RATING_VALUES } from "../../constants/interviewPrep";

// 1–5 buttons; clicking the current rating clears it (onChange(null))
export default function RatingInput({ value, onChange }) {
  return (
    <div role="group" aria-label="Rating" className="flex gap-2">
      {RATING_VALUES.map((rating) => {
        const selected = rating === value;
        return (
          <button
            key={rating}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : rating)}
            className={`h-10 w-10 rounded-full border text-sm font-semibold transition-colors ${
              selected
                ? "bg-accent border-accent text-white"
                : "border-light-muted dark:border-dark-subtle text-light-text dark:text-dark-text hover:bg-light dark:hover:bg-dark-subtle"
            }`}
          >
            {rating}
          </button>
        );
      })}
    </div>
  );
}
