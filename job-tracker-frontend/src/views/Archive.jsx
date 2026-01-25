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

    if (loading) return <p className="text-center mt-10">Loading archived jobs...</p>;

    return (
        <div className="max-w-4xl mx-auto mt-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold mb-4">Archive</h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    onClick={() => navigate("/applications")}>
                    Applications
                </button>
            </div>

            {archivedJobs.length === 0 ? (
                <p>No archived jobs yet.</p>
            ) : (
                <div className="flex flex-col gap-4">
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
