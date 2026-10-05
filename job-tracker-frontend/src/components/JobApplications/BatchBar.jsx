import { useState } from "react";
import TagInput from "../Tags/TagInput";
import SelectionBar from "../UI/SelectionBar";
import { JOB_STATUSES } from "../../constants/jobs";

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

// The select bar for applications (Applications and Archive). actions: which controls to show,
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
    <SelectionBar count={count} onCancel={onCancel}>
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
            <button type="button" disabled={busy} onClick={() => setTagMode("add")} className="btn-bar">
              Add tag
            </button>
            <button type="button" disabled={busy} onClick={() => setTagMode("remove")} className="btn-bar">
              Remove tag
            </button>
          </>
        ))}

      {actions.includes("archive") && (
        <button type="button" disabled={busy} onClick={() => onApply({ is_archived: true })} className="btn-bar">
          Archive
        </button>
      )}
      {actions.includes("restore") && (
        <button type="button" disabled={busy} onClick={() => onApply({ is_archived: false })} className="btn-bar">
          Restore
        </button>
      )}
    </SelectionBar>
  );
}
