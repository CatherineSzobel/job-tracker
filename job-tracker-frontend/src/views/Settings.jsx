import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import API from "../api/axios";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeStore } from "../stores/useThemeStore";
import { DEFAULT_GOALS } from "../constants/jobs";

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

  // Goals
  const user = useAuthStore((state) => state.user);
  const [goalsForm, setGoalsForm] = useState({
    daily_goal: user?.daily_goal ?? DEFAULT_GOALS.daily_goal,
    weekly_goal: user?.weekly_goal ?? DEFAULT_GOALS.weekly_goal,
  });
  const [goalsError, setGoalsError] = useState("");
  const [goalsSuccess, setGoalsSuccess] = useState("");
  const [savingGoals, setSavingGoals] = useState(false);

  // Appearance
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);

  // Danger zone
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

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
              className="input-field"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="input-label">
              New password
            </label>
            <input
              type="password"
              className="input-field"
              value={passwordForm.password}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, password: e.target.value }))
              }
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
              className="input-field"
              value={passwordForm.password_confirmation}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, password_confirmation: e.target.value }))
              }
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
