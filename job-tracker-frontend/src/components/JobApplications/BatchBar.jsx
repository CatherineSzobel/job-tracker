import { useState } from "react";
import { X } from "lucide-react";
import TagInput from "../Tags/TagInput";
import SelectionBar from "../UI/SelectionBar";
import { JOB_STATUSES } from "../../constants/jobs";

// How the tag field behaves when adding vs removing a tag
const TAG_MODES = {
  add: { placeholder: "Tag to add…", submitLabel: "Add", allowCreate: true },
  remove: { placeholder: "Tag to remove…", submitLabel: "Remove", allowCreate: false },
};

const statusLabel = (value) => JOB_STATUSES.find((status) => status.value === value)?.label ?? value;

// One change waiting to be saved, with an × to drop it
function PendingChange({ label, onUndo }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-light-soft dark:bg-dark-subtle text-light-text dark:text-dark-text">
      {label}
      <button type="button" onClick={onUndo} aria-label={`Undo: ${label}`} className="hover:text-red-500 dark:hover:text-red-400">
        <X size={12} />
      </button>
    </span>
  );
}

// The select bar for applications (Applications and Archive). actions: which controls to show, from
// "status", "tags", "archive", "restore". Status and tag changes go into `changes` (useBatchChanges, owned
// by the page so the selected cards can preview them) and are listed here until Save sends them in one
// request; Cancel leaves select mode, which drops them. Archive and Restore act straight away, since they
// ask first. onApply(request) returns whether it worked.
// removableTagIds: tags at least one selected application has; "Remove tag" only suggests those.
export default function BatchBar({ count, actions, tags, removableTagIds = [], changes, onApply, onCreateTag, onCancel, busy = false }) {
  // "add" or "remove" while the tag field is open
  const [tagMode, setTagMode] = useState(null);
  // Removing only offers tags that at least one selected application has
  const tagChoices = tagMode === "remove" ? tags.filter((tag) => removableTagIds.includes(tag.id)) : tags;

  const pickTag = (tag) => {
    if (tagMode === "add") {
      changes.addTag(tag);
    } else {
      changes.removeTag(tag);
    }
    setTagMode(null);
  };

  // Success ends select mode on the page (which clears the changes); on failure they stay for another try
  const save = async () => {
    await onApply(changes.toRequest());
  };

  return (
    <SelectionBar count={count} onCancel={onCancel}>
      {actions.includes("status") && (
        <select
          value={changes.status}
          disabled={busy}
          onChange={(event) => changes.setStatus(event.target.value)}
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
              onSelect={pickTag}
              onCreate={onCreateTag}
              allowCreate={TAG_MODES[tagMode].allowCreate}
              placeholder={TAG_MODES[tagMode].placeholder}
              submitLabel={TAG_MODES[tagMode].submitLabel}
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

      {(actions.includes("status") || actions.includes("tags")) && (
        <button type="button" disabled={busy || !changes.hasChanges} onClick={save} className="btn-bar-primary">
          {busy ? "Saving…" : "Save"}
        </button>
      )}

      {/* Changes waiting for Save, on their own line at the bottom of the bar */}
      {changes.hasChanges && (
        <div className="order-last w-full flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-light-muted dark:text-dark-muted">Not saved yet:</span>
          {changes.status && <PendingChange label={`Status: ${statusLabel(changes.status)}`} onUndo={() => changes.setStatus("")} />}
          {changes.tagsToAdd.map((tag) => (
            <PendingChange key={`add-${tag.id}`} label={`+ ${tag.name}`} onUndo={() => changes.undoAddTag(tag)} />
          ))}
          {changes.tagsToRemove.map((tag) => (
            <PendingChange key={`remove-${tag.id}`} label={`− ${tag.name}`} onUndo={() => changes.undoRemoveTag(tag)} />
          ))}
        </div>
      )}
    </SelectionBar>
  );
}
