export default function JobForm({ setShowForm, newJob, setNewJob, saving, handleSubmit, handleChange }) {
    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
                type="text"
                name="position"
                placeholder="Position"
                value={newJob.position}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
            />
            <input
                type="text"
                name="company_name"
                placeholder="Company Name"
                value={newJob.company_name}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
            />
            <input
                type="text"
                name="location"
                placeholder="Location"
                value={newJob.location}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
                required
            />
            <select
                name="status"
                value={newJob.status}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
            >
                <option value="applied">Applied</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
            </select>
            <select
                name="priority"
                value={newJob.priority}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
            >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>
            <input
                type="text"
                name="notes"
                placeholder="Notes"
                value={newJob.notes}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
            />
            <input
                type="text"
                name="job_link"
                placeholder="Job Link"
                value={newJob.job_link}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
            />
            <div className="flex justify-end gap-2 mt-2">
                <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded border hover:bg-gray-100 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                    {saving ? "Saving..." : "Add"}
                </button>
            </div>
        </form>
    )
}

