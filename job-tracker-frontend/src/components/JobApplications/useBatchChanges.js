import { useState } from "react";

const NO_CHANGES = { status: "", tagsToAdd: [], tagsToRemove: [] };

const withoutTag = (tagList, tag) => tagList.filter((existing) => existing.id !== tag.id);

const hasTag = (job, tag) => (job.tags ?? []).some((existing) => existing.id === tag.id);

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

  // update(change, job) for each of these applications (or, with jobs null, every changed one),
  // dropping those left with no change
  const updateEach = (jobs, update) => {
    setChangesById((current) => {
      const next = { ...current };
      (jobs ?? Object.keys(current).map((id) => ({ id }))).forEach((job) => {
        const updated = update(current[job.id] ?? NO_CHANGES, job);
        if (isEmpty(updated)) {
          delete next[job.id];
        } else {
          next[job.id] = updated;
        }
      });
      return next;
    });
  };

  return {
    hasChanges: Object.keys(changesById).length > 0,
    // One application's pending change for its card preview, or null
    forJob: (id) => changesById[id] ?? null,
    summary: summarize(changesById),
    // Each takes the selected applications, and skips what wouldn't change one (its current status, a tag
    // it already has or doesn't have), so the summary counts only real changes. A later status replaces an
    // earlier one; picking a tag again moves it between "add" and "remove" (the backend refuses a tag that's
    // both added and removed)
    setStatus: (jobs, status) => updateEach(jobs, (change, job) => ({ ...change, status: status === job.status ? "" : status })),
    addTag: (jobs, tag) =>
      updateEach(jobs, (change, job) => ({
        ...change,
        tagsToRemove: withoutTag(change.tagsToRemove, tag),
        tagsToAdd: hasTag(job, tag) ? withoutTag(change.tagsToAdd, tag) : [...withoutTag(change.tagsToAdd, tag), tag],
      })),
    removeTag: (jobs, tag) =>
      updateEach(jobs, (change, job) => ({
        ...change,
        tagsToAdd: withoutTag(change.tagsToAdd, tag),
        tagsToRemove: hasTag(job, tag) ? [...withoutTag(change.tagsToRemove, tag), tag] : withoutTag(change.tagsToRemove, tag),
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
