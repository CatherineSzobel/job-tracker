import { useState } from "react";

const NO_CHANGES = { status: "", tagsToAdd: [], tagsToRemove: [] };

const withoutTag = (tagList, tag) => tagList.filter((existing) => existing.id !== tag.id);

const isEmpty = (change) => change.status === "" && change.tagsToAdd.length === 0 && change.tagsToRemove.length === 0;

// For each kind of summary line: how it's taken off one application's change
const UNDO_BY_KIND = {
  status: (line, change) => (change.status === line.status ? { ...change, status: "" } : change),
  add: (line, change) => ({ ...change, tagsToAdd: withoutTag(change.tagsToAdd, line.tag) }),
  remove: (line, change) => ({ ...change, tagsToRemove: withoutTag(change.tagsToRemove, line.tag) }),
};

// Each distinct pending change once, with how many applications have it (the bar's summary)
function summarize(changesById) {
  const lines = new Map();
  const count = (key, line) => lines.set(key, { key, ...line, count: (lines.get(key)?.count ?? 0) + 1 });
  Object.values(changesById).forEach((change) => {
    if (change.status) count(`status-${change.status}`, { kind: "status", status: change.status });
    change.tagsToAdd.forEach((tag) => count(`add-${tag.id}`, { kind: "add", tag }));
    change.tagsToRemove.forEach((tag) => count(`remove-${tag.id}`, { kind: "remove", tag }));
  });
  return [...lines.values()];
}

// Unsaved status and tag changes, kept per application until Save. A change made in the bar goes to the
// applications selected at that moment, so different applications can wait with different changes (two
// set to Applied, three others to Rejected) and still be saved together. The page owns them so both the
// select bar (BatchBar) and the cards (a preview) can show them.
export default function useBatchChanges() {
  // { [applicationId]: { status, tagsToAdd, tagsToRemove } }, only applications with a change
  const [changesById, setChangesById] = useState({});

  // update(change) for each id (or, with ids null, every changed application), dropping those left with none
  const updateEach = (ids, update) => {
    setChangesById((current) => {
      const next = { ...current };
      (ids ?? Object.keys(current)).forEach((id) => {
        const updated = update(current[id] ?? NO_CHANGES);
        if (isEmpty(updated)) {
          delete next[id];
        } else {
          next[id] = updated;
        }
      });
      return next;
    });
  };

  const changedCount = Object.keys(changesById).length;

  return {
    hasChanges: changedCount > 0,
    changedCount,
    // One application's pending change for its card preview, or null
    forJob: (id) => changesById[id] ?? null,
    summary: summarize(changesById),
    // A later status replaces an earlier one; picking a tag again moves it between "add" and "remove"
    // (the backend refuses a tag that's both added and removed)
    setStatus: (ids, status) => updateEach(ids, (change) => ({ ...change, status })),
    addTag: (ids, tag) =>
      updateEach(ids, (change) => ({
        ...change,
        tagsToRemove: withoutTag(change.tagsToRemove, tag),
        tagsToAdd: [...withoutTag(change.tagsToAdd, tag), tag],
      })),
    removeTag: (ids, tag) =>
      updateEach(ids, (change) => ({
        ...change,
        tagsToAdd: withoutTag(change.tagsToAdd, tag),
        tagsToRemove: [...withoutTag(change.tagsToRemove, tag), tag],
      })),
    // Undo one summary line on every application that has it
    undoLine: (line) => updateEach(null, (change) => UNDO_BY_KIND[line.kind](line, change)),
    clear: () => setChangesById({}),
    // The changes for PATCH /job-applications/batch-changes
    toRequest: () =>
      Object.entries(changesById).map(([id, change]) => ({
        id: Number(id),
        ...(change.status && { status: change.status }),
        ...(change.tagsToAdd.length > 0 && { add_tag_ids: change.tagsToAdd.map((tag) => tag.id) }),
        ...(change.tagsToRemove.length > 0 && { remove_tag_ids: change.tagsToRemove.map((tag) => tag.id) }),
      })),
  };
}
