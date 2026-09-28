import { useState, useEffect } from "react";
import API from "../api/axios";
import InterviewForm from "../components/Interview/InterviewForm";
import InterviewList from "../components/Interview/InterviewList";
import PageLoader from "../components/UI/PageLoader";
import Modal from "../components/UI/Modal";
import { EMPTY_INTERVIEW } from "../constants/jobs";

export default function Interviews() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newInterview, setNewInterview] = useState(EMPTY_INTERVIEW);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, interviewsRes] = await Promise.all([
          API.get("/job-applications"),
          API.get("/interviews"),
        ]);
        setJobs(jobsRes.data.data);
        setInterviews(interviewsRes.data.data);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setInterviews((prev) =>
          prev.map((i) => (i.id === editingInterview.id ? { ...i, ...res.data.data } : i))
        );
      } else {
        const res = await API.post(
          `/job-applications/${newInterview.job_id}/interviews`,
          payload
        );
        // Same shape as GET /interviews, which eager-loads `job`
        const job = jobs.find((j) => j.id === Number(newInterview.job_id));
        const newInt = {
          ...res.data.data,
          job: job && { id: job.id, company_name: job.company_name, position: job.position },
        };
        setInterviews((prev) => [newInt, ...prev]);
      }

      // Reset form & editing state
      resetForm();
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
      job_id: interview.job_application_id,
      type: interview.type || "",
      interview_date: formatForInput(interview.interview_date),
      location: interview.location || "",
      notes: interview.notes || "",
    });
    setShowForm(true);
  };

  const formatForInput = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const resetForm = () => {
    setNewInterview(EMPTY_INTERVIEW);
    setEditingInterview(null);
    setShowForm(false);
  };

  if (loading) {
    return <PageLoader text="Loading interviews..." />;
  }

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
          Interviews Schedule ({interviews.length})
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
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

      {/* Interviews Grid */}
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

      {/* Modal Form */}
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
    </div>
  );
}