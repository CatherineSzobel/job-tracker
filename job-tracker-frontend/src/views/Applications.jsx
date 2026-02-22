import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import JobCard from "../components/JobApplications/JobCard";
import JobForm from "../components/JobApplications/JobForm";
import PageLoader from "../components/UI/PageLoader";

export default function Applications() {
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [newJob, setNewJob] = useState({
    position: "",
    company_name: "",
    location: "",
    status: "applied",
    priority: "medium",
    notes: "",
    job_link: "",
  });

  // Fetch jobs
  useEffect(() => {
    API.get("/job-applications")
      .then((res) => setJobs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.post("/job-applications", newJob);
      setJobs([res.data.data, ...jobs]);
      setShowForm(false);
      setNewJob({
        position: "",
        company_name: "",
        location: "",
        status: "applied",
        priority: "medium",
        notes: "",
        job_link: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to add job application");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <PageLoader text="Loading Applications..."/>
  }

  const filteredJobs = jobs.filter((job) => {
    const statusMatch = statusFilter === "all" || job.status === statusFilter;
    const priorityMatch = priorityFilter === "all" || job.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const exportJobs = async () => {
    try {
      const res = await API.get("/job-applications/export", {
        responseType: "blob",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "job-applications.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed", err);
    }
  };

  const importJobs = async (file) => {
    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post("/job-applications/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const res = await API.get("/job-applications");
      setJobs(res.data);
      alert("Import successful");
    } catch (err) {
      console.error("Import failed", err.response || err);
      alert(
        "Import failed: " +
        (err.response?.data?.message || JSON.stringify(err.response?.data) || err.message)
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* HEADER */}
      <div className="rounded-2xl p-6 mb-6 bg-surface dark:bg-dark-soft shadow-md border border-border dark:border-dark-subtle transition-colors">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-light-text dark:text-dark-text">
            Job Applications
            <span className="ml-2 text-sm text-muted dark:text-dark-muted">
              ({jobs.length})
            </span>
          </h1>

          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            <button
              className="px-4 py-2 rounded-md text-sm bg-accent-soft hover:bg-accent text-surface font-semibold transition-colors"
              onClick={() => setShowForm(true)}
            >
              + Add
            </button>

            {/* Dropdown */}
            <button
              onClick={() => setShowMenu((s) => !s)}
              className="w-9 h-9 flex items-center justify-center font-extrabold hover:border rounded-lg text-blue-400 dark:text-blue-300 transition-colors"
            >
              ⋮
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 w-40 rounded-lg shadow-lg border overflow-hidden z-50 bg-surface dark:bg-dark-soft border-border dark:border-dark-subtle text-primary dark:text-dark-text transition-colors">
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors"
                  onClick={() => navigate("/archives")}
                >
                  Archives
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors"
                  onClick={exportJobs}
                >
                  Export Excel
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm disabled:opacity-50 hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors"
                  onClick={() => fileInputRef.current.click()}
                  disabled={importing}
                >
                  {importing ? "Importing…" : "Import Excel"}
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                if (e.target.files.length > 0) {
                  importJobs(e.target.files[0]);
                  e.target.value = null;
                }
              }}
            />
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="rounded-xl p-4 mb-6 flex gap-6 text-sm">
          <div>
            <label className="block mb-1 text-light-text dark:text-dark-text">Status</label>
            <select
              className="border rounded-lg px-3 py-1 text-light-text dark:text-dark-text border-secondary-muted dark:border-dark-subtle bg-surface dark:bg-dark-soft transition-colors"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-light-text dark:text-dark-text">Priority</label>
            <select
              className="border rounded-lg px-3 py-1 text-light-text dark:text-dark-text border-secondary-muted dark:border-dark-subtle bg-surface dark:bg-dark-soft transition-colors"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* JOB LIST */}
      {filteredJobs.length === 0 ? (
        <p className="text-center text-muted dark:text-dark-muted">No applications found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onArchive={(id) => setJobs((prev) => prev.filter((j) => j.id !== id))}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 px-4">
          <div className="bg-surface dark:bg-dark-soft rounded-xl shadow-xl p-6 w-full max-w-2xl transition-colors">
            <h2 className="text-lg font-semibold mb-4 text-light-text dark:text-dark-text">
              {newJob.id ? "Edit Job Application" : "Add Job Application"}
            </h2>
            <JobForm
              setShowForm={setShowForm}
              newJob={newJob}
              setNewJob={setNewJob}
              saving={saving}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}
