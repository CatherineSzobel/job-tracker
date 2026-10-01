import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, LayoutGrid } from "lucide-react";
import API from "../api/axios";
import BatchBar from "../components/JobApplications/BatchBar";
import { batchUpdateJobs, mergeBatchResult, tagIdsOf } from "../components/JobApplications/batchUpdate";
import JobCard from "../components/JobApplications/JobCard";
import JobForm from "../components/JobApplications/JobForm";
import JobGroups from "../components/JobApplications/JobGroups";
import useArchiveWithTodos, { archiveChanges } from "../components/JobApplications/useArchiveWithTodos";
import useSelection from "../components/JobApplications/useSelection";
import ManageTagsModal from "../components/Tags/ManageTagsModal";
import TagChip from "../components/Tags/TagChip";
import useTags from "../components/Tags/useTags";
import PageLoader from "../components/UI/PageLoader";
import Modal from "../components/UI/Modal";
import { EMPTY_JOB, JOB_STATUSES, PRIORITIES } from "../constants/jobs";
import { useToastStore } from "../stores/useToastStore";

const HEADER_BUTTON_CLASSES = "px-3 py-2 rounded-md text-sm border border-light-muted dark:border-dark-subtle text-light-text dark:text-dark-text hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors";

const VIEW_STORAGE_KEY = "applications-view";

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "grouped", label: "Grouped by date", icon: CalendarDays },
];

// Remembered per browser. localStorage can throw (private windows, blocked storage).
function readSavedView() {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) === "grouped" ? "grouped" : "grid";
  } catch {
    return "grid";
  }
}

export default function Applications() {
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState([]);
  const [showManageTags, setShowManageTags] = useState(false);
  const [view, setView] = useState(readSavedView);
  const { tags, reloadTags, createTag, updateTag, deleteTag } = useTags();
  const { selecting, startSelecting, exitSelecting, selectedIds, toggleSelected, selectMany } = useSelection();
  const [batchBusy, setBatchBusy] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      alert("Failed to add job application");
    } finally {
      setSaving(false);
    }
  };

  const toggleTagFilter = (tagId) =>
    setTagFilter((currentIds) =>
      currentIds.includes(tagId) ? currentIds.filter((id) => id !== tagId) : [...currentIds, tagId]
    );

  const openManageTags = () => {
    setShowMenu(false);
    reloadTags();
    setShowManageTags(true);
  };

  const closeManageTags = () => {
    setShowManageTags(false);
    loadJobs();
  };

  const changeView = (nextView) => {
    setView(nextView);
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, nextView);
    } catch {
      // Storage unavailable: the choice lasts for this visit only
    }
  };

  // A deleted tag can't stay in the filter, or no application would match
  const removeTag = async (tag) => {
    if (await deleteTag(tag)) {
      setTagFilter((currentIds) => currentIds.filter((id) => id !== tag.id));
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const statusMatch = statusFilter === "all" || job.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || job.priority === priorityFilter;
    const tagMatch = tagFilter.every((tagId) => job.tags?.some((tag) => tag.id === tagId));
    return statusMatch && priorityMatch && tagMatch;
  });

  const visibleIds = filteredJobs.map((job) => job.id);
  // Only selected cards that are still visible count: changing a filter hides some without unselecting them
  const visibleSelectedIds = selectedIds.filter((id) => visibleIds.includes(id));

  // The selection stays after status and tag changes (so several can be applied in a row);
  // archived cards leave the list, so archiving ends select mode
  const sendBatch = async (changes) => {
    setBatchBusy(true);
    try {
      const updatedJobs = await batchUpdateJobs(visibleSelectedIds, changes);
      setJobs((currentJobs) => mergeBatchResult(currentJobs, updatedJobs, false));
      if ("is_archived" in changes) exitSelecting();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to update the selected applications");
    } finally {
      setBatchBusy(false);
    }
  };

  // deleteOpenTodos: the answer from the to-dos prompt, or undefined when it wasn't asked
  // (then confirm here, and the server follows the user's setting)
  const archiveSelected = (deleteOpenTodos) => {
    const count = visibleSelectedIds.length;
    const wasAsked = deleteOpenTodos !== undefined;
    if (!wasAsked && !window.confirm(`Archive ${count} application${count === 1 ? "" : "s"}?`)) {
      return;
    }
    sendBatch(archiveChanges(deleteOpenTodos));
  };

  const { requestArchive, prompt: archivePrompt } = useArchiveWithTodos(archiveSelected);

  const applyBatch = (changes) => {
    if (!changes.is_archived) {
      sendBatch(changes);
      return;
    }
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

      // Invalid rows are skipped by the server and listed in `failures`
      const skipped = (data.failures ?? []).map(
        (f) => `Row ${f.row} (${f.attribute}): ${f.errors.join(", ")}`
      );
      alert(skipped.length ? `${data.message}\n\n${skipped.join("\n")}` : data.message);
    } catch (err) {
      console.error("Import failed", err.response || err);
      alert(
        "Import failed: " +
        (err.response?.data?.message || JSON.stringify(err.response?.data) || err.message)
      );
    } finally {
      setImporting(false);
    }
  };

  // After every hook (useArchiveWithTodos above is one), so they run on every render
  if (loading) {
    return <PageLoader text="Loading Applications..."/>
  }

  return (
    <div className={`max-w-5xl mx-auto sm:px-4 py-4 sm:py-10 ${selecting ? "pb-28" : ""}`}>
      {/* HEADER */}
      <div className="rounded-2xl p-4 sm:p-6 mb-6 bg-surface dark:bg-dark-soft shadow-md border border-border dark:border-dark-subtle transition-colors">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-light-text dark:text-dark-text">
            Job Applications
            <span className="ml-2 text-sm text-muted dark:text-dark-muted">
              ({jobs.length})
            </span>
          </h1>

          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            {selecting ? (
              <>
                <button type="button" onClick={() => selectMany(visibleIds)} className={HEADER_BUTTON_CLASSES}>
                  Select all ({visibleIds.length})
                </button>
                <button type="button" onClick={exitSelecting} className={HEADER_BUTTON_CLASSES}>
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" onClick={startSelecting} className={HEADER_BUTTON_CLASSES}>
                Select
              </button>
            )}

            {/* View: icon buttons, the name shows as a tooltip */}
            <div
              role="group"
              aria-label="View"
              className="flex rounded-md border border-light-muted dark:border-dark-subtle overflow-hidden"
            >
              {VIEW_OPTIONS.map((option) => {
                const ViewIcon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => changeView(option.value)}
                    aria-pressed={view === option.value}
                    aria-label={option.label}
                    title={option.label}
                    className={`w-9 h-9 flex items-center justify-center transition-colors ${view === option.value ? "bg-accent text-surface" : "text-light-muted dark:text-dark-muted hover:bg-light-soft dark:hover:bg-dark-subtle"}`}
                  >
                    <ViewIcon size={18} aria-hidden="true" />
                  </button>
                );
              })}
            </div>

            <button
              className="px-4 py-2 rounded-md text-sm bg-accent-soft hover:bg-accent text-surface font-semibold transition-colors"
              onClick={() => setShowForm(true)}
            >
              + Add
            </button>

            {/* Dropdown */}
            <button
              onClick={() => setShowMenu((s) => !s)}
              className="w-9 h-9 flex items-center justify-center font-extrabold hover:border rounded-lg text-accent dark:text-accent-muted transition-colors"
            >
              ⋮
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 w-40 rounded-lg shadow-lg border overflow-hidden z-50 bg-surface dark:bg-dark-soft border-border dark:border-dark-subtle text-primary dark:text-dark-text transition-colors">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors"
                  onClick={() => navigate("/archives")}
                >
                  Archives
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors"
                  onClick={openManageTags}
                >
                  Manage tags
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors"
                  onClick={exportJobs}
                >
                  Export Excel
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm disabled:opacity-50 hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors"
                  onClick={() => fileInputRef.current.click()}
                  disabled={importing}
                >
                  {importing ? "Importing…" : "Import Excel"}
                </button>
              </div>
            )}

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
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="rounded-xl pt-4 sm:p-4 mb-2 sm:mb-6 flex flex-wrap gap-4 sm:gap-6 text-sm">
          <div>
            <label className="block mb-1 text-light-text dark:text-dark-text">Status</label>
            <select
              className="border rounded-lg px-3 py-1 text-light-text dark:text-dark-text border-light-muted dark:border-dark-subtle bg-surface dark:bg-dark-soft transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              {JOB_STATUSES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 text-light-text dark:text-dark-text">Priority</label>
            <select
              className="border rounded-lg px-3 py-1 text-light-text dark:text-dark-text border-light-muted dark:border-dark-subtle bg-surface dark:bg-dark-soft transition-colors"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All</option>
              {PRIORITIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {tags.length > 0 && (
            <div>
              <span className="block mb-1 text-light-text dark:text-dark-text">Tags</span>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <TagChip key={tag.id} tag={tag} active={tagFilter.includes(tag.id)} onClick={() => toggleTagFilter(tag.id)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* JOB LIST */}
      {filteredJobs.length === 0 ? (
        <p className="text-center text-muted dark:text-dark-muted">No applications found.</p>
      ) : view === "grouped" ? (
        <JobGroups
          jobs={filteredJobs}
          renderJob={renderJob}
          renderGroupActions={
            selecting
              ? (groupJobs) => (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      selectMany(groupJobs.map((job) => job.id));
                    }}
                    className="text-xs font-normal text-accent dark:text-accent-muted hover:underline"
                  >
                    Select all
                  </button>
                )
              : undefined
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map(renderJob)}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <Modal title="Add Job Application" onClose={() => setShowForm(false)}>
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

      {selecting && visibleSelectedIds.length > 0 && (
        <BatchBar
          count={visibleSelectedIds.length}
          actions={["status", "tags", "archive"]}
          tags={tags}
          removableTagIds={tagIdsOf(jobs.filter((job) => visibleSelectedIds.includes(job.id)))}
          onApply={applyBatch}
          onCreateTag={createTag}
          onCancel={exitSelecting}
          busy={batchBusy}
        />
      )}
      {archivePrompt}
    </div>
  );
}
