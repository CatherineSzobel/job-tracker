import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import JobCard from "../components/JobApplications/JobCard";
import JobForm from "../components/JobApplications/JobForm";

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
      .then(res => setJobs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  // Submit new job
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

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const filteredJobs = jobs.filter(job => {
    const statusMatch =
      statusFilter === "all" || job.status === statusFilter;

    const priorityMatch =
      priorityFilter === "all" || job.priority === priorityFilter;

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
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const res = await API.get("/job-applications");
      setJobs(res.data);
      alert("Import successful");

    } catch (err) {
      if (err.response) {
        console.error("Import failed", err.response.data);
        alert("Import failed: " + (err.response.data.message || JSON.stringify(err.response.data)));
      } else {
        console.error("Import failed", err); alert("Failed to import jobs");
      }

    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* HEADER */}
      <div className="rounded-2xl p-6 mb-6 bg-surface shadow-md border border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            Job Applications
            <span className="ml-2 text-sm text-muted">
              ({jobs.length})
            </span>
          </h1>

          <div className="flex items-center gap-2 relative" ref={dropdownRef}>
            <button className="px-4 py-2 rounded-md text-sm bg-blue-400 hover:bg-blue-600 text-white font-semibold transition" onClick={() => setShowForm(true)}>
              + Add
            </button>

            {/* Dropdown */}
            <button
              onClick={() => setShowMenu((s) => !s)}
              className="w-9 h-9 flex items-center justify-center font-extrabold hover:border rounded-lg text-blue-400 transition"
            >
              ⋮
            </button>

            {showMenu && (
              <div className="absolute right-0 top-11 w-40 rounded-lg shadow-lg border overflow-hidden z-50 bg-surface border-border text-primary">
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-300" onClick={() => navigate("/archives")}>
                  Archives
                </button>
                <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-300" onClick={exportJobs}>
                  Export Excel
                </button>
                <button className="w-full text-left px-4 py-2 text-sm  disabled:opacity-50 hover:bg-gray-300" onClick={() => fileInputRef.current.click()} disabled={importing}>
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
            <label className="block mb-1">Status</label>
            <select className="border rounded-lg px-3 py-1 text-secondary-text border-secondary-muted" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="applied">Applied</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 ">Priority</label>
            <select className="border rounded-lg px-3 py-1 text-secondary-text border-secondary-muted" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
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
        <p className="text-center text-muted">No applications found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onArchive={(id) => setJobs((prev) => prev.filter((j) => j.id !== id))} />
          ))}
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-primary/60">
          <div className="bg-surface rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-lg font-semibold mb-4 text-primary">Add Job Application</h2>
            <JobForm setShowForm={setShowForm} newJob={newJob} setNewJob={setNewJob} saving={saving} handleSubmit={handleSubmit} handleChange={handleChange} />
          </div>
        </div>
      )}
    </div>
  );
}
