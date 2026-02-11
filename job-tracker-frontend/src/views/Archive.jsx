import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import ArchivedJobCard from "../components/JobApplications/ArchivedJobCard";

export default function Archive() {
    const navigate = useNavigate();
    const [archivedJobs, setArchivedJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/job-applications", { params: { archived: true } })
            .then(res => {
                setArchivedJobs(res.data);
            })
            .catch(err => {
                console.error(err);
                alert("Failed to load archived jobs");
            })
            .finally(() => setLoading(false));
    }, []);

    // Callback to remove restored jobs from the list
    const handleRestore = (restoredJobId) => {
        setArchivedJobs(prev => prev.filter(job => job.id !== restoredJobId));
    };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-accent rounded-full animate-spin"></div>
        <p className="ml-2 text-gray-600">Loading...</p>
      </div>
    );
  }

    return (
        <div className="max-w-6xl mx-auto mt-10 px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-primary">Archive</h1>
                <button
                    className="bg-primary-soft hover:bg-primary text-surface px-5 py-2 rounded-lg hover:bg-accent-hover transition shadow"
                    onClick={() => navigate("/applications")}
                >
                    Applications
                </button>
            </div>

            {/* Empty state */}
            {archivedJobs.length === 0 ? (
                <div className="p-6 bg-surface border border-border rounded-xl shadow text-center text-secondary-text">
                    No archived jobs yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedJobs.map(job => (
                        <ArchivedJobCard
                            key={job.id}
                            job={job}
                            onRestore={handleRestore} // passes callback to ArchivedJobCard
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
