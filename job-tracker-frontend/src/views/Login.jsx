import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loginAction = useAuthStore((state) => state.loginAction);

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
    const demoEmail = "test@example.com";
    const demoPassword = "secret123";

    setForm({ email: demoEmail, password: demoPassword });

    try {
      await loginAction(demoEmail, demoPassword);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Demo login failed");
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl shadow-xl p-8 bg-light dark:bg-dark-soft text-light-text dark:text-white transition-colors">
      <h2 className="text-2xl font-bold text-center mb-2">Welcome back 👋</h2>
      <p className="text-sm text-light-text/70 dark:text-dark-muted text-center mb-6">
        Log in to continue tracking your job applications
      </p>

      <div className="bg-accent text-light border border-dark dark:border-light rounded-xl p-3 flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-bold">👀 Just browsing?</div>
          <div className="text-xs mt-0.5 opacity-90">Log in instantly with our demo account</div>
        </div>
        <button type="button" onClick={demoLogin} className="shrink-0 rounded-lg bg-light text-accent hover:bg-light-soft font-semibold text-xs px-3 py-1.5 transition-colors">
          Use Demo
        </button>
      </div>

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="input-label">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <button type="submit" className="w-full py-2 rounded-lg font-semibold bg-accent hover:bg-accent-soft text-white">
          Log In
        </button>
      </form>

      <p className="text-sm mt-6 text-light-text/70 dark:text-dark-muted text-center">
        Don’t have an account?{" "}
        <Link to="/register" className="font-medium text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}