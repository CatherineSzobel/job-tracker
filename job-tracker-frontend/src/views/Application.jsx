import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import InterviewCard from "../components/Interview/InterviewCard";

export default function Application() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [originalJob, setOriginalJob] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const startEditing = () => {
    setOriginalJob(job);
    setEditing(true);
  };

  const cancelEditing = () => {
    setJob(originalJob);
    setEditing(false);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await API.put(`/job-applications/${id}`, job);
      setJob(res.data.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const deleteJob = async () => {
    if (!window.confirm("Delete this job application?")) return;

    try {
      await API.delete(`/job-applications/${job.id}`);
      navigate("/applications");
    } catch (err) {
      console.error(err);
      alert("Failed to delete job");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12   rounded-full animate-spin"></div>
        <p className="ml-2 text-light-muted dark:text-dark-muted">Loading...</p>
      </div>
    );
  }

  if (!job) {
    return <p className="text-center mt-10 text-light-muted dark:text-dark-muted">Not found</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 bg-light dark:bg-dark-soft rounded-2xl transition-colors">

      {/* HEADER */}
      <div className="bg-light-soft dark:bg-dark rounded-2xl p-6 mb-4 flex justify-between items-start transition-colors">
        <div>
          {editing ? (
            <input
              name="position"
              value={job.position}
              onChange={handleChange}
              className="text-2xl font-semibold w-full px-3 py-1 rounded-2xl   bg-light dark:bg-dark-text text-light-text dark:text-dark transition-colors"
            />
          ) : (
            <h1 className="text-2xl font-semibold rounded-2xl text-light-text dark:text-dark-text">{job.position}</h1>
          )}

          {editing ? (
            <input
              name="company_name"
              value={job.company_name}
              onChange={handleChange}
              className="mt-2 text-sm w-full px-3 py-1 rounded-md e bg-light-soft dark:bg-dark-subtle text-light-muted dark:text-dark-muted transition-colors"
            />
          ) : (
            <p className="mt-1 text-sm text-light-muted dark:text-dark-muted">{job.company_name}</p>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          {editing && (
            <button
              className="text-sm text-light-muted dark:text-dark-muted hover:text-accent dark:hover:text-accent transition-colors"
              onClick={cancelEditing}
            >
              Cancel
            </button>
          )}

          <button
            onClick={() => (editing ? saveChanges() : startEditing())}
            className="text-sm font-medium text-accent hover:text-accent-soft transition-colors px-3 py-1"
          >
            {editing ? (saving ? "Saving…" : "Save") : "Edit"}
          </button>

          <button
            className="text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors px-3 py-1"
            onClick={deleteJob}
          >
            Delete
          </button>
        </div>
      </div>

      {/* META ROW */}
      <div className="bg-light-soft dark:bg-dark-soft  rounded-xl p-4 mb-6 flex flex-wrap gap-8 text-sm transition-colors">
        <div>
          <span className="block text-light-muted dark:text-dark-muted">Status</span>
          {editing ? (
            <select
              name="status"
              value={job.status}
              onChange={handleChange}
              className=" bg-transparent text-dark dark:text-light dark:bg-dark-subtle transition-colors rounded-2xl"
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          ) : (
            <span className="capitalize text-light-muted dark:text-dark-muted">{job.status}</span>
          )}
        </div>

        <div>
          <span className="block text-light-muted dark:text-dark-muted">Priority</span>
          {editing ? (
            <select
              name="priority"
              value={job.priority}
              onChange={handleChange}
              className=" bg-transparent text-dark dark:text-light transition-colors dark:bg-dark-subtle rounded-2xl"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          ) : (
            <span className="capitalize text-light-muted dark:text-dark-muted">{job.priority}</span>
          )}
        </div>

        <div>
          <span className="block text-light-muted dark:text-dark-muted">Applied</span>
          <span className="text-light-muted dark:text-dark-muted">{job.applied_date}</span>
        </div>
      </div>

      {/* NOTES */}
      <div className="mb-10">
        <h2 className="text-accent font-semibold mb-2">Notes</h2>

        {editing ? (
          <textarea
            name="notes"
            value={job.notes || ""}
            onChange={handleChange}
            rows={6}
            className="w-full  rounded-md px-3 py-2 bg-light-soft text-dark dark:text-light dark:bg-dark-subtle focus:ring-2 focus:ring-accent transition-colors"
            placeholder="Notes about this application…"
          />
        ) : job.notes ? (
          <p className="text-light-text dark:text-dark-text whitespace-pre-wrap">{job.notes}</p>
        ) : (
          <p className="text-light-muted dark:text-dark-muted text-sm">No notes yet.</p>
        )}
      </div>

      {/* INTERVIEWS */}
      <div className="bg-light-soft dark:bg-dark-soft rounded-xl p-6 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-accent dark:text-accent">Interviews</h2>

          <button
            className="text-sm text-accent dark:text-accent hover:text-accent-soft dark:hover:text-accent-soft transition-colors"
            onClick={() => alert("Add Interview")}
          >
            + Add interview
          </button>
        </div>

        {job.interviews?.length ? (
          <ul className="flex flex-col gap-3">
            {job.interviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </ul>
        ) : (
          <p className="text-light-muted dark:text-dark-muted text-sm">No interviews scheduled.</p>
        )}
      </div>
    </div>
  );
}
