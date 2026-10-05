import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import ArchivedJobCard from "../components/JobApplications/ArchivedJobCard";
import BatchBar from "../components/JobApplications/BatchBar";
import { batchUpdateJobs, mergeBatchResult, tagIdsOf } from "../components/JobApplications/batchUpdate";
import useSelection from "../components/JobApplications/useSelection";
import useTags from "../components/Tags/useTags";
import PageLoader from "../components/UI/PageLoader";
import { useToastStore } from "../stores/useToastStore";

const SELECT_BUTTON_CLASSES = "px-4 py-2 rounded-lg border border-light-muted dark:border-dark-subtle text-light-text dark:text-dark-text hover:bg-light-soft dark:hover:bg-dark-subtle transition-colors";

export default function Archive() {
    const navigate = useNavigate();
    const [archivedJobs, setArchivedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [batchBusy, setBatchBusy] = useState(false);
    const { tags, createTag } = useTags();
    const { selecting, startSelecting, exitSelecting, selectedIds, toggleSelected, selectMany } = useSelection();
    const showToast = useToastStore((state) => state.showToast);

    useEffect(() => {
        API.get("/job-applications", { params: { archived: true } })
            .then((res) => setArchivedJobs(res.data.data))
            .catch((err) => {
                console.error(err);
                showToast("Failed to load archived jobs");
            })
            .finally(() => setLoading(false));
    }, [showToast]);

    // Callback to remove a restored job from the list
    const handleRestore = (restoredJobId) => {
        setArchivedJobs((currentJobs) => currentJobs.filter((job) => job.id !== restoredJobId));
    };

    // The selection stays after tag changes; restored cards leave the list, so restoring ends select mode
    const applyBatch = async (changes) => {
        setBatchBusy(true);
        try {
            const updatedJobs = await batchUpdateJobs(selectedIds, changes);
            setArchivedJobs((currentJobs) => mergeBatchResult(currentJobs, updatedJobs, true));
            if ("is_archived" in changes) exitSelecting();
        } catch (err) {
            console.error(err);
            showToast(err.response?.data?.message || "Failed to update the selected applications");
        } finally {
            setBatchBusy(false);
        }
    };

    if (loading) {
        return <PageLoader text="Loading archives..." />;
    }

    return (
        <div className={`max-w-6xl mx-auto mt-4 sm:mt-10 sm:px-4 transition-colors ${selecting ? "pb-28" : ""}`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-light-text dark:text-dark-text">Archive</h1>
                <div className="flex flex-wrap gap-2">
                    {archivedJobs.length > 0 && (selecting ? (
                        <>
                            <button className={SELECT_BUTTON_CLASSES} onClick={() => selectMany(archivedJobs.map((job) => job.id))}>
                                Select all ({archivedJobs.length})
                            </button>
                            <button className={SELECT_BUTTON_CLASSES} onClick={exitSelecting}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button className={SELECT_BUTTON_CLASSES} onClick={startSelecting}>
                            Select
                        </button>
                    ))}
                    <button
                        className="bg-accent hover:bg-accent-soft dark:bg-accent dark:hover:bg-accent-soft text-surface px-5 py-2 rounded-lg transition shadow"
                        onClick={() => navigate("/applications")}
                    >
                        Applications
                    </button>
                </div>
            </div>

            {/* Empty state */}
            {archivedJobs.length === 0 ? (
                <div className="p-6 bg-light-soft dark:bg-dark-soft rounded-xl shadow text-center text-light-muted dark:text-dark-muted transition-colors">
                    No archived jobs yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {archivedJobs.map((job) => (
                        <ArchivedJobCard
                            key={job.id}
                            job={job}
                            onRestore={handleRestore}
                            selecting={selecting}
                            selected={selectedIds.includes(job.id)}
                            onToggleSelect={toggleSelected}
                        />
                    ))}
                </div>
            )}

            {selecting && selectedIds.length > 0 && (
                <BatchBar
                    count={selectedIds.length}
                    actions={["restore", "tags"]}
                    tags={tags}
                    removableTagIds={tagIdsOf(archivedJobs.filter((job) => selectedIds.includes(job.id)))}
                    onApply={applyBatch}
                    onCreateTag={createTag}
                    onCancel={exitSelecting}
                    busy={batchBusy}
                />
            )}
        </div>
    );
}
