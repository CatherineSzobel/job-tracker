import { useState } from "react";
import { X } from "lucide-react";
import TagInput from "../Tags/TagInput";
import SelectionBar from "../UI/SelectionBar";
import { JOB_STATUSES } from "../../constants/jobs";
import { tagIdsOf } from "./batchUpdate";

// How the tag field behaves when adding vs removing a tag
const TAG_MODES = {
  add: { placeholder: "Tag to add…", submitLabel: "Add", allowCreate: true },
  remove: { placeholder: "Tag to remove…", submitLabel: "Remove", allowCreate: false },
};

const statusLabel = (value) => JOB_STATUSES.find((status) => status.value === value)?.label ?? value;

const applicationCount = (count) => `${count} application${count === 1 ? "" : "s"}`;

// A summary line's text: "Status: Applied", "+ remote", "− fintech"
const summaryLabel = (line) => {
  if (line.kind === "status") return `Status: ${statusLabel(line.status)}`;
  return `${line.kind === "add" ? "+" : "−"} ${line.tag.name}`;
};

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

// The select bar for applications (Applications and Archive). selectedJobs: the selected applications.
// actions: which controls to show, from "status", "tags", "archive", "restore".
// A status or tag change is recorded in `changes` (useBatchChanges, owned by the page so the cards can
// preview them) on the applications selected when it's made, and then the selection is cleared
// (onClearSelection) so the next change starts from a fresh pick. The summary lists the changes until Save
// (onSave) sends all of them in one request; Cancel leaves select mode, which drops them. Archive and
// Restore (onApply(request)) act on the selection straight away, since they ask first, and wait until
// unsaved changes are saved or undone.
export default function BatchBar({ selectedJobs, actions, tags, changes, onSave, onApply, onClearSelection, onCreateTag, onCancel, busy = false }) {
  // "add" or "remove" while the tag field is open
  const [tagMode, setTagMode] = useState(null);
  const nothingSelected = selectedJobs.length === 0;

  // Unselecting the last card closes the tag field, so a pick can't silently apply to nothing
  if (tagMode && nothingSelected) {
    setTagMode(null);
  }

  // Removing only offers tags that at least one selected application has
  const removableTagIds = tagIdsOf(selectedJobs);
  const tagChoices = tagMode === "remove" ? tags.filter((tag) => removableTagIds.includes(tag.id)) : tags;

  const pickStatus = (status) => {
    if (!status) return;
    changes.setStatus(selectedJobs, status);
    onClearSelection();
  };

  const pickTag = (tag) => {
    if (tagMode === "add") {
      changes.addTag(selectedJobs, tag);
    } else {
      changes.removeTag(selectedJobs, tag);
    }
    setTagMode(null);
    onClearSelection();
  };

  // Archive and Restore end select mode, which would drop the unsaved changes
  const actsNowDisabled = busy || nothingSelected || changes.hasChanges;
  const actsNowTitle = changes.hasChanges ? "Save or undo your changes first" : undefined;

  return (
    <SelectionBar count={selectedJobs.length} onCancel={onCancel}>
      {actions.includes("status") && (
        // Always shows "Status…": each pick is applied to the current selection
        <select
          value=""
          disabled={busy || nothingSelected}
          onChange={(event) => pickStatus(event.target.value)}
          aria-label="Change status of the selected applications"
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
            <button type="button" disabled={busy || nothingSelected} onClick={() => setTagMode("add")} className="btn-bar">
              Add tag
            </button>
            <button type="button" disabled={busy || nothingSelected} onClick={() => setTagMode("remove")} className="btn-bar">
              Remove tag
            </button>
          </>
        ))}

      {actions.includes("archive") && (
        <button type="button" disabled={actsNowDisabled} title={actsNowTitle} onClick={() => onApply({ is_archived: true })} className="btn-bar">
          Archive
        </button>
      )}
      {actions.includes("restore") && (
        <button type="button" disabled={actsNowDisabled} title={actsNowTitle} onClick={() => onApply({ is_archived: false })} className="btn-bar">
          Restore
        </button>
      )}

      {(actions.includes("status") || actions.includes("tags")) && (
        <button type="button" disabled={busy || !changes.hasChanges} onClick={onSave} className="btn-bar-primary">
          {busy ? "Saving…" : "Save"}
        </button>
      )}

      {/* Changes waiting for Save, on their own line at the bottom of the bar */}
      {changes.hasChanges && (
        <div className="order-last w-full flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-light-muted dark:text-dark-muted">Not saved yet:</span>
          {changes.summary.map((line) => (
            <PendingChange key={line.key} label={`${summaryLabel(line)} · ${applicationCount(line.count)}`} onUndo={() => changes.undoLine(line)} />
          ))}
        </div>
      )}
    </SelectionBar>
  );
}
