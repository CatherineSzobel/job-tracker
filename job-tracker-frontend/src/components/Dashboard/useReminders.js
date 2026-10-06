import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useToastStore } from "../../stores/useToastStore";

const showToast = (message) => useToastStore.getState().showToast(message);
const byDaysSinceUpdate = (first, second) => second.days_since_update - first.days_since_update;

// The applications to follow up from GET /api/reminders (its due to-dos are shown by Quick to-dos
// and Coming up instead), plus Dismiss. Dismiss is optimistic: the row disappears at once and comes
// back (with a toast) if the request fails.
export default function useReminders() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  // "today" or "permanent", for the Dismiss button's tooltip (null until the settings are loaded)
  const dismissMode = useSettingsStore((state) => state.settings?.reminder_dismiss_mode ?? null);

  useEffect(() => {
    API.get("/reminders")
      .then((res) => setApplications(res.data.data.applications))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
    loadSettings().catch((err) => console.error(err));
  }, [loadSettings]);

  const dismiss = async (job) => {
    setApplications((currentJobs) => currentJobs.filter((existing) => existing.id !== job.id));
    try {
      await API.post(`/job-applications/${job.id}/dismiss-reminder`);
    } catch (err) {
      console.error(err);
      setApplications((currentJobs) => [...currentJobs, job].sort(byDaysSinceUpdate));
      showToast("Failed to dismiss the reminder");
    }
  };

  return { applications, loading, dismissMode, dismiss };
}
