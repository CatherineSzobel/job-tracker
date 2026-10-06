import { X } from "lucide-react";
import { TAG_COLOR_CLASSES } from "../../constants/tags";

const BASE_CLASSES = "inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full whitespace-nowrap transition-opacity";

// A coloured tag pill. onRemove adds a ✕; onClick turns the whole chip into a toggle
// (active = on) for filters.
export default function TagChip({ tag, onRemove, onClick, active = true }) {
  const classes = `${BASE_CLASSES} ${TAG_COLOR_CLASSES[tag.color]} ${active ? "" : "opacity-40 hover:opacity-70"}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={classes}>
        {tag.name}
      </button>
    );
  }

  return (
    <span className={classes}>
      {tag.name}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove tag ${tag.name}`} className="hover:opacity-70">
          <X size={12} />
        </button>
      )}
    </span>
  );
}
