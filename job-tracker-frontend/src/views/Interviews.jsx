// src/views/Interviews.jsx
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

  const [newInterview, setNewInterview] = useState({
    job_id: "",
    type: "",
    interview_date: "",
    location: "",
    notes: "",
  });

  // Fetch jobs and associated interviews
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

  // Handle form input changes
  const handleChange = (e) => {
    setNewInterview({ ...newInterview, [e.target.name]: e.target.value });
  };

  // Format date for Laravel DB
  const formatDateForLaravel = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:00`;
  };

  // Submit form (create or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        type: newInterview.type || "online", // default to online
        interview_date: formatDateForLaravel(newInterview.interview_date),
        location: newInterview.location,
        notes: newInterview.notes || "",
      };

      let res;
      if (editingInterview) {
        // Update existing
        res = await API.put(`/interviews/${editingInterview.id}`, payload);

        setInterviews((prev) =>
          prev.map((i) =>
            i.id === editingInterview.id ? { ...i, ...res.data } : i
          )
        );
      } else {
        // Create new
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

  // Delete interview
  const deleteInterview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview?"))
      return;

    try {
      await API.delete(`/interviews/${id}`);
      setInterviews((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete interview.");
    }
  };

  // Start editing an interview
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


  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Interviews Schedule ({interviews.length})
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add Interview
        </button>
      </div>

      {loading && <p className="text-center mt-10">Loading...</p>}
      {!loading && !interviews.length && (
        <p className="text-center mt-10">No interviews scheduled.</p>
      )}

      <div className="flex flex-col gap-4">
        {interviews.map((i) => (
          <InterviewList
            key={i.id}
            i={i}
            startEdit={startEdit}
            deleteInterview={deleteInterview}></InterviewList>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingInterview ? "Edit Interview" : "Add New Interview"}
            </h2>
            <InterviewForm 
            handleSubmit={handleSubmit} 
            handleChange={handleChange} 
            newInterview={newInterview} 
            jobs={jobs} 
            editingInterview={editingInterview}></InterviewForm>
          </div>
        </div>
      )}
    </div>
  );
}
