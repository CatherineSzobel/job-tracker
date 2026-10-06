// Mirrors App\Enums\TagColor. Full class strings (not built at runtime) so Tailwind can find them.
export const TAG_COLOR_CLASSES = {
  slate: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  red: "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200",
  amber: "bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  green: "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200",
  teal: "bg-teal-200 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  blue: "bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  violet: "bg-violet-200 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  pink: "bg-pink-200 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
};

export const TAG_COLORS = Object.keys(TAG_COLOR_CLASSES);

// Same limit as the backend (tags.name is varchar(30))
export const TAG_NAME_MAX = 30;

// Cards show this many tags, then "+N"
export const CARD_TAG_LIMIT = 3;
