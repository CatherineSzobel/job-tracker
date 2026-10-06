import TagChip from "./TagChip";
import { CARD_TAG_LIMIT } from "../../constants/tags";

const NOT_SAVED_TITLE = "Not saved yet";

// A card's tags: the first few as chips, then "+N". While batch changes are waiting for Save,
// addedTags show with a dashed outline and the tags in removedTagIds are struck through.
export default function CardTags({ tags = [], addedTags = [], removedTagIds = [] }) {
  const newTags = addedTags.filter((tag) => !tags.some((existing) => existing.id === tag.id));
  if (tags.length === 0 && newTags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2">
      {tags.slice(0, CARD_TAG_LIMIT).map((tag) =>
        removedTagIds.includes(tag.id) ? (
          <span key={tag.id} title={NOT_SAVED_TITLE} className="line-through opacity-50">
            <TagChip tag={tag} />
          </span>
        ) : (
          <TagChip key={tag.id} tag={tag} />
        )
      )}
      {tags.length > CARD_TAG_LIMIT && (
        <span className="text-xs text-light-muted dark:text-dark-muted">+{tags.length - CARD_TAG_LIMIT}</span>
      )}
      {newTags.map((tag) => (
        <span key={`new-${tag.id}`} title={NOT_SAVED_TITLE} className="rounded-full outline-1 outline-dashed outline-offset-1 outline-accent">
          <TagChip tag={tag} />
        </span>
      ))}
    </div>
  );
}
