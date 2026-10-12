import { Check, X } from "lucide-react";
import { TAG_COLOR_CLASSES } from "../../constants/tags";

const BASE_CLASSES = "inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap";

// A coloured tag pill (24px). onRemove adds a ×. onClick makes it a 32px filter toggle: the chosen
// one (active) gets a check and an accent ring, so the choice isn't shown by colour alone.
export default function TagChip({ tag, onRemove, onClick, active = false }) {
  const colourClasses = TAG_COLOR_CLASSES[tag.color] ?? TAG_COLOR_CLASSES.slate;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`${BASE_CLASSES} h-8 px-3 text-sm ${colourClasses} ${active ? "ring-2 ring-accent-text" : "hover:ring-1 hover:ring-input"}`}
      >
        {active && <Check size={14} strokeWidth={3} aria-hidden="true" />}
        {tag.name}
      </button>
    );
  }

  return (
    <span className={`${BASE_CLASSES} h-6 text-sm ${onRemove ? "pr-1 pl-2.5" : "px-2.5"} ${colourClasses}`}>
      {tag.name}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`Remove tag ${tag.name}`} className="rounded-full p-0.5 hover:bg-black/10">
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
