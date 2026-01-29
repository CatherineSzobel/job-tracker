export default function InterviewForm({ handleSubmit, handleChange, saving,newInterview, jobs, editingInterview }) {

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <select
                name="job_id"
                value={newInterview.job_id}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full text-black"
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

            <select
                name="type"
                value={newInterview.type}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
            >
                <option value="">Select Interview Type</option>
                <option value="phone">Phone</option>
                <option value="online">Online</option>
                <option value="onsite">On-site</option>
            </select>

            <input
                type="datetime-local"
                name="interview_date"
                value={newInterview.interview_date}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
            />

            <input
                type="text"
                name="location"
                placeholder="Location"
                value={newInterview.location}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
            />

            <textarea
                name="notes"
                placeholder="Notes"
                value={newInterview.notes}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
            />

            <div className="flex justify-end gap-2 mt-2">
                <button
                    type="button"
                    onClick={() => {
                        setShowForm(false);
                        setEditingInterview(null);
                    }}
                    className="px-4 py-2 rounded border hover:bg-gray-100 transition"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                    {saving
                        ? "Saving..."
                        : editingInterview
                            ? "Update"
                            : "Add"}
                </button>
            </div>
        </form>
    )
}

