import { JOB_STATUSES, PRIORITIES } from "../../constants/jobs";

export default function JobForm({ setShowForm, newJob, saving, handleSubmit, handleChange }) {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="job-company" className="input-label">
            Company
          </label>
          <input
            id="job-company"
            type="text"
            name="company_name"
            value={newJob.company_name}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="job-position" className="input-label">
            Position
          </label>
          <input
            id="job-position"
            type="text"
            name="position"
            value={newJob.position}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="job-location" className="input-label">
          Location
        </label>
        <input
          id="job-location"
          type="text"
          name="location"
          placeholder="e.g. Amsterdam, or Remote"
          value={newJob.location}
          onChange={handleChange}
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="job-status" className="input-label">
            Status
          </label>
          <select id="job-status" name="status" value={newJob.status} onChange={handleChange} className="input-field">
            {JOB_STATUSES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="job-priority" className="input-label">
            Priority
          </label>
          <select id="job-priority" name="priority" value={newJob.priority} onChange={handleChange} className="input-field">
            {PRIORITIES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="job-link" className="input-label">
          Link to the posting <span className="font-normal text-muted">(optional)</span>
        </label>
        <input
          id="job-link"
          type="url"
          name="job_link"
          placeholder="https://…"
          value={newJob.job_link}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="job-notes" className="input-label">
          Notes <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="job-notes"
          name="notes"
          value={newJob.notes}
          onChange={handleChange}
          rows={4}
          className="input-field resize-y"
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Add application"}
        </button>
      </div>
    </form>
  );
}
