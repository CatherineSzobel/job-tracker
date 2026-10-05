import TagChip from "./TagChip";
import { CARD_TAG_LIMIT } from "../../constants/tags";

// A card's tags: the first few as chips, then "+N"
export default function CardTags({ tags = [] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      {tags.slice(0, CARD_TAG_LIMIT).map((tag) => (
        <TagChip key={tag.id} tag={tag} />
      ))}
      {tags.length > CARD_TAG_LIMIT && (
        <span className="text-xs text-light-muted dark:text-dark-muted">+{tags.length - CARD_TAG_LIMIT}</span>
      )}
    </div>
  );
}
