import { useState, useEffect } from "react";
import API from "../api/axios";
import InterviewForm from "../components/Interview/InterviewForm";
import InterviewList from "../components/Interview/InterviewList";

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newInterview, setNewInterview] = useState({
    job_id: "",
    type: "",
    interview_date: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, interviewsRes] = await Promise.all([
          API.get("/job-applications"),
          API.get("/interviews"),
        ]);

        setJobs(jobsRes.data || []);
        setInterviews(interviewsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setNewInterview({ ...newInterview, [e.target.name]: e.target.value });
  };

  const formatDateForLaravel = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:00`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        type: newInterview.type || "online",
        interview_date: formatDateForLaravel(newInterview.interview_date),
        location: newInterview.location,
        notes: newInterview.notes || "",
      };

      let res;
      if (editingInterview) {
        res = await API.put(`/interviews/${editingInterview.id}`, payload);
        setInterviews((prev) =>
          prev.map((i) => (i.id === editingInterview.id ? { ...i, ...res.data } : i))
        );
      } else {
        res = await API.post(
          `/job-applications/${newInterview.job_id}/interviews`,
          payload
        );

        const job = jobs.find((j) => j.id === parseInt(newInterview.job_id));
        if (!job) throw new Error("Job not found");

        const newInt = {
          ...res.data.data,
          job_id: newInterview.job_id,
          job_title: `${job.company_name} - ${job.position}`,
        };

        setInterviews((prev) => [newInt, ...prev]);
      }

      setNewInterview({
        job_id: "",
        type: "",
        interview_date: "",
        location: "",
        notes: "",
      });
      setEditingInterview(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save interview. Make sure all fields are valid.");
    } finally {
      setSaving(false);
    }
  };

  const deleteInterview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview?")) return;

    try {
      await API.delete(`/interviews/${id}`);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete interview.");
    }
  };

  const startEdit = (interview) => {
    setEditingInterview(interview);
    setNewInterview({
      job_id: interview.job_id,
      type: interview.type || "",
      interview_date: interview.interview_date,
      location: interview.location || "",
      notes: interview.notes || "",
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-light-muted dark:border-dark-muted border-t-accent rounded-full animate-spin"></div>
        <p className="ml-2 text-light-muted dark:text-dark-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
          Interviews Schedule ({interviews.length})
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-accent dark:bg-accent hover:bg-accent-soft dark:hover:bg-accent-soft text-surface px-5 py-2 rounded-lg transition shadow"
        >
          + Add Interview
        </button>
      </div>

      {!loading && !interviews.length && (
        <div className="p-6 bg-light-soft dark:bg-dark-soft rounded-xl shadow text-center text-light-muted dark:text-dark-muted transition-colors">
          No interviews scheduled.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {interviews.map((i) => (
          <InterviewList
            key={i.id}
            i={i}
            startEdit={startEdit}
            deleteInterview={deleteInterview}
          />
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-primary/60 flex items-center justify-center z-50 px-4">
          <div className="bg-light dark:bg-dark-soft rounded-xl shadow-xl p-6 w-full max-w-2xl transition-colors">
            <h2 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">
              {editingInterview ? "Edit Interview" : "Add New Interview"}
            </h2>

            <InterviewForm
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              saving={saving}
              newInterview={newInterview}
              jobs={jobs}
              editingInterview={editingInterview}
              setShowForm={setShowForm}
              setEditingInterview={setEditingInterview}
            />
          </div>
        </div>
      )}
    </div>
  );
}
