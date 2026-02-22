export default function JobForm({ setShowForm, newJob, setNewJob, saving, handleSubmit, handleChange }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="company_name"
            placeholder="Company Name"
            value={newJob.company_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Position
          </label>
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={newJob.position}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location
        </label>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={newJob.location}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={newJob.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            name="status"
            value={newJob.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          placeholder="Notes about this application..."
          value={newJob.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none resize-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Job Link
        </label>
        <input
          type="url"
          name="job_link"
          placeholder="https://..."
          value={newJob.job_link}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-subtle rounded-lg bg-light dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
        />
      </div>

      <div className="flex gap-3 pt-4 justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-accent hover:bg-accent-soft text-white dark:text-dark-text py-2 px-6 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : newJob.id ? "Update Application" : "Add Application"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="bg-gray-200 dark:bg-dark-subtle hover:bg-gray-300 dark:hover:bg-dark-subtle/80 text-gray-700 dark:text-dark-muted py-2 px-6 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}