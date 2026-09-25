import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import API from "../api/axios";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeStore } from "../stores/useThemeStore";

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
    <div className="max-w-3xl mx-auto mt-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account, appearance, and account deletion.
        </p>
      </div>

      {/* Account & security */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 space-y-4 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={passwordForm.password}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, password: e.target.value }))
              }
              minLength={8}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
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
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
              disabled={savingPassword}
            >
              {savingPassword ? "Updating..." : "Update password"}
            </button>
          </div>
        </form>
      </section>

      {/* Appearance */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Appearance
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Dark mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Switch between light and dark themes.
            </p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Toggle dark mode"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-red-300 dark:border-red-800 p-6 space-y-4 transition-colors">
        <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Danger zone</h2>

        {!confirmingDelete ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <button
              onClick={() => setConfirmingDelete(true)}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shrink-0 ml-4"
            >
              Delete account
            </button>
          </div>
        ) : (
          <form onSubmit={submitDeleteAccount} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 outline-none transition"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
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
