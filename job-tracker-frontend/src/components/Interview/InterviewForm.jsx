export default function InterviewForm({
    handleSubmit,
    handleChange,
    saving,
    newInterview,
    jobs,
    editingInterview,
    setShowForm
}) {
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job
                </label>
                <select
                    name="job_id"
                    value={newInterview.job_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interview Type
                    </label>
                    <select
                        name="type"
                        value={newInterview.type}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                    >
                        <option value="">Select Interview Type</option>
                        <option value="phone">Phone</option>
                        <option value="online">Online</option>
                        <option value="onsite">On-site</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        name="interview_date"
                        value={newInterview.interview_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                </label>
                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={newInterview.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                </label>
                <textarea
                    name="notes"
                    placeholder="Notes about this interview..."
                    value={newInterview.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                    {saving ? "Saving..." : editingInterview ? "Update Interview" : "Add Interview"}
                </button>

                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
