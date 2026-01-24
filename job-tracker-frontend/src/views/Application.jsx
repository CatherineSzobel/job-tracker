// src/views/Application.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

export default function Application() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(`/job-applications/${id}`);
        setJob(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await API.put(`/job-applications/${id}`, job);
      setJob(res.data.data);
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!job) return <p className="text-center mt-10">Not found</p>;


  return (
    <div className="max-w-4xl mx-auto mt-10 flex flex-col gap-6">

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          {editing ? (
            <input
              name="position"
              value={job.position}
              onChange={handleChange}
              className="text-2xl font-bold border rounded-lg px-3 py-1"
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">
              {job.position}
            </h1>
          )}
          <span className="text-sm text-gray-500">
            {job.company_name}
          </span>
        </div>

        <button
          onClick={() => (editing ? saveChanges() : setEditing(true))}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition
      ${editing
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "border border-gray-300 hover:bg-gray-50"
            }`}
        >
          {editing ? (saving ? "Saving..." : "Save changes") : "Edit"}
        </button>
        <button
          onClick={async () => {
            if (!window.confirm("Delete this job application?")) return;

            try {
              await API.delete(`/job-applications/${job.id}`);
              window.location.reload();
            } catch (err) {
              console.error(err);
              alert("Failed to delete job");
            }
          }}
          className="text-xs text-red-600 hover:text-red-800 transition"
        >
          Delete
        </button>

      </div>


      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            label: "Status",
            content: editing ? (
              <select
                name="status"
                value={job.status}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 w-fit"
              >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            ) : (
              <span className="capitalize font-medium">{job.status}</span>
            )
          },
          {
            label: "Priority",
            content: editing ? (
              <select
                name="priority"
                value={job.priority}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 w-fit"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <span className="capitalize font-medium">{job.priority}</span>
            )
          },
          {
            label: "Applied Date",
            content: editing ? (
              <input
                type="date"
                name="applied_date"
                value={job.applied_date}
                onChange={handleChange}
                className="border rounded-lg px-3 py-2"
              />
            ) : (
              <span className="font-medium">{job.applied_date}</span>
            )
          }
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-1"
          >
            <span className="text-xs uppercase tracking-wide text-gray-400">
              {item.label}
            </span>
            {item.content}
          </div>
        ))}
      </div>


      {/* Notes */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Notes</h2>

        {job.notes?.length ? (
          <ul className="flex flex-col gap-3">
            {job.notes.map(note => (
              <li
                key={note.id}
                className="border border-gray-200 rounded-xl p-4 text-sm bg-gray-50"
              >
                {note.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No notes yet.</p>
        )}
      </div>


      {/* Interviews */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Interviews</h2>

        {job.interviews?.length ? (
          <ul className="flex flex-col gap-4">
            {job.interviews.map(interview => (
              <li
                key={interview.id}
                className="flex gap-4 border-l-4 border-blue-500 pl-4"
              >
                <div>
                  <p className="font-medium capitalize">
                    {interview.type}
                  </p>
                  <p className="text-sm text-gray-500">
                    {interview.interview_date}
                  </p>
                  <p className="text-xs text-gray-400">
                    {interview.location}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">
            No interviews scheduled.
          </p>
        )}
      </div>

    </div>
  );
}
