import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { format, isPast, parseISO } from "date-fns";
import { ChevronLeft, ClipboardList, EllipsisVertical, ExternalLink, MapPin, Pencil, Plus, StickyNote, Tag } from "lucide-react";
import API from "../api/axios";
import AttachedDocuments from "../components/Documents/AttachedDocuments";
import InterviewCard from "../components/Interview/InterviewCard";
import InterviewForm from "../components/Interview/InterviewForm";
import useArchiveWithTodos, { archiveChanges } from "../components/JobApplications/useArchiveWithTodos";
import TagChip from "../components/Tags/TagChip";
import TagInput from "../components/Tags/TagInput";
import useTags from "../components/Tags/useTags";
import JobFollowUps from "../components/Todo/JobFollowUps";
import Card from "../components/UI/Card";
import Menu, { MenuDivider, MenuItem } from "../components/UI/Menu";
import Modal from "../components/UI/Modal";
import PageLoader from "../components/UI/PageLoader";
import { EMPTY_INTERVIEW, JOB_STATUSES, PRIORITIES, PRIORITY_TEXT_CLASSES, STATUS_BADGE_CLASSES, priorityLabel } from "../constants/jobs";
import { confirmAction } from "../stores/useConfirmStore";
import { usePageTitleStore } from "../stores/usePageTitleStore";
import { useToastStore } from "../stores/useToastStore";

// The 2×2 status picker's buttons: the chosen one in its status colours with a border of the same hue
const statusOptionClasses = (isChosen, status) =>
  `min-h-10 rounded-lg border text-sm font-semibold transition-colors ${
    isChosen ? `border-current ${STATUS_BADGE_CLASSES[status]}` : "border-line bg-surface text-muted-2 hover:bg-soft"
  }`;

// The fields the header shows as inputs while editing
const HEADER_FIELDS = [
  { name: "position", label: "Position", required: true },
  { name: "company_name", label: "Company", required: true },
  { name: "location", label: "Location", required: true },
  { name: "job_link", label: "Link to the posting", type: "url" },
];

export default function Application() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [originalJob, setOriginalJob] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // "Add interview" form (null while closed)
  const [newInterview, setNewInterview] = useState(null);
  const [savingInterview, setSavingInterview] = useState(false);

  const { tags: allTags, createTag } = useTags();
  const showToast = useToastStore((state) => state.showToast);
  const setPageTitle = usePageTitleStore((state) => state.setPageTitle);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await API.get(`/job-applications/${id}`);
        setJob(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // The breadcrumb shows the position instead of "Application"
  const savedPosition = editing ? originalJob?.position : job?.position;
  useEffect(() => {
    if (savedPosition) setPageTitle(pathname, savedPosition);
  }, [pathname, savedPosition, setPageTitle]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const startEditing = () => {
    setOriginalJob(job);
    setEditing(true);
  };

  const cancelEditing = () => {
    // Tags and documents save on their own, so Cancel keeps the current ones
    setJob((currentJob) => ({ ...originalJob, tags: currentJob.tags, documents: currentJob.documents }));
    setEditing(false);
  };

  const saveChanges = async (event) => {
    event?.preventDefault();
    setSaving(true);
    try {
      const res = await API.put(`/job-applications/${id}`, job);
      setJob(res.data.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      showToast("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // While editing, the picker is part of the form (saved with Save); otherwise one click saves it
  const changeStatus = async (status) => {
    if (status === job.status) return;
    if (editing) {
      setJob({ ...job, status });
      return;
    }

    const previousStatus = job.status;
    setJob((currentJob) => ({ ...currentJob, status }));
    try {
      const res = await API.put(`/job-applications/${id}`, { ...job, status });
      setJob(res.data.data);
    } catch (err) {
      console.error(err);
      setJob((currentJob) => ({ ...currentJob, status: previousStatus }));
      showToast("Failed to change the status");
    }
  };

  // Left/Right/Up/Down move through the statuses, as in any radio group
  const moveStatusWithArrowKeys = (event) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const currentIndex = JOB_STATUSES.findIndex(({ value }) => value === job.status);
    const next = JOB_STATUSES[(currentIndex + step + JOB_STATUSES.length) % JOB_STATUSES.length];
    changeStatus(next.value);
    document.getElementById(`status-${next.value}`)?.focus();
  };

  const addInterview = async (e) => {
    e.preventDefault();
    setSavingInterview(true);
    try {
      const { job_id, ...payload } = newInterview;
      const res = await API.post(`/job-applications/${job_id}/interviews`, payload);
      setJob((prev) => ({ ...prev, interviews: [...(prev.interviews ?? []), res.data.data] }));
      setNewInterview(null);
    } catch (err) {
      console.error(err);
      showToast("Failed to add interview. Make sure all fields are valid.");
    } finally {
      setSavingInterview(false);
    }
  };

  // deleteOpenTodos: the answer from the to-dos prompt, or undefined to follow the user's setting
  const archive = async (deleteOpenTodos) => {
    try {
      await API.put(`/job-applications/${job.id}`, archiveChanges(deleteOpenTodos));
      showToast("Application archived", "success");
      navigate("/applications");
    } catch (err) {
      console.error(err);
      showToast("Failed to archive the application");
    }
  };

  const { requestArchive, prompt: archivePrompt } = useArchiveWithTodos(archive);

  const deleteJob = async () => {
    if (!(await confirmAction({ message: "Delete this job application?", confirmLabel: "Delete", danger: true }))) return;

    try {
      await API.delete(`/job-applications/${job.id}`);
      navigate("/applications");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete job");
    }
  };

  // Only the tags are taken from the response, so unsaved edits to other fields stay
  const saveTags = async (tagIds) => {
    try {
      const res = await API.put(`/job-applications/${job.id}/tags`, { tag_ids: tagIds });
      setJob((currentJob) => ({ ...currentJob, tags: res.data.data.tags }));
    } catch (err) {
      console.error(err);
      showToast("Failed to save tags");
    }
  };

  if (loading) {
    return <PageLoader text="Loading application..." />;
  }

  if (!job) {
    return <p className="text-muted">This application could not be found.</p>;
  }

  const jobTags = job.tags ?? [];
  const jobTagIds = jobTags.map((tag) => tag.id);
  const interviews = [...(job.interviews ?? [])].sort((first, second) => new Date(first.interview_date) - new Date(second.interview_date));
  const nextInterviewId = interviews.find((interview) => !isPast(new Date(interview.interview_date)))?.id;

  return (
    <div className="flex flex-col gap-6">
      {/* Phones have no breadcrumb */}
      <Link to="/applications" className="inline-flex min-h-10 items-center gap-1 self-start font-semibold text-accent-text lg:hidden">
        <ChevronLeft size={16} aria-hidden="true" />
        All applications
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        {editing ? (
          // Only the header fields are a <form>: the tag and follow-up forms below can't sit inside one
          <form id="application-edit-form" onSubmit={saveChanges} className="grid min-w-0 flex-[1_1_480px] gap-4 sm:grid-cols-2">
            {HEADER_FIELDS.map(({ name, label, type = "text", required = false }) => (
              <div key={name}>
                <label htmlFor={`edit-${name}`} className="input-label">
                  {label}
                </label>
                <input
                  id={`edit-${name}`}
                  type={type}
                  name={name}
                  value={job[name] ?? ""}
                  onChange={handleChange}
                  required={required}
                  className="input-field"
                />
              </div>
            ))}
          </form>
        ) : (
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="page-title break-words">{job.position}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
              <span className="font-semibold text-ink">{job.company_name}</span>
              {job.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={16} aria-hidden="true" />
                  {job.location}
                </span>
              )}
              {job.job_link && (
                <a
                  href={job.job_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-semibold text-accent-text hover:underline"
                >
                  View posting
                  <ExternalLink size={14} strokeWidth={2.5} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {editing ? (
            <>
              <button type="button" onClick={cancelEditing} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" form="application-edit-form" disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={startEditing} className="btn-secondary">
                <Pencil size={16} aria-hidden="true" />
                Edit
              </button>
              <Menu label="More actions" buttonClassName="btn-secondary w-12 px-0" buttonContent={<EllipsisVertical size={20} aria-hidden="true" />}>
                <MenuItem onClick={() => requestArchive({ openTodosCount: job.open_todos_count ?? 0 })}>Archive</MenuItem>
                <MenuDivider />
                <MenuItem onClick={deleteJob} danger>
                  Delete application
                </MenuItem>
              </Menu>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[2_1_480px] flex-col gap-6">
          <Card title="Notes" icon={StickyNote}>
            {editing ? (
              <>
                <label htmlFor="edit-notes" className="sr-only">
                  Notes
                </label>
                <textarea
                  id="edit-notes"
                  name="notes"
                  value={job.notes || ""}
                  onChange={handleChange}
                  rows={6}
                  className="input-field resize-y"
                  placeholder="Notes about this application…"
                />
              </>
            ) : job.notes ? (
              <p className="max-w-[72ch] whitespace-pre-wrap">{job.notes}</p>
            ) : (
              <p className="text-muted">No notes yet.</p>
            )}
          </Card>

          <Card
            title="Interviews"
            icon={ClipboardList}
            action={
              <button type="button" className="btn-soft" onClick={() => setNewInterview({ ...EMPTY_INTERVIEW, job_id: job.id })}>
                <Plus size={16} strokeWidth={2.5} aria-hidden="true" />
                Add interview
              </button>
            }
          >
            {interviews.length ? (
              <ul className="flex flex-col gap-2">
                {interviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} isNext={interview.id === nextInterviewId} />
                ))}
              </ul>
            ) : (
              <p className="text-muted">No interviews scheduled.</p>
            )}
          </Card>

          <JobFollowUps job={job} />
        </div>

        <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-6">
          <Card title="Details">
            <div className="flex flex-col gap-2">
              <span id="status-label" className="text-sm font-semibold text-muted">
                Status
              </span>
              <div role="radiogroup" aria-labelledby="status-label" onKeyDown={moveStatusWithArrowKeys} className="grid grid-cols-2 gap-2">
                {JOB_STATUSES.map(({ value, label }) => {
                  const isChosen = job.status === value;
                  return (
                    <button
                      key={value}
                      id={`status-${value}`}
                      type="button"
                      role="radio"
                      aria-checked={isChosen}
                      tabIndex={isChosen ? 0 : -1}
                      onClick={() => changeStatus(value)}
                      className={statusOptionClasses(isChosen, value)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3">
              <dt className="text-muted">Priority</dt>
              <dd className={`font-semibold ${editing ? "" : PRIORITY_TEXT_CLASSES[job.priority] ?? ""}`}>
                {editing ? (
                  <select name="priority" aria-label="Priority" value={job.priority} onChange={handleChange} className="input-field min-h-10 py-1 font-normal">
                    {PRIORITIES.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                ) : (
                  priorityLabel(job.priority)
                )}
              </dd>
              <dt className="text-muted">Applied</dt>
              <dd className="font-semibold">{job.applied_date ? format(parseISO(job.applied_date), "d MMM yyyy") : "—"}</dd>
              <dt className="text-muted">Location</dt>
              <dd className="font-semibold break-words">{job.location || "—"}</dd>
            </dl>
          </Card>

          {/* Tags save straight away, also while the other fields are being edited */}
          <Card title="Tags" icon={Tag}>
            {jobTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {jobTags.map((tag) => (
                  <TagChip key={tag.id} tag={tag} onRemove={() => saveTags(jobTagIds.filter((id) => id !== tag.id))} />
                ))}
              </div>
            )}
            <TagInput
              tags={allTags}
              excludeIds={jobTagIds}
              onCreate={createTag}
              // Typing the name of a tag the job already has selects it too; adding it twice would fail
              onSelect={(tag) => {
                if (!jobTagIds.includes(tag.id)) saveTags([...jobTagIds, tag.id]);
              }}
            />
          </Card>

          <AttachedDocuments
            jobId={job.id}
            documents={job.documents ?? []}
            onChange={(documents) => setJob((prev) => ({ ...prev, documents }))}
          />
        </div>
      </div>

      {newInterview && (
        <Modal title="Add interview" onClose={() => setNewInterview(null)}>
          <InterviewForm
            handleSubmit={addInterview}
            handleChange={(e) => setNewInterview((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
            saving={savingInterview}
            newInterview={newInterview}
            jobs={[job]}
            lockJob
            onCancel={() => setNewInterview(null)}
          />
        </Modal>
      )}
      {archivePrompt}
    </div>
  );
}
