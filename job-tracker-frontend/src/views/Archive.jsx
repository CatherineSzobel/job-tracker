import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../api/axios";
import ArchivedJobCard from "../components/JobApplications/ArchivedJobCard";
import BatchBar from "../components/JobApplications/BatchBar";
import { batchUpdateJobs, saveJobChanges } from "../components/JobApplications/batchUpdate";
import useBatchChanges from "../components/JobApplications/useBatchChanges";
import useSendBatch from "../components/JobApplications/useSendBatch";
import useSelection from "../components/UI/useSelection";
import useTags from "../components/Tags/useTags";
import PageHeader from "../components/UI/PageHeader";
import PageLoader from "../components/UI/PageLoader";
import SelectModeButtons from "../components/UI/SelectModeButtons";
import { useToastStore } from "../stores/useToastStore";

export default function Archive() {
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

    // Drops a restored or deleted job from the list
    const removeJob = (removedJobId) => {
        setArchivedJobs((currentJobs) => currentJobs.filter((job) => job.id !== removedJobId));
    };

    const selectedJobs = archivedJobs.filter((job) => selectedIds.includes(job.id));
    const saveBatchChanges = () => sendBatch(() => saveJobChanges(batchChanges.toRequest()));
    // The bar's Restore
    const applyBatch = (changes) => sendBatch(() => batchUpdateJobs(selectedIds, changes));

    if (loading) {
        return <PageLoader text="Loading the archive..." />;
    }

    return (
        <div className={`flex flex-col gap-6 ${selecting ? "pb-32" : ""}`}>
            <PageHeader
                title="Archive"
                description="Applications you've closed. Restore one to bring it back to your list."
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
                        <Link to="/applications" className="btn-secondary">
                            <ArrowLeft size={16} aria-hidden="true" />
                            Applications
                        </Link>
                    </>
                }
            />

            {archivedJobs.length === 0 ? (
                <p className="text-muted">Nothing archived yet. Archive an application from its card or page when you're done with it.</p>
            ) : (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
                    {archivedJobs.map((job) => (
                        <ArchivedJobCard
                            key={job.id}
                            job={job}
                            onRemove={removeJob}
                            selecting={selecting}
                            selected={selectedIds.includes(job.id)}
                            onToggleSelect={toggleSelected}
                            pendingChanges={batchChanges.forJob(job.id)}
                        />
                    ))}
                </ul>
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
