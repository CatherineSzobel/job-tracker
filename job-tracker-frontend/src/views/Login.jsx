import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { DEMO_EMAIL, useAuthStore } from "../stores/useAuthStore";
import AuthCard, { AuthError } from "../components/Layouts/AuthCard";
import PasswordInput from "../components/UI/PasswordInput";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const loginAction = useAuthStore((state) => state.loginAction);
  const demoLoginAction = useAuthStore((state) => state.demoLoginAction);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginAction(form.email, form.password);
      navigate("/");
    } catch (err) {
      // e.g. "These credentials do not match our records." or the lockout countdown
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    }
  };

  const demoLogin = async () => {
    // Show which account is used; the password stays in the store
    setForm({ email: DEMO_EMAIL, password: "" });
    setError("");

    try {
      await demoLoginAction();
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Demo login failed");
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      intro="Log in to keep tracking your job applications."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-semibold text-accent-text hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-accent-soft p-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-accent-text">
          <Eye size={20} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-[1_1_160px] flex-col">
          <strong className="font-semibold">Just looking around?</strong>
          <span className="text-sm text-muted">Open the shared demo account — no sign-up.</span>
        </div>
        <button
          type="button"
          onClick={demoLogin}
          className="inline-flex min-h-12 items-center rounded-lg border border-accent-text bg-surface px-4 font-semibold text-accent-text transition-colors hover:bg-soft"
        >
          Use demo
        </button>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted">
        <span className="h-px flex-auto bg-line" />
        or log in with email
        <span className="h-px flex-auto bg-line" />
      </div>

      {error && <AuthError message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="input-label">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" className="input-label">
            Password
          </label>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            shown={showPassword}
            onToggleShown={() => setShowPassword(!showPassword)}
            required
          />
        </div>

        <button type="submit" className="btn-primary mt-2 w-full">
          Log in
        </button>
      </form>
    </AuthCard>
  );
}
