import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format, isToday, isTomorrow } from "date-fns";
import { Calendar, Plus } from "lucide-react";
import { confirmAction } from "../stores/useConfirmStore";
import API from "../api/axios";
import InterviewForm from "../components/Interview/InterviewForm";
import InterviewListCard from "../components/Interview/InterviewListCard";
import { INTERVIEW_WHEN_OPTIONS, filterInterviews, sortOrderFor } from "../components/Interview/interviewFilters";
import DateGroups from "../components/UI/DateGroups";
import PageHeader from "../components/UI/PageHeader";
import SearchInput from "../components/UI/SearchInput";
import { SEGMENTED_TRACK_CLASSES, segmentClasses } from "../components/UI/segmentedClasses";
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

// "today at 10:30", "tomorrow at 10:30", "on Mon 12 Oct at 09:30"
const whenLabel = (date) => {
  const time = format(date, "HH:mm");
  if (isToday(date)) return `today at ${time}`;
  if (isTomorrow(date)) return `tomorrow at ${time}`;
  return `on ${format(date, "EEE d MMM")} at ${time}`;
};

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

  // The header summary and the filled date block are about the soonest upcoming interview
  const upcomingInterviews = filterInterviews(interviews, { when: "upcoming", search: "" });
  const nextInterview = upcomingInterviews[0];

  const renderInterview = (interview) => (
    <InterviewListCard
      key={interview.id}
      interview={interview}
      isNext={interview.id === nextInterview?.id}
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

  const summary = nextInterview
    ? `${upcomingInterviews.length} upcoming · next one ${whenLabel(new Date(nextInterview.interview_date))}`
    : "Nothing coming up";
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  return (
    <div className={`flex flex-col gap-6 ${selecting ? "pb-32" : ""}`}>
      <PageHeader
        title="Interviews"
        description={summary}
        actions={
          <>
            {interviews.length > 0 && (
              <>
                <ViewToggle view={view} onChange={changeView} />
                <SelectModeButtons
                  selecting={selecting}
                  visibleCount={visibleIds.length}
                  onStart={startSelecting}
                  onSelectAll={() => selectMany(visibleIds)}
                  onCancel={exitSelecting}
                />
              </>
            )}
            <Link to="/calendar" className="btn-secondary">
              <Calendar size={16} aria-hidden="true" />
              Calendar
            </Link>
            <button type="button" onClick={openAddForm} className="btn-primary">
              <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
              Add interview
            </button>
          </>
        }
      >
        {interviews.length > 0 && (
          <div className="flex flex-wrap items-center gap-4">
            <div role="group" aria-label="Which interviews" className={SEGMENTED_TRACK_CLASSES}>
              {INTERVIEW_WHEN_OPTIONS.map(({ value, label }) => (
                <button key={value} type="button" onClick={() => setWhen(value)} aria-pressed={when === value} className={segmentClasses(when === value)}>
                  {label}
                </button>
              ))}
            </div>
            <SearchInput label="Search company or position" value={search} onChange={setSearch} className="flex-[1_1_280px]" />
          </div>
        )}
      </PageHeader>

      {loadFailed ? (
        <p className="text-muted">
          Couldn&apos;t load your interviews.{" "}
          <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)} className="font-semibold text-accent-text hover:underline">
            Try again
          </button>
        </p>
      ) : interviews.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-line bg-surface p-6">
          <p className="text-muted">No interviews yet.</p>
          <button type="button" onClick={openAddForm} className="btn-primary">
            <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
            Add interview
          </button>
        </div>
      ) : visibleInterviews.length === 0 ? (
        <p className="text-muted">
          No interviews match.{" "}
          <button type="button" onClick={clearFilters} className="font-semibold text-accent-text hover:underline">
            Clear filters
          </button>
        </p>
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
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-4">{visibleInterviews.map(renderInterview)}</ul>
      )}

      {showForm && (
        <Modal title={editingInterview ? "Edit interview" : "Add interview"} onClose={resetForm}>
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
