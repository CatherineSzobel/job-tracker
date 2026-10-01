import { useState } from "react";
import TagInput from "../Tags/TagInput";
import { JOB_STATUSES } from "../../constants/jobs";

const BUTTON_CLASSES = "px-3 py-1 rounded-lg text-sm border border-light-muted dark:border-dark-subtle text-light-text dark:text-dark-text hover:bg-light-soft dark:hover:bg-dark-subtle disabled:opacity-50 transition-colors";

// How the tag field behaves when adding vs removing a tag
const TAG_MODES = {
  add: {
    placeholder: "Tag to add…",
    submitLabel: "Add",
    allowCreate: true,
    toChanges: (tag) => ({ add_tag_ids: [tag.id] }),
  },
  remove: {
    placeholder: "Tag to remove…",
    submitLabel: "Remove",
    allowCreate: false,
    toChanges: (tag) => ({ remove_tag_ids: [tag.id] }),
  },
};

// Pinned to the bottom while applications are selected. actions: which controls to show,
// from "status", "tags", "archive", "restore". onApply(changes) sends one batch request.
// removableTagIds: tags at least one selected application has; "Remove tag" only suggests those.
export default function BatchBar({ count, actions, tags, removableTagIds = [], onApply, onCreateTag, onCancel, busy = false }) {
  // "add" or "remove" while the tag field is open
  const [tagMode, setTagMode] = useState(null);
  const tagModeSettings = TAG_MODES[tagMode];
  // Removing only offers tags that at least one selected application has
  const tagChoices = tagMode === "remove" ? tags.filter((tag) => removableTagIds.includes(tag.id)) : tags;

  const applyTag = (tag) => {
    setTagMode(null);
    onApply(tagModeSettings.toChanges(tag));
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl flex flex-wrap items-center gap-2 p-3 rounded-2xl border border-border dark:border-dark-subtle bg-surface dark:bg-dark-soft shadow-xl transition-colors">
      <span className="mr-auto font-medium text-light-text dark:text-dark-text">{count} selected</span>

      {actions.includes("status") && (
        <select
          value=""
          disabled={busy}
          onChange={(event) => event.target.value && onApply({ status: event.target.value })}
          aria-label="Change status"
          className="input-field w-auto py-1 text-sm"
        >
          <option value="">Status…</option>
          {JOB_STATUSES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      )}

      {actions.includes("tags") &&
        (tagMode ? (
          <div className="w-full sm:w-72">
            <TagInput
              tags={tagChoices}
              onSelect={applyTag}
              onCreate={onCreateTag}
              allowCreate={tagModeSettings.allowCreate}
              placeholder={tagModeSettings.placeholder}
              submitLabel={tagModeSettings.submitLabel}
            />
          </div>
        ) : (
          <>
            <button type="button" disabled={busy} onClick={() => setTagMode("add")} className={BUTTON_CLASSES}>
              Add tag
            </button>
            <button type="button" disabled={busy} onClick={() => setTagMode("remove")} className={BUTTON_CLASSES}>
              Remove tag
            </button>
          </>
        ))}

      {actions.includes("archive") && (
        <button type="button" disabled={busy} onClick={() => onApply({ is_archived: true })} className={BUTTON_CLASSES}>
          Archive
        </button>
      )}
      {actions.includes("restore") && (
        <button type="button" disabled={busy} onClick={() => onApply({ is_archived: false })} className={BUTTON_CLASSES}>
          Restore
        </button>
      )}

      <button type="button" onClick={onCancel} className={BUTTON_CLASSES}>
        Cancel
      </button>
    </div>
  );
}
