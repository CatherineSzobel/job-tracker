import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    } catch {
      setError("Login failed. Check your credentials.");
    }
  };

  const demoLogin = async () => {
    const demoEmail = "test@example.com";
    const demoPassword = "secret123";

    setForm({ email: demoEmail, password: demoPassword });

    try {
      await loginAction(demoEmail, demoPassword);
      navigate("/");
    } catch {
      setError("Demo login failed");
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl shadow-xl p-8 bg-light dark:bg-dark-soft text-light-text dark:text-white transition-colors">
      <h2 className="text-2xl font-bold text-center mb-2">Welcome back 👋</h2>
      <p className="text-sm text-light-text/70 dark:text-gray-300 text-center mb-6">
        Log in to continue tracking your job applications
      </p>

      <div className="bg-accent hover:bg-accent-soft text-light border  border-dark dark:border-light rounded-xl p-3 flex items-center justify-between mb-4">
        <div>
          <div className="text-xs font-bold text-brand-700">👀 Just browsing?</div>
          <div className="text-xs text-brand-500 mt-0.5">Log in instantly with our demo account</div>
        </div>
        <button type="button" onClick={demoLogin} className="btn-primary text-xs px-3 py-1.5">
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
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-light-muted dark:border-dark-subtle rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border border-light-muted dark:border-dark-subtle rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            required
          />
        </div>

        <button type="submit" className="w-full py-2 rounded-lg font-semibold bg-accent hover:bg-accent-soft text-white">
          Log In
        </button>
      </form>

      <p className="text-sm mt-6 text-light-text/70 dark:text-gray-300 text-center">
        Don’t have an account?{" "}
        <a href="/register" className="font-medium text-accent hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
}