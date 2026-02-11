export default function JobForm({ setShowForm, newJob, setNewJob, saving, handleSubmit, handleChange }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1">
            Company Name
          </label>
          <input
            type="text"
            name="company_name"
            placeholder="Company Name"
            value={newJob.company_name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-light-soft dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1">
            Position
          </label>
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={newJob.position}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-light-soft dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1">
          Location
        </label>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={newJob.location}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-light-soft dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={newJob.priority}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-light-soft dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1">
            Status
          </label>
          <select
            name="status"
            value={newJob.status}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-light-soft dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          placeholder="Notes about this application..."
          value={newJob.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 rounded-lg bg-light-soft dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none resize-none transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-muted dark:text-dark-muted mb-1">
          Job Link
        </label>
        <input
          type="url"
          name="job_link"
          placeholder="https://..."
          value={newJob.job_link}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-light-soft dark:bg-dark-subtle text-light-text dark:text-dark-text focus:ring-2 focus:ring-accent focus:outline-none transition-colors"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-accent hover:bg-accent-soft text-surface dark:text-dark-text py-2 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Add Application"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex-1 bg-light-soft dark:bg-dark-subtle hover:bg-light dark:hover:bg-dark text-light-text dark:text-dark-text py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
