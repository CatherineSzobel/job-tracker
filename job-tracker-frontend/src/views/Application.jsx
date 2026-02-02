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
    return <p className="text-center mt-10 text-muted">Loading…</p>;
  }

  if (!job) {
    return <p className="text-center mt-10 text-muted">Not found</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* HEADER */}
      <div className="bg-linear-to-r from-primary to-primary-soft text-surface rounded-2xl p-6 mb-2 flex justify-between items-start">
        <div>
          {editing ? (
            <input
              name="position"
              value={job.position}
              onChange={handleChange}
              className="text-2xl font-semibold bg-primary-soft border border-primary-subtle rounded-md px-3 py-1 text-surface"
            />
          ) : (
            <h1 className="text-2xl font-semibold">{job.position}</h1>
          )}

          {editing ? (
            <input
              name="company_name"
              value={job.company_name}
              onChange={handleChange}
              className="mt-2 text-sm bg-primary-soft border border-primary-subtle rounded-md px-3 py-1 text-secondary-text"
            />
          ) : (
            <p className="mt-1 text-sm text-secondary-text">{job.company_name}</p>
          )}
        </div>

        <div className="flex gap-3">
          {editing && (
            <button className="text-sm text-secondary-text hover:text-surface" onClick={cancelEditing}>
              Cancel
            </button>
          )}

          <button
            onClick={() => (editing ? saveChanges() : startEditing())}
            className="text-sm font-medium text-accent hover:text-accent-soft px-3 py-1"
          >
            {editing ? (saving ? "Saving…" : "Save") : "Edit"}
          </button>

          <button className="text-sm text-red-300 hover:text-red-200" onClick={deleteJob}>
            Delete
          </button>
        </div>
      </div>

      {/* META ROW (closer to header) */}
      <div className="bg-secondary border border-secondary-soft rounded-xl p-4 mb-6 flex flex-wrap gap-8 text-sm">
        <div>
          <span className="block text-secondary-text">Status</span>
          {editing ? (
            <select
              name="status"
              value={job.status}
              onChange={handleChange}
              className="border-b border-secondary-muted bg-transparent"
            >
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          ) : (
            <span className="capitalize text-secondary-text">{job.status}</span>
          )}
        </div>

        <div>
          <span className="block text-secondary-text">Priority</span>
          {editing ? (
            <select
              name="priority"
              value={job.priority}
              onChange={handleChange}
              className="border-b border-secondary-muted bg-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          ) : (
            <span className="capitalize text-secondary-text">{job.priority}</span>
          )}
        </div>

        <div>
          <span className="block text-secondary-text">Applied</span>
          <span className="text-secondary-text">{job.applied_date}</span>
        </div>
      </div>


      {/* NOTES */}
      <div className="mb-10">
        <h2 className="text-primary font-semibold mb-2">Notes</h2>

        {editing ? (
          <textarea
            name="notes"
            value={job.notes || ""}
            onChange={handleChange}
            rows={6}
            className="w-full border border-secondary-muted rounded-md px-3 py-2 focus:ring-2 focus:ring-accent"
            placeholder="Notes about this application…"
          />
        ) : job.notes ? (
          <p className="text-muted whitespace-pre-wrap">{job.notes}</p>
        ) : (
          <p className="text-secondary-text text-sm">No notes yet.</p>
        )}
      </div>

      {/* INTERVIEWS */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-primary">Interviews</h2>

          <button className="text-sm text-accent hover:text-accent-soft" onClick={() => alert("Add Interview")}>
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
          <p className="text-secondary-text text-sm">No interviews scheduled.</p>
        )}
      </div>
    </div>
  );
}
