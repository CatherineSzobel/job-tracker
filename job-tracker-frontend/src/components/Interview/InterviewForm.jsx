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
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Select */}
            <div>
                <label className="input-label">
                    Job
                </label>
                <select
                    name="job_id"
                    value={newInterview.job_id}
                    onChange={handleChange}
                    className="input-field"
                    required
                    disabled={!!editingInterview || lockJob}
                >
                    <option value="">Select Job</option>
                    {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                            {job.company_name} - {job.position}
                        </option>
                    ))}
                </select>
            </div>

            {/* Type & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="input-label">
                        Interview Type
                    </label>
                    <select
                        name="type"
                        value={newInterview.type}
                        onChange={handleChange}
                        className="input-field"
                        required
                    >
                        <option value="">Select Type</option>
                        {INTERVIEW_TYPES.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="input-label">
                        Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        name="interview_date"
                        value={newInterview.interview_date}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                </div>
            </div>

            {/* Location */}
            <div>
                <label className="input-label">
                    Location
                </label>
                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={newInterview.location}
                    onChange={handleChange}
                    className="input-field"
                    required
                />
            </div>

            {/* Notes */}
            <div>
                <label className="input-label">
                    Notes
                </label>
                <textarea
                    name="notes"
                    placeholder="Notes about this interview..."
                    value={newInterview.notes}
                    onChange={handleChange}
                    rows={4}
                    className="input-field resize-none"
                />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 rounded-lg bg-border dark:bg-dark-subtle text-light-text dark:text-dark-text hover:bg-light-muted/25 dark:hover:bg-dark-subtle/80 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 rounded-lg bg-accent dark:bg-accent text-white hover:bg-accent-soft dark:hover:bg-accent-soft transition"
                >
                    {saving ? "Saving..." : editingInterview ? "Update Interview" : "Add Interview"}
                </button>
            </div>
        </form>
    );
}