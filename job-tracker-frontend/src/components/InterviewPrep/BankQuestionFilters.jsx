import { BANK_QUESTION_CATEGORIES } from "../../constants/interviewPrep";

const CATEGORY_CHIPS = [{ value: "all", label: "All" }, ...BANK_QUESTION_CATEGORIES];

// Search box and category chips, used by the bank page and the picker
export default function BankQuestionFilters({ category, search, onCategoryChange, onSearchChange }) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search questions and answers"
        aria-label="Search questions and answers"
        className="input-field"
      />
      <div className="flex flex-wrap gap-2">
        {CATEGORY_CHIPS.map((chip) => {
          const selected = chip.value === category;
          return (
            <button
              key={chip.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onCategoryChange(chip.value)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                selected
                  ? "bg-accent border-accent text-white"
                  : "border-light-muted dark:border-dark-subtle text-light-text dark:text-dark-text hover:bg-light dark:hover:bg-dark-subtle"
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
