import { useEffect, useState } from "react";
import { confirmAction } from "../stores/useConfirmStore";
import API from "../api/axios";
import InterviewForm from "../components/Interview/InterviewForm";
import InterviewListCard from "../components/Interview/InterviewListCard";
import { INTERVIEW_WHEN_OPTIONS, filterInterviews, sortOrderFor } from "../components/Interview/interviewFilters";
import DateGroups from "../components/UI/DateGroups";
import ListPageHeader from "../components/UI/ListPageHeader";
import Modal from "../components/UI/Modal";
import PageLoader from "../components/UI/PageLoader";
import SelectModeButtons from "../components/UI/SelectModeButtons";
import SelectionBar from "../components/UI/SelectionBar";
import ViewToggle from "../components/UI/ViewToggle";
import useSavedView from "../components/UI/useSavedView";
import useSelection from "../components/UI/useSelection";
import { EMPTY_INTERVIEW } from "../constants/jobs";
import { useToastStore } from "../stores/useToastStore";
import { toDateTimeInputValue } from "../utils/dateInput";
import { countOf } from "../utils/plural";

const showToast = (message) => useToastStore.getState().showToast(message);

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newInterview, setNewInterview] = useState(EMPTY_INTERVIEW);

  // "upcoming" | "past" | "all", and the search over company and position
  const [when, setWhen] = useState("upcoming");
  const [search, setSearch] = useState("");
  const [view, changeView] = useSavedView("interviews-view");
  const { selecting, startSelecting, exitSelecting, selectedIds, toggleSelected, selectMany } = useSelection();
  const [deleting, setDeleting] = useState(false);
  // The interviews couldn't be loaded: show that (with Try again) instead of "No interviews scheduled."
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  // The job list only fills the Add form, so the interviews still show when only that request fails
  useEffect(() => {
    Promise.allSettled([API.get("/job-applications"), API.get("/interviews")])
      .then(([jobsResult, interviewsResult]) => {
        if (jobsResult.status === "fulfilled") {
          setJobs(jobsResult.value.data.data);
        } else {
          console.error(jobsResult.reason);
          showToast("Couldn't load your applications for the Add form");
        }

        if (interviewsResult.status === "fulfilled") {
          setInterviews(interviewsResult.value.data.data);
          setLoadFailed(false);
        } else {
          console.error(interviewsResult.reason);
          setLoadFailed(true);
        }
      })
      .finally(() => setLoading(false));
  }, [loadAttempt]);

  const visibleInterviews = filterInterviews(interviews, { when, search });
  const visibleIds = visibleInterviews.map((interview) => interview.id);
  const visibleIdSet = new Set(visibleIds);
  // Only selected cards that are still visible count: changing a filter hides some without unselecting them
  const visibleSelectedIds = selectedIds.filter((id) => visibleIdSet.has(id));

  const clearFilters = () => {
    setWhen("upcoming");
    setSearch("");
  };

  const handleChange = (event) => {
    setNewInterview({ ...newInterview, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        type: newInterview.type || "online",
        interview_date: newInterview.interview_date,
        location: newInterview.location,
        notes: newInterview.notes || "",
      };

      if (editingInterview) {
        const res = await API.put(`/interviews/${editingInterview.id}`, payload);
        setInterviews((current) =>
          current.map((interview) => (interview.id === editingInterview.id ? { ...interview, ...res.data.data } : interview))
        );
      } else {
        const res = await API.post(`/job-applications/${newInterview.job_id}/interviews`, payload);
        // Same shape as GET /interviews, which eager-loads `job`
        const job = jobs.find((existing) => existing.id === Number(newInterview.job_id));
        const created = {
          ...res.data.data,
          job: job && { id: job.id, company_name: job.company_name, position: job.position },
        };
        setInterviews((current) => [created, ...current]);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Failed to save the interview. Make sure all fields are valid.");
    } finally {
      setSaving(false);
    }
  };

  const deleteInterview = async (interview) => {
    if (!(await confirmAction({ message: "Delete this interview?", confirmLabel: "Delete", danger: true }))) return;
    try {
      await API.delete(`/interviews/${interview.id}`);
      setInterviews((current) => current.filter((existing) => existing.id !== interview.id));
    } catch (err) {
      console.error(err);
      showToast("Failed to delete the interview");
    }
  };

  const deleteSelected = async () => {
    const count = visibleSelectedIds.length;
    const question = `Delete ${countOf(count, "interview")}? Their prep and debrief are deleted too. Your bank questions stay in the bank.`;
    if (!(await confirmAction({ message: question, confirmLabel: "Delete", danger: true }))) return;

    setDeleting(true);
    try {
      await API.delete("/interviews/batch", { data: { ids: visibleSelectedIds } });
      setInterviews((current) => current.filter((interview) => !visibleSelectedIds.includes(interview.id)));
      exitSelecting();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        // One of them is already gone (deleted in another tab): nothing was deleted, so show the real list
        exitSelecting();
        setLoadAttempt((attempt) => attempt + 1);
        showToast("Some of those interviews were already deleted, so nothing was deleted. The list was reloaded.");
      } else {
        showToast(err.response?.data?.message || "Failed to delete the selected interviews");
      }
    } finally {
      setDeleting(false);
    }
  };

  const startEdit = (interview) => {
    setEditingInterview(interview);
    setNewInterview({
      job_id: interview.job_application_id,
      type: interview.type || "",
      interview_date: toDateTimeInputValue(interview.interview_date),
      location: interview.location || "",
      notes: interview.notes || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setNewInterview(EMPTY_INTERVIEW);
    setEditingInterview(null);
    setShowForm(false);
  };

  const renderInterview = (interview) => (
    <InterviewListCard
      key={interview.id}
      interview={interview}
      onEdit={startEdit}
      onDelete={deleteInterview}
      selecting={selecting}
      selected={selectedIds.includes(interview.id)}
      onToggleSelect={toggleSelected}
    />
  );

  if (loading) {
    return <PageLoader text="Loading interviews..." />;
  }

  return (
    <div className={`max-w-6xl mx-auto mt-4 sm:mt-10 sm:px-4 transition-colors ${selecting ? "pb-28" : ""}`}>
      <ListPageHeader
        title="Interviews"
        count={visibleInterviews.length}
        actions={
          <>
            {interviews.length > 0 && (
              <>
                <SelectModeButtons
                  selecting={selecting}
                  visibleCount={visibleIds.length}
                  onStart={startSelecting}
                  onSelectAll={() => selectMany(visibleIds)}
                  onCancel={exitSelecting}
                />
                <ViewToggle view={view} onChange={changeView} />
              </>
            )}
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="btn-primary shadow"
            >
              + Add Interview
            </button>
          </>
        }
      >
        {interviews.length > 0 && (
          <>
            <div role="group" aria-label="Show" className="flex rounded-md border border-light-muted dark:border-dark-subtle overflow-hidden self-start">
              {INTERVIEW_WHEN_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setWhen(value)}
                  aria-pressed={when === value}
                  className={`px-4 py-2 text-sm transition-colors ${when === value ? "bg-accent text-surface" : "text-light-text dark:text-dark-text hover:bg-light-soft dark:hover:bg-dark-subtle"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company or position"
              aria-label="Search company or position"
              className="input-field sm:max-w-xs"
            />
          </>
        )}
      </ListPageHeader>

      {loadFailed ? (
        <div className="card text-center text-light-muted dark:text-dark-muted">
          Couldn&apos;t load your interviews.{" "}
          <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)} className="text-accent dark:text-accent-muted hover:underline">
            Try again
          </button>
        </div>
      ) : interviews.length === 0 ? (
        <div className="card text-center text-light-muted dark:text-dark-muted">No interviews scheduled.</div>
      ) : visibleInterviews.length === 0 ? (
        <div className="card text-center text-light-muted dark:text-dark-muted">
          No interviews match.{" "}
          <button type="button" onClick={clearFilters} className="text-accent dark:text-accent-muted hover:underline">
            Clear filters
          </button>
        </div>
      ) : view === "grouped" ? (
        <DateGroups
          // A new filter starts the sections fresh, so its first year and month are open again
          key={when}
          items={visibleInterviews}
          getDateString={(interview) => interview.interview_date}
          order={sortOrderFor(when)}
          itemLabel="interview"
          renderItem={renderInterview}
          onSelectAll={selecting ? (groupInterviews) => selectMany(groupInterviews.map((interview) => interview.id)) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{visibleInterviews.map(renderInterview)}</div>
      )}

      {showForm && (
        <Modal title={editingInterview ? "Edit Interview" : "Add New Interview"} onClose={resetForm}>
          <InterviewForm
            handleSubmit={handleSubmit}
            handleChange={handleChange}
            saving={saving}
            newInterview={newInterview}
            jobs={jobs}
            editingInterview={editingInterview}
            onCancel={resetForm}
          />
        </Modal>
      )}

      {selecting && visibleSelectedIds.length > 0 && (
        <SelectionBar count={visibleSelectedIds.length} onCancel={exitSelecting}>
          <button type="button" onClick={deleteSelected} disabled={deleting} className="btn-bar-danger">
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </SelectionBar>
      )}
    </div>
  );
}
