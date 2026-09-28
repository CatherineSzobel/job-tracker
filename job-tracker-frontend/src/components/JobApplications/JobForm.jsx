import { JOB_STATUSES, PRIORITIES } from "../../constants/jobs";

export default function JobForm({ setShowForm, newJob, saving, handleSubmit, handleChange }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="input-label">
            Company Name
          </label>
          <input
            type="text"
            name="company_name"
            placeholder="Company Name"
            value={newJob.company_name}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="input-label">
            Position
          </label>
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={newJob.position}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="input-label">
          Location
        </label>
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={newJob.location}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="input-label">
            Priority
          </label>
          <select
            name="priority"
            value={newJob.priority}
            onChange={handleChange}
            className="input-field"
          >
            {PRIORITIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="input-label">
            Status
          </label>
          <select
            name="status"
            value={newJob.status}
            onChange={handleChange}
            className="input-field"
          >
            {JOB_STATUSES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="input-label">
          Notes
        </label>
        <textarea
          name="notes"
          placeholder="Notes about this application..."
          value={newJob.notes}
          onChange={handleChange}
          rows={4}
          className="input-field resize-none"
        />
      </div>

      <div>
        <label className="input-label">
          Job Link
        </label>
        <input
          type="url"
          name="job_link"
          placeholder="https://..."
          value={newJob.job_link}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <div className="flex gap-3 pt-4 justify-end">
        <button
          type="submit"
          disabled={saving}
          className="bg-accent hover:bg-accent-soft text-white dark:text-dark-text py-2 px-6 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Add Application"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="bg-border dark:bg-dark-subtle hover:bg-light-muted/25 dark:hover:bg-dark-subtle/80 text-light-text dark:text-dark-muted py-2 px-6 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}