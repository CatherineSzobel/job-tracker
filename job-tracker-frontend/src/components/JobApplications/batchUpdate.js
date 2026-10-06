import API from "../../api/axios";

// PATCH /api/job-applications/batch: one set of changes for several applications, all or nothing.
// Resolves to the updated applications.
export async function batchUpdateJobs(ids, changes) {
  const res = await API.patch("/job-applications/batch", { ids, ...changes });
  return res.data.data;
}

// PATCH /api/job-applications/batch-changes: a different change for each application, all or nothing.
// changes: [{ id, status?, add_tag_ids?, remove_tag_ids? }]. Resolves to the updated applications.
export async function saveJobChanges(changes) {
  const res = await API.patch("/job-applications/batch-changes", { changes });
  return res.data.data;
}

// Puts the updated applications into the list and drops those that left it
// (archived on the Applications page, restored on the Archive page).
export function mergeBatchResult(currentJobs, updatedJobs, listShowsArchived) {
  const updatedById = new Map(updatedJobs.map((job) => [job.id, job]));
  return currentJobs
    .map((job) => updatedById.get(job.id) ?? job)
    .filter((job) => job.is_archived === listShowsArchived);
}

// Every tag id on these applications, once (what "Remove tag" can offer)
export function tagIdsOf(jobs) {
  return [...new Set(jobs.flatMap((job) => (job.tags ?? []).map((tag) => tag.id)))];
}
