// Mirrors App\Enums\TagColor. Full class strings (not built at runtime) so Tailwind can find them.
export const TAG_COLOR_CLASSES = {
  slate: "bg-tag-slate-bg text-tag-slate-fg",
  red: "bg-tag-red-bg text-tag-red-fg",
  amber: "bg-tag-amber-bg text-tag-amber-fg",
  green: "bg-tag-green-bg text-tag-green-fg",
  teal: "bg-tag-teal-bg text-tag-teal-fg",
  blue: "bg-tag-blue-bg text-tag-blue-fg",
  violet: "bg-tag-violet-bg text-tag-violet-fg",
  pink: "bg-tag-pink-bg text-tag-pink-fg",
};

export const TAG_COLORS = Object.keys(TAG_COLOR_CLASSES);

// Same limit as the backend (tags.name is varchar(30))
export const TAG_NAME_MAX = 30;

// Cards show this many tags, then "+N"
export const CARD_TAG_LIMIT = 3;
