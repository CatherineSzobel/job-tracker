import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import API from "../api/axios";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeStore } from "../stores/useThemeStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { DEFAULT_GOALS } from "../constants/jobs";
import { ARCHIVE_TODOS_OPTIONS } from "../constants/todos";
import { REMINDER_DAYS_MAX, REMINDER_DAYS_MIN, REMINDER_DISMISS_OPTIONS } from "../constants/reminders";

export default function Settings() {
  const navigate = useNavigate();

  // Account & security
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [emailForm, setEmailForm] = useState({ email: "", current_password: "" });
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Goals
  const user = useAuthStore((state) => state.user);
  const [goalsForm, setGoalsForm] = useState({
    daily_goal: user?.daily_goal ?? DEFAULT_GOALS.daily_goal,
    weekly_goal: user?.weekly_goal ?? DEFAULT_GOALS.weekly_goal,
  });
  const [goalsError, setGoalsError] = useState("");
  const [goalsSuccess, setGoalsSuccess] = useState("");
  const [savingGoals, setSavingGoals] = useState(false);

  // To-dos and Reminders: each control saves as soon as it changes
  const settings = useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const [archiveTodosError, setArchiveTodosError] = useState("");
  const [reminderError, setReminderError] = useState("");
  // While the number field is being edited; saved on blur
  const [reminderDaysDraft, setReminderDaysDraft] = useState(null);

  useEffect(() => {
    loadSettings().catch((err) => {
      console.error(err);
      // Otherwise the options stay disabled with no explanation
      setArchiveTodosError("Couldn't load this setting. Please refresh the page.");
    });
  }, [loadSettings]);

  // The store shows the change at once and undoes it on failure; setError is the section's error setter
  const saveSettings = async (changes, setError) => {
    setError("");
    try {
      await updateSettings(changes);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Couldn't save. Please try again.");
    }
  };

  // An emptied or unchanged field just goes back to the saved number, without an error
  const saveReminderDays = () => {
    const draft = reminderDaysDraft;
    setReminderDaysDraft(null);
    if (draft === null || draft.trim() === "") return;
    const days = Number(draft);
    if (!Number.isInteger(days) || days === settings.reminder_days) return;
    saveSettings({ reminder_days: days }, setReminderError);
  };

  // Appearance
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);

  // Danger zone
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Each input's name is the form field it fills
  const changeEmailForm = (event) =>
    setEmailForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submitEmailChange = async (event) => {
    event.preventDefault();
    setEmailError("");
    setEmailSuccess("");
    setSavingEmail(true);
    try {
      const res = await API.put("/account/email", emailForm);
      // Everything that shows the email (e.g. the reminders line below) reads it from the stored user
      useAuthStore.setState({ user: res.data.data });
      setEmailSuccess("Email updated.");
      setEmailForm({ email: "", current_password: "" });
    } catch (err) {
      setEmailError(err.response?.data?.message || "Failed to update email");
    } finally {
      setSavingEmail(false);
    }
  };

  // Each input's name is the form field it fills
  const changePasswordForm = (event) =>
    setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setSavingPassword(true);
    try {
      await API.put("/account/password", passwordForm);
      setPasswordSuccess("Password updated successfully.");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  const submitGoals = async (e) => {
    e.preventDefault();
    setGoalsError("");
    setGoalsSuccess("");
    setSavingGoals(true);
    try {
      const res = await API.put("/account/goals", {
        daily_goal: Number(goalsForm.daily_goal),
        weekly_goal: Number(goalsForm.weekly_goal),
      });
      // The dashboard reads the goals from the stored user
      useAuthStore.setState({ user: res.data.data });
      setGoalsSuccess("Goals updated.");
    } catch (err) {
      setGoalsError(err.response?.data?.message || "Failed to update goals");
    } finally {
      setSavingGoals(false);
    }
  };

  const submitDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError("");
    setDeleting(true);
    try {
      await API.delete("/account", { data: { password: deletePassword } });
      useAuthStore.setState({ user: null, isAuthenticated: false });
      navigate("/login");
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-4 sm:mt-10 sm:px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Settings</h1>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          Manage your account, goals, appearance, and account deletion.
        </p>
      </div>

      {/* Account & security */}
      <section className="bg-light dark:bg-dark-soft rounded-2xl shadow-md border border-border dark:border-dark-subtle p-6 space-y-4 transition-colors">
        <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">
          Account &amp; security
        </h2>

        {/* Email */}
        <div className="space-y-3 pb-4 border-b border-border dark:border-dark-subtle">
          <p className="text-sm text-light-muted dark:text-dark-muted">
            Email: <span className="font-medium text-light-text dark:text-dark-text">{user?.email}</span>
          </p>

          {user?.is_demo ? (
            <p className="text-sm text-light-muted dark:text-dark-muted">The demo account&apos;s email can&apos;t be changed.</p>
          ) : (
            <>
              {emailError && (
                <div className="text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg text-sm">{emailError}</div>
              )}
              {emailSuccess && (
                <div className="text-green-700 bg-green-100 border border-green-300 p-3 rounded-lg text-sm">{emailSuccess}</div>
              )}

              <form onSubmit={submitEmailChange} className="space-y-4">
                <div>
                  <label className="input-label">New email</label>
                  <input
                    type="email"
                    name="email"
                    className="input-field"
                    value={emailForm.email}
                    onChange={changeEmailForm}
                    maxLength={255}
                    required
                  />
                </div>
                <div>
                  <label className="input-label">Current password</label>
                  <input
                    type="password"
                    name="current_password"
                    className="input-field"
                    value={emailForm.current_password}
                    onChange={changeEmailForm}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition disabled:opacity-50"
                    disabled={savingEmail}
                  >
                    {savingEmail ? "Updating..." : "Update email"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {passwordError && (
          <div className="text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg text-sm">
            {passwordError}
          </div>
        )}
        {passwordSuccess && (
          <div className="text-green-700 bg-green-100 border border-green-300 p-3 rounded-lg text-sm">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={submitPasswordChange} className="space-y-4">
          <div>
            <label className="input-label">
              Current password
            </label>
            <input
              type="password"
              name="current_password"
              className="input-field"
              value={passwordForm.current_password}
              onChange={changePasswordForm}
              required
            />
          </div>

          <div>
            <label className="input-label">
              New password
            </label>
            <input
              type="password"
              name="password"
              className="input-field"
              value={passwordForm.password}
              onChange={changePasswordForm}
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="input-label">
              Confirm new password
            </label>
            <input
              type="password"
              name="password_confirmation"
              className="input-field"
              value={passwordForm.password_confirmation}
              onChange={changePasswordForm}
              minLength={8}
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition disabled:opacity-50"
              disabled={savingPassword}
            >
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>

      {/* Goals */}
      <section className="bg-light dark:bg-dark-soft rounded-2xl shadow-md border border-border dark:border-dark-subtle p-6 space-y-4 transition-colors">
        <div>
          <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">Goals</h2>
          <p className="text-sm text-light-muted dark:text-dark-muted">
            How many applications you aim to send. Shown on the dashboard.
          </p>
        </div>

        {goalsError && (
          <div className="text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg text-sm">
            {goalsError}
          </div>
        )}
        {goalsSuccess && (
          <div className="text-green-700 bg-green-100 border border-green-300 p-3 rounded-lg text-sm">
            {goalsSuccess}
          </div>
        )}

        <form onSubmit={submitGoals} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="daily_goal" className="input-label">Per day</label>
              <input
                id="daily_goal"
                type="number"
                min={1}
                max={100}
                step={1}
                className="input-field"
                value={goalsForm.daily_goal}
                onChange={(e) => setGoalsForm((prev) => ({ ...prev, daily_goal: e.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="weekly_goal" className="input-label">Per week</label>
              <input
                id="weekly_goal"
                type="number"
                min={goalsForm.daily_goal || 1}
                max={500}
                step={1}
                className="input-field"
                value={goalsForm.weekly_goal}
                onChange={(e) => setGoalsForm((prev) => ({ ...prev, weekly_goal: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-soft transition disabled:opacity-50"
              disabled={savingGoals}
            >
              {savingGoals ? "Saving..." : "Save goals"}
            </button>
          </div>
        </form>
      </section>

      {/* To-dos */}
      <section className="bg-light dark:bg-dark-soft rounded-2xl shadow-md border border-border dark:border-dark-subtle p-6 space-y-4 transition-colors">
        <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">To-dos</h2>
        <fieldset disabled={!settings} className="space-y-2">
          <legend className="text-sm text-light-muted dark:text-dark-muted mb-2">
            When I archive an application with open to-dos:
          </legend>
          {ARCHIVE_TODOS_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 text-light-text dark:text-dark-text">
              <input
                type="radio"
                name="archive_todos"
                value={value}
                checked={settings?.archive_todos === value}
                onChange={() => saveSettings({ archive_todos: value }, setArchiveTodosError)}
              />
              {label}
            </label>
          ))}
        </fieldset>
        {archiveTodosError && <p className="text-sm text-red-500 dark:text-red-400">{archiveTodosError}</p>}
      </section>

      {/* Appearance */}
      <section className="bg-light dark:bg-dark-soft rounded-2xl shadow-md border border-border dark:border-dark-subtle p-6 transition-colors">
        <h2 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-light-text dark:text-dark-text">Dark mode</p>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              Switch between light and dark themes.
            </p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-border dark:border-dark-subtle hover:bg-light-soft dark:hover:bg-dark-subtle transition"
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </section>

      {/* Reminders */}
      <section className="bg-light dark:bg-dark-soft rounded-2xl shadow-md border border-border dark:border-dark-subtle p-6 space-y-4 transition-colors">
        <h2 className="text-lg font-semibold text-light-text dark:text-dark-text">Reminders</h2>
        <fieldset disabled={!settings} className="space-y-4">
          <label className="flex items-center gap-3 text-light-text dark:text-dark-text">
            <input
              type="checkbox"
              checked={settings?.reminders_in_app ?? false}
              onChange={(event) => saveSettings({ reminders_in_app: event.target.checked }, setReminderError)}
              className="h-5 w-5 accent-accent"
            />
            In-app reminders (on the dashboard)
          </label>

          <div>
            <label className="flex items-center gap-3 text-light-text dark:text-dark-text">
              <input
                type="checkbox"
                checked={settings?.reminders_email ?? false}
                onChange={(event) => saveSettings({ reminders_email: event.target.checked }, setReminderError)}
                className="h-5 w-5 accent-accent"
              />
              Email reminders
            </label>
            <p className="ml-8 text-sm text-light-muted dark:text-dark-muted">Sent daily at 8:00 to {user?.email}</p>
          </div>

          <label className="flex flex-wrap items-center gap-2 text-light-text dark:text-dark-text">
            Remind me after
            <input
              type="number"
              min={REMINDER_DAYS_MIN}
              max={REMINDER_DAYS_MAX}
              value={reminderDaysDraft ?? settings?.reminder_days ?? ""}
              onChange={(event) => setReminderDaysDraft(event.target.value)}
              onBlur={saveReminderDays}
              className="input-field w-20 py-1"
            />
            days without an update
          </label>

          <div className="space-y-2">
            <p className="text-sm text-light-muted dark:text-dark-muted">Dismiss hides a reminder:</p>
            {REMINDER_DISMISS_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 text-light-text dark:text-dark-text">
                <input
                  type="radio"
                  name="reminder_dismiss_mode"
                  value={value}
                  checked={settings?.reminder_dismiss_mode === value}
                  onChange={() => saveSettings({ reminder_dismiss_mode: value }, setReminderError)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        {reminderError && <p className="text-sm text-red-500 dark:text-red-400">{reminderError}</p>}
      </section>

      {/* Danger zone */}
      <section className="bg-light dark:bg-dark-soft rounded-2xl shadow-md border border-red-300 dark:border-red-800 p-6 space-y-4 transition-colors">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Danger zone</h2>

        {!confirmingDelete ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-light-muted dark:text-dark-muted">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button
              onClick={() => setConfirmingDelete(true)}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shrink-0 self-start sm:self-auto"
            >
              Delete account
            </button>
          </div>
        ) : (
          <form onSubmit={submitDeleteAccount} className="space-y-4">
            <p className="text-sm text-light-muted dark:text-dark-muted">
              This will permanently delete your account, profile, links, job applications,
              interviews, notes, and to-dos. Enter your password to confirm.
            </p>

            {deleteError && (
              <div className="text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg text-sm">
                {deleteError}
              </div>
            )}

            <input
              type="password"
              placeholder="Your password"
              className="input-field focus:ring-red-500"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-border dark:bg-dark-subtle text-light-text dark:text-dark-muted hover:bg-light-muted/25 dark:hover:bg-dark-subtle/80 transition"
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Permanently delete account"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
