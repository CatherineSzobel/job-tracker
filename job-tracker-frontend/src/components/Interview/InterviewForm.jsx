import { INTERVIEW_TYPES } from "../../constants/jobs";

// lockJob: the job can't be changed (editing an interview, or adding one from a job's own page)
export default function InterviewForm({
    handleSubmit,
    handleChange,
    saving,
    newInterview,
    jobs,
    editingInterview,
    lockJob = false,
    onCancel,
}) {
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label htmlFor="interview-job" className="input-label">
                    Application
                </label>
                <select
                    id="interview-job"
                    name="job_id"
                    value={newInterview.job_id}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled={!!editingInterview || lockJob}
                >
                    <option value="">Choose an application</option>
                    {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                            {job.company_name} · {job.position}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="interview-type" className="input-label">
                        Type
                    </label>
                    <select id="interview-type" name="type" value={newInterview.type} onChange={handleChange} className="input-field" required>
                        <option value="">Choose a type</option>
                        {INTERVIEW_TYPES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="interview-date" className="input-label">
                        Date and time
                    </label>
                    <input
                        id="interview-date"
                        type="datetime-local"
                        name="interview_date"
                        value={newInterview.interview_date}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="interview-location" className="input-label">
                    Location
                </label>
                <input
                    id="interview-location"
                    type="text"
                    name="location"
                    placeholder="An address, or e.g. Video call"
                    value={newInterview.location}
                    onChange={handleChange}
                    className="input-field"
                    required
                />
            </div>

            <div>
                <label htmlFor="interview-notes" className="input-label">
                    Prep notes <span className="font-normal text-muted">(optional)</span>
                </label>
                <textarea
                    id="interview-notes"
                    name="notes"
                    placeholder="What to prepare, what to remember…"
                    value={newInterview.notes}
                    onChange={handleChange}
                    rows={4}
                    className="input-field resize-y"
                />
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button type="button" onClick={onCancel} className="btn-secondary">
                    Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                    {saving ? "Saving…" : editingInterview ? "Save changes" : "Add interview"}
                </button>
            </div>
        </form>
    );
}
