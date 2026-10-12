import { useState, useEffect, useRef, useCallback } from "react";
import { EllipsisVertical, Plus } from "lucide-react";
import API from "../api/axios";
import BatchBar from "../components/JobApplications/BatchBar";
import { batchUpdateJobs, saveJobChanges } from "../components/JobApplications/batchUpdate";
import JobCard from "../components/JobApplications/JobCard";
import JobForm from "../components/JobApplications/JobForm";
import JobDateGroups from "../components/JobApplications/JobDateGroups";
import useArchiveWithTodos, { archiveChanges } from "../components/JobApplications/useArchiveWithTodos";
import useBatchChanges from "../components/JobApplications/useBatchChanges";
import useSendBatch from "../components/JobApplications/useSendBatch";
import ManageTagsModal from "../components/Tags/ManageTagsModal";
import TagChip from "../components/Tags/TagChip";
import useTags from "../components/Tags/useTags";
import Menu, { MenuItem } from "../components/UI/Menu";
import PageHeader from "../components/UI/PageHeader";
import SearchInput from "../components/UI/SearchInput";
import PageLoader from "../components/UI/PageLoader";
import Modal from "../components/UI/Modal";
import SelectModeButtons from "../components/UI/SelectModeButtons";
import ViewToggle from "../components/UI/ViewToggle";
import useSavedView from "../components/UI/useSavedView";
import useSelection from "../components/UI/useSelection";
import { filterChipClasses, filterChipCountClasses } from "../components/UI/filterChipClasses";
import { EMPTY_JOB, JOB_STATUSES, PRIORITIES } from "../constants/jobs";
import { confirmAction } from "../stores/useConfirmStore";
import { useToastStore } from "../stores/useToastStore";
import { countOf } from "../utils/plural";

export default function Applications() {
  const fileInputRef = useRef(null);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState([]);
  const [search, setSearch] = useState("");
  const [showManageTags, setShowManageTags] = useState(false);
  const [view, changeView] = useSavedView("applications-view");
  const { tags, reloadTags, createTag, updateTag, deleteTag } = useTags();
  // Unsaved status and tag changes, per application; leaving select mode (any way) drops them
  const batchChanges = useBatchChanges();
  const { selecting, startSelecting, exitSelecting, selectedIds, toggleSelected, selectMany, clearSelection } = useSelection({ onExit: batchChanges.clear });
  const { sendBatch, busy: batchBusy } = useSendBatch({ setJobs, listShowsArchived: false, onDone: exitSelecting });
  const showToast = useToastStore((state) => state.showToast);

  const [newJob, setNewJob] = useState(EMPTY_JOB);

  // Also run after tags are renamed or deleted, so the cards show the new names
  const loadJobs = useCallback(
    () =>
      API.get("/job-applications")
        .then((res) => setJobs(res.data.data))
        .catch((err) => console.error(err)),
    []
  );

  useEffect(() => {
    loadJobs().finally(() => setLoading(false));
  }, [loadJobs]);

  const handleChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.post("/job-applications", newJob);
      setJobs([res.data.data, ...jobs]);
      setShowForm(false);
      setNewJob(EMPTY_JOB);
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to add job application");
    } finally {
      setSaving(false);
    }
  };

  const toggleTagFilter = (tagId) =>
    setTagFilter((currentIds) =>
      currentIds.includes(tagId) ? currentIds.filter((id) => id !== tagId) : [...currentIds, tagId]
    );

  const openManageTags = () => {
    reloadTags();
    setShowManageTags(true);
  };

  const closeManageTags = () => {
    setShowManageTags(false);
    loadJobs();
  };

  // A deleted tag can't stay in the filter, or no application would match
  const removeTag = async (tag) => {
    if (await deleteTag(tag)) {
      setTagFilter((currentIds) => currentIds.filter((id) => id !== tag.id));
    }
  };

  // Matches position, company or location, ignoring case and surrounding spaces
  const searchText = search.trim().toLowerCase();
  const filteredJobs = jobs.filter((job) => {
    const searchMatch =
      !searchText || [job.position, job.company_name, job.location].some((value) => value?.toLowerCase().includes(searchText));
    const statusMatch = statusFilter === "all" || job.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || job.priority === priorityFilter;
    const tagMatch = tagFilter.every((tagId) => job.tags?.some((tag) => tag.id === tagId));
    return searchMatch && statusMatch && priorityMatch && tagMatch;
  });

  const visibleIds = filteredJobs.map((job) => job.id);
  // Only selected cards that are still visible count: changing a filter hides some without unselecting them
  const visibleSelectedIds = selectedIds.filter((id) => visibleIds.includes(id));
  const visibleSelectedJobs = filteredJobs.filter((job) => selectedIds.includes(job.id));

  // Every pending change, including ones on cards a filter now hides (they were made on purpose)
  const saveBatchChanges = () => sendBatch(() => saveJobChanges(batchChanges.toRequest()));

  // deleteOpenTodos: the answer from the to-dos prompt, or undefined when it wasn't asked
  // (then confirm here, and the server follows the user's setting)
  const archiveSelected = async (deleteOpenTodos) => {
    const count = visibleSelectedIds.length;
    const wasAsked = deleteOpenTodos !== undefined;
    if (!wasAsked && !(await confirmAction({ message: `Archive ${countOf(count, "application")}?`, confirmLabel: "Archive" }))) {
      return;
    }
    sendBatch(() => batchUpdateJobs(visibleSelectedIds, archiveChanges(deleteOpenTodos)));
  };

  const { requestArchive, prompt: archivePrompt } = useArchiveWithTodos(archiveSelected);

  // The bar's Archive asks about open to-dos first (the to-dos prompt)
  const applyBatch = () => {
    const withOpenTodos = jobs.filter((job) => visibleSelectedIds.includes(job.id) && job.open_todos_count > 0);
    requestArchive({
      openTodosCount: withOpenTodos.reduce((total, job) => total + job.open_todos_count, 0),
      applicationCount: withOpenTodos.length,
      selectedCount: visibleSelectedIds.length,
    });
  };

  const renderJob = (job) => (
    <JobCard
      key={job.id}
      job={job}
      onRemove={(id) => setJobs((currentJobs) => currentJobs.filter((existing) => existing.id !== id))}
      selecting={selecting}
      selected={selectedIds.includes(job.id)}
      onToggleSelect={toggleSelected}
      pendingChanges={batchChanges.forJob(job.id)}
    />
  );

  const exportJobs = async () => {
    try {
      const res = await API.get("/job-applications/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "job-applications.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const importJobs = async (file) => {
    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await API.post("/job-applications/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await API.get("/job-applications");
      setJobs(res.data.data);

      showToast(data.message, "success");

      // Invalid rows are skipped by the server and listed in `failures`; the toast names the first few
      const skipped = (data.failures ?? []).map(
        (failure) => `row ${failure.row} (${failure.attribute}): ${failure.errors.join(", ")}`
      );
      if (skipped.length > 0) {
        console.warn("Skipped rows", skipped);
        const firstFew = skipped.slice(0, 3).join("; ");
        showToast(`${skipped.length} row${skipped.length === 1 ? " was" : "s were"} skipped: ${firstFew}${skipped.length > 3 ? "; …" : ""}`);
      }
    } catch (err) {
      console.error("Import failed", err.response || err);
      showToast(`Import failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setImporting(false);
    }
  };

  // After every hook (useArchiveWithTodos above is one), so they run on every render
  if (loading) {
    return <PageLoader text="Loading applications..." />;
  }

  // Status chips count every active application, whatever the other filters are
  const statusCounts = Object.fromEntries(JOB_STATUSES.map(({ value }) => [value, jobs.filter((job) => job.status === value).length]));
  const statusChips = [{ value: "all", label: "All", count: jobs.length }, ...JOB_STATUSES.map((status) => ({ ...status, count: statusCounts[status.value] }))];
  const isFiltered = filteredJobs.length !== jobs.length;

  return (
    <div className={`flex flex-col gap-6 ${selecting ? "pb-32" : ""}`}>
      <PageHeader
        title="Applications"
        description={`${countOf(jobs.length, "active application")}${isFiltered ? ` · ${filteredJobs.length} shown` : ""}`}
        actions={
          <>
            <ViewToggle view={view} onChange={changeView} />

            <SelectModeButtons
              selecting={selecting}
              visibleCount={visibleIds.length}
              onStart={startSelecting}
              onSelectAll={() => selectMany(visibleIds)}
              onCancel={exitSelecting}
            />

            <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
              Add application
            </button>

            <Menu label="More actions" buttonClassName="btn-secondary w-12 px-0" buttonContent={<EllipsisVertical size={20} aria-hidden="true" />} width="w-60">
              <MenuItem onClick={() => fileInputRef.current.click()}>{importing ? "Importing…" : "Import from Excel"}</MenuItem>
              <MenuItem onClick={exportJobs}>Export to Excel</MenuItem>
              <MenuItem onClick={openManageTags}>Manage tags</MenuItem>
              <MenuItem to="/archives">View archive</MenuItem>
            </Menu>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  importJobs(e.target.files[0]);
                  e.target.value = null;
                }
              }}
            />
          </>
        }
      >
        {/* Filters: search, status chips with counts, then priority and tags */}
        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4">
          <SearchInput label="Search position, company or location" value={search} onChange={setSearch} />

          <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
            {statusChips.map(({ value, label, count }) => {
              const isActive = statusFilter === value;
              return (
                <button key={value} type="button" aria-pressed={isActive} onClick={() => setStatusFilter(value)} className={filterChipClasses(isActive)}>
                  {label}
                  <span className={filterChipCountClasses(isActive)}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex items-center gap-2 font-semibold">
              Priority
              <select
                className="input-field min-h-10 w-auto py-1 font-normal"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="all">All</option>
                {PRIORITIES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            {tags.length > 0 && (
              <div role="group" aria-label="Filter by tag" className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">Tags</span>
                {tags.map((tag) => (
                  <TagChip key={tag.id} tag={tag} active={tagFilter.includes(tag.id)} onClick={() => toggleTagFilter(tag.id)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </PageHeader>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6">
          <p className="text-muted">No applications yet.</p>
          <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
            Add application
          </button>
        </div>
      ) : filteredJobs.length === 0 ? (
        <p className="text-muted">No applications match these filters.</p>
      ) : view === "grouped" ? (
        <JobDateGroups
          jobs={filteredJobs}
          selecting={selecting}
          renderCard={renderJob}
          onSelectAll={(groupJobs) => selectMany(groupJobs.map((job) => job.id))}
        />
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">{filteredJobs.map(renderJob)}</ul>
      )}

      {showForm && (
        <Modal title="Add application" onClose={() => setShowForm(false)}>
          <JobForm
            setShowForm={setShowForm}
            newJob={newJob}
            saving={saving}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
          />
        </Modal>
      )}

      {showManageTags && (
        <ManageTagsModal tags={tags} onCreate={createTag} onUpdate={updateTag} onDelete={removeTag} onClose={closeManageTags} />
      )}

      {/* Stays open with nothing selected while changes wait, so Save is still there */}
      {selecting && (visibleSelectedIds.length > 0 || batchChanges.hasChanges) && (
        <BatchBar
          selectedJobs={visibleSelectedJobs}
          actions={["status", "tags", "archive"]}
          tags={tags}
          changes={batchChanges}
          onSave={saveBatchChanges}
          onApply={applyBatch}
          onClearSelection={clearSelection}
          onCreateTag={createTag}
          onCancel={exitSelecting}
          busy={batchBusy}
        />
      )}
      {archivePrompt}
    </div>
  );
}

