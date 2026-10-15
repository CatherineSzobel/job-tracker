import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import PrepTemplateEditor from "../components/InterviewPrep/PrepTemplateEditor";
import FormMessage from "../components/UI/FormMessage";
import PageHeader from "../components/UI/PageHeader";
import PasswordInput from "../components/UI/PasswordInput";
import SettingsSection from "../components/UI/SettingsSection";
import Switch from "../components/UI/Switch";
import { useAuthStore } from "../stores/useAuthStore";
import { useThemeStore } from "../stores/useThemeStore";
import { useSettingsStore } from "../stores/useSettingsStore";
import { DEFAULT_GOALS } from "../constants/jobs";
import { ARCHIVE_TODOS_OPTIONS } from "../constants/todos";
import { REMINDER_DAYS_MAX, REMINDER_DAYS_MIN, REMINDER_DISMISS_OPTIONS } from "../constants/reminders";

// The sections, in page order: the side list (desktop) and chip row (phones) link to them
const SECTIONS = [
  { id: "account", label: "Account & security" },
  { id: "goals", label: "Goals" },
  { id: "reminders", label: "Reminders" },
  { id: "todos", label: "To-dos" },
  { id: "prep", label: "Prep checklist" },
  { id: "appearance", label: "Appearance" },
  { id: "delete", label: "Delete account" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { hash } = useLocation();

  // A link like /settings#goals (the Dashboard's "Edit goals") opens at that section
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  // Account & security
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  // One show/hide toggle for the three password fields
  const [showPasswords, setShowPasswords] = useState(false);

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
      // Back to the landing page
      navigate("/");
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };


  const cancelDelete = () => {
    setConfirmingDelete(false);
    setDeletePassword("");
    setDeleteError("");
  };

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
      <PageHeader title="Settings" description="Your account, goals, reminders and how the app looks." />

      {/* Phones: the section links as a scrolling chip row */}
      <nav aria-label="Settings sections" className="-mx-4 overflow-x-auto px-4 lg:hidden">
        <ul className="flex w-max gap-2 p-0.5">
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <a href={`#${id}`} className="inline-flex min-h-10 items-center rounded-full border border-input bg-surface px-4 font-semibold whitespace-nowrap text-ink hover:bg-soft">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-start gap-8">
        {/* Desktop: a sticky list beside the cards */}
        <nav aria-label="Settings sections" className="sticky top-6 hidden w-52 shrink-0 lg:block">
          <ul className="flex flex-col gap-1">
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={`flex min-h-10 items-center rounded-lg px-3 font-medium transition-colors hover:bg-surface hover:text-ink ${id === "delete" ? "text-danger" : "text-muted-2"}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <SettingsSection
            id="account"
            title="Account & security"
            description={
              <>
                Signed in as <strong className="font-semibold text-ink">{user?.email}</strong>
              </>
            }
          >
            {/* Email */}
            <div className="flex flex-col gap-4 border-b border-subtle pb-6">
              <h3 className="font-semibold">Change email</h3>
              {user?.is_demo ? (
                <p className="text-muted">The demo account&apos;s email can&apos;t be changed.</p>
              ) : (
                <form onSubmit={submitEmailChange} className="flex flex-col gap-4">
                  <FormMessage tone="error">{emailError}</FormMessage>
                  <FormMessage tone="success">{emailSuccess}</FormMessage>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
                    <div>
                      <label htmlFor="settings-new-email" className="input-label">
                        New email
                      </label>
                      <input
                        id="settings-new-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        className="input-field"
                        value={emailForm.email}
                        onChange={changeEmailForm}
                        maxLength={255}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-email-password" className="input-label">
                        Current password
                      </label>
                      <input
                        id="settings-email-password"
                        type="password"
                        name="current_password"
                        autoComplete="current-password"
                        className="input-field"
                        value={emailForm.current_password}
                        onChange={changeEmailForm}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-secondary self-end" disabled={savingEmail}>
                    {savingEmail ? "Updating…" : "Update email"}
                  </button>
                </form>
              )}
            </div>

            {/* Password */}
            <form onSubmit={submitPasswordChange} className="flex flex-col gap-4">
              <h3 className="font-semibold">Change password</h3>
              <FormMessage tone="error">{passwordError}</FormMessage>
              <FormMessage tone="success">{passwordSuccess}</FormMessage>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-4">
                <div>
                  <label htmlFor="settings-current-password" className="input-label">
                    Current password
                  </label>
                  <PasswordInput
                    id="settings-current-password"
                    name="current_password"
                    autoComplete="current-password"
                    value={passwordForm.current_password}
                    onChange={changePasswordForm}
                    shown={showPasswords}
                    onToggleShown={() => setShowPasswords(!showPasswords)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="settings-new-password" className="input-label">
                    New password
                  </label>
                  <input
                    id="settings-new-password"
                    type={showPasswords ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    aria-describedby="settings-password-hint"
                    className="input-field"
                    value={passwordForm.password}
                    onChange={changePasswordForm}
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="settings-confirm-password" className="input-label">
                    Confirm new password
                  </label>
                  <input
                    id="settings-confirm-password"
                    type={showPasswords ? "text" : "password"}
                    name="password_confirmation"
                    autoComplete="new-password"
                    className="input-field"
                    value={passwordForm.password_confirmation}
                    onChange={changePasswordForm}
                    minLength={8}
                    required
                  />
                </div>
              </div>
              <p id="settings-password-hint" className="text-sm text-muted">
                At least 8 characters.
              </p>
              <button type="submit" className="btn-secondary self-end" disabled={savingPassword}>
                {savingPassword ? "Updating…" : "Update password"}
              </button>
            </form>
          </SettingsSection>

          <SettingsSection id="goals" title="Goals" description="How many applications you aim to send. Shown on the dashboard.">
            <form onSubmit={submitGoals} className="flex flex-col gap-4">
              <FormMessage tone="error">{goalsError}</FormMessage>
              <FormMessage tone="success">{goalsSuccess}</FormMessage>
              <div className="flex flex-wrap gap-4">
                <div className="flex-[0_1_160px]">
                  <label htmlFor="daily_goal" className="input-label">
                    Per day
                  </label>
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
                <div className="flex-[0_1_160px]">
                  <label htmlFor="weekly_goal" className="input-label">
                    Per week
                  </label>
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
              <button type="submit" className="btn-primary self-end" disabled={savingGoals}>
                {savingGoals ? "Saving…" : "Save goals"}
              </button>
            </form>
          </SettingsSection>

          <SettingsSection
            id="reminders"
            title="Reminders"
            description="For applications that have gone quiet and for to-dos that are due. Changes save straight away."
          >
            <fieldset disabled={!settings} className="flex flex-col gap-4">
              <label className="flex min-h-12 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings?.reminders_in_app ?? false}
                  onChange={(event) => saveSettings({ reminders_in_app: event.target.checked }, setReminderError)}
                  className="size-5 shrink-0"
                />
                Show reminders in the app (on the dashboard)
              </label>

              <div className="flex flex-col">
                <label className="flex min-h-12 cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings?.reminders_email ?? false}
                    onChange={(event) => saveSettings({ reminders_email: event.target.checked }, setReminderError)}
                    className="size-5 shrink-0"
                  />
                  Email reminders
                </label>
                <span className="pl-8 text-sm text-muted">Sent daily at 08:00 to {user?.email}</span>
              </div>

              <label className="flex flex-wrap items-center gap-2">
                Remind me after
                <input
                  type="number"
                  min={REMINDER_DAYS_MIN}
                  max={REMINDER_DAYS_MAX}
                  value={reminderDaysDraft ?? settings?.reminder_days ?? ""}
                  onChange={(event) => setReminderDaysDraft(event.target.value)}
                  onBlur={saveReminderDays}
                  aria-label="Days without an update"
                  className="input-field w-20 px-3"
                />
                days without an update
              </label>

              <fieldset className="flex flex-col gap-1">
                <legend className="mb-1 font-semibold">&ldquo;Dismiss&rdquo; hides a reminder</legend>
                {REMINDER_DISMISS_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="flex min-h-10 cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="reminder_dismiss_mode"
                      value={value}
                      checked={settings?.reminder_dismiss_mode === value}
                      onChange={() => saveSettings({ reminder_dismiss_mode: value }, setReminderError)}
                      className="size-5 shrink-0"
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
            </fieldset>
            <FormMessage tone="error">{reminderError}</FormMessage>
          </SettingsSection>

          <SettingsSection id="todos" title="To-dos">
            <fieldset disabled={!settings} className="flex flex-col gap-1">
              <legend className="mb-1 text-muted">When I archive an application with open to-dos:</legend>
              {ARCHIVE_TODOS_OPTIONS.map(({ value, label }) => (
                <label key={value} className="flex min-h-10 cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="archive_todos"
                    value={value}
                    checked={settings?.archive_todos === value}
                    onChange={() => saveSettings({ archive_todos: value }, setArchiveTodosError)}
                    className="size-5 shrink-0"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
            <FormMessage tone="error">{archiveTodosError}</FormMessage>
          </SettingsSection>

          <PrepTemplateEditor />

          <SettingsSection id="appearance" title="Appearance">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="font-semibold">Dark mode</span>
                <span className="text-muted">Easier on the eyes in the evening. Follows your system until you change it.</span>
              </div>
              <Switch checked={darkMode} onChange={toggleDarkMode} label="Dark mode" />
            </div>
          </SettingsSection>

          <SettingsSection id="delete" title="Delete account" danger>
            {!confirmingDelete ? (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-[60ch] text-muted">Permanently delete your account and all associated data. This cannot be undone.</p>
                <button type="button" onClick={() => setConfirmingDelete(true)} className="btn-danger">
                  Delete account…
                </button>
              </div>
            ) : (
              <form onSubmit={submitDeleteAccount} className="flex flex-col gap-4">
                <p className="text-muted">
                  This will permanently delete your account, profile, documents, job applications, interviews, notes and to-dos. Enter your
                  password to confirm.
                </p>
                <FormMessage tone="error">{deleteError}</FormMessage>
                <div>
                  <label htmlFor="settings-delete-password" className="input-label">
                    Your password
                  </label>
                  <input
                    id="settings-delete-password"
                    type="password"
                    autoComplete="current-password"
                    className="input-field"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <button type="button" className="btn-secondary" onClick={cancelDelete} disabled={deleting}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-danger" disabled={deleting}>
                    {deleting ? "Deleting…" : "Permanently delete account"}
                  </button>
                </div>
              </form>
            )}
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
