import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import ArchivedJobCard from "../components/JobApplications/ArchivedJobCard";
import BatchBar from "../components/JobApplications/BatchBar";
import { batchUpdateJobs, saveJobChanges } from "../components/JobApplications/batchUpdate";
import useBatchChanges from "../components/JobApplications/useBatchChanges";
import useSendBatch from "../components/JobApplications/useSendBatch";
import useSelection from "../components/UI/useSelection";
import useTags from "../components/Tags/useTags";
import ListPageHeader from "../components/UI/ListPageHeader";
import PageLoader from "../components/UI/PageLoader";
import SelectModeButtons from "../components/UI/SelectModeButtons";
import { useToastStore } from "../stores/useToastStore";

export default function Archive() {
    const navigate = useNavigate();
    const [archivedJobs, setArchivedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { tags, createTag } = useTags();
    // Unsaved tag changes, per application; leaving select mode (any way) drops them
    const batchChanges = useBatchChanges();
    const { selecting, startSelecting, exitSelecting, selectedIds, toggleSelected, selectMany, clearSelection } = useSelection({ onExit: batchChanges.clear });
    const { sendBatch, busy: batchBusy } = useSendBatch({ setJobs: setArchivedJobs, listShowsArchived: true, onDone: exitSelecting });
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

    const selectedJobs = archivedJobs.filter((job) => selectedIds.includes(job.id));
    const saveBatchChanges = () => sendBatch(() => saveJobChanges(batchChanges.toRequest()));
    // The bar's Restore
    const applyBatch = (changes) => sendBatch(() => batchUpdateJobs(selectedIds, changes));

    if (loading) {
        return <PageLoader text="Loading archives..." />;
    }

    return (
        <div className={`max-w-6xl mx-auto mt-4 sm:mt-10 sm:px-4 transition-colors ${selecting ? "pb-28" : ""}`}>
            <ListPageHeader
                title="Archive"
                count={archivedJobs.length}
                actions={
                    <>
                        {archivedJobs.length > 0 && (
                            <SelectModeButtons
                                selecting={selecting}
                                visibleCount={archivedJobs.length}
                                onStart={startSelecting}
                                onSelectAll={() => selectMany(archivedJobs.map((job) => job.id))}
                                onCancel={exitSelecting}
                            />
                        )}
                        <button type="button" className="btn-primary shadow" onClick={() => navigate("/applications")}>
                            Applications
                        </button>
                    </>
                }
            />

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
                            pendingChanges={batchChanges.forJob(job.id)}
                        />
                    ))}
                </div>
            )}

            {/* Stays open with nothing selected while changes wait, so Save is still there */}
            {selecting && (selectedIds.length > 0 || batchChanges.hasChanges) && (
                <BatchBar
                    selectedJobs={selectedJobs}
                    actions={["restore", "tags"]}
                    tags={tags}
                    changes={batchChanges}
                    onSave={saveBatchChanges}
                    onApply={applyBatch}
                    onClearSelection={clearSelection}
                    onCreateTag={createTag}
                    onCancel={exitSelecting}
                    busy={batchBusy}
                />
            )}
        </div>
    );
}
