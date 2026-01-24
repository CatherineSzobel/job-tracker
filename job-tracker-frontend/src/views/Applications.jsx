// src/views/Applications.jsx
import { useState, useEffect } from "react";
import JobCard from "../components/JobApplications/JobCard";
import API from "../api/axios";
import JobForm from "../components/JobApplications/JobForm";

export default function Applications() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newJob, setNewJob] = useState({
    position: "",
    company_name: "",
    status: "applied",
    priority: "medium",
    applied_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");


  // Fetch jobs
  useEffect(() => {
    API.get("/job-applications")
      .then(res => setJobs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  // Submit new job
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await API.post("/job-applications", newJob);
      setJobs([res.data.data, ...jobs]); // prepend new job
      setShowForm(false);
      setNewJob({
        position: "",
        company_name: "",
        status: "applied",
        priority: "medium",
        applied_date: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add job application");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const filteredJobs = jobs.filter(job => {
    const statusMatch =
      statusFilter === "all" || job.status === statusFilter;

    const priorityMatch =
      priorityFilter === "all" || job.priority === priorityFilter;

    return statusMatch && priorityMatch;
  });

  return (
    <div className="max-w-4xl mx-auto mt-10 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Job Applications ({jobs.length})</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Add Application
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Job Application</h2>
            <JobForm setShowForm={setShowForm} newJob={newJob} setNewJob={setNewJob} saving={saving} handleSubmit={handleSubmit} handleChange={handleChange} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="font-medium">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All</option>
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <label className="font-medium">Priority:</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>


      {/* Job Cards */}
      {filteredJobs.length === 0 ? (
        <p className="text-center text-gray-500">
          No job applications found.
        </p>
      ) : (
        filteredJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))
      )}

    </div>
  );
}
