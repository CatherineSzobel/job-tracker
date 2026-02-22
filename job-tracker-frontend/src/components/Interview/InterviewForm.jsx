export default function InterviewForm({
    handleSubmit,
    handleChange,
    saving,
    newInterview,
    jobs,
    editingInterview,
    setShowForm,
    setEditingInterview
}) {
    const handleCancel = () => {
        setShowForm(false);
        setEditingInterview(null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Job Select */}
            <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                    Job
                </label>
                <select
                    name="job_id"
                    value={newInterview.job_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-soft text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-colors"
                    required
                    disabled={!!editingInterview}
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
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                        Interview Type
                    </label>
                    <select
                        name="type"
                        value={newInterview.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-soft text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-colors"
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="phone">Phone</option>
                        <option value="online">Online</option>
                        <option value="onsite">On-site</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                        Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        name="interview_date"
                        value={newInterview.interview_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-soft text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-colors"
                        required
                    />
                </div>
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                    Location
                </label>
                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={newInterview.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-soft text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-colors"
                    required
                />
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                    Notes
                </label>
                <textarea
                    name="notes"
                    placeholder="Notes about this interview..."
                    value={newInterview.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-soft text-light-text dark:text-dark-text resize-none focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-colors"
                />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
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