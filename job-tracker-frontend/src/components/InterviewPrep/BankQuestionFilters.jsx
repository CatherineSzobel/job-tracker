import SearchInput from "../UI/SearchInput";
import { filterChipClasses, filterChipCountClasses } from "../UI/filterChipClasses";
import { BANK_QUESTION_CATEGORIES } from "../../constants/interviewPrep";

const CATEGORY_CHIPS = [{ value: "all", label: "All" }, ...BANK_QUESTION_CATEGORIES];

// Search box and category chips, used by the bank page and the picker.
// counts ({ all, [category]: n }): shown in the chips when given.
export default function BankQuestionFilters({ category, search, onCategoryChange, onSearchChange, counts }) {
  return (
    <div className="flex flex-col gap-4">
      <SearchInput label="Search questions and answers" value={search} onChange={onSearchChange} />
      <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
        {CATEGORY_CHIPS.map((chip) => {
          const selected = chip.value === category;
          return (
            <button
              key={chip.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onCategoryChange(chip.value)}
              className={filterChipClasses(selected)}
            >
              {chip.label}
              {counts && <span className={filterChipCountClasses(selected)}>{counts[chip.value] ?? 0}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
