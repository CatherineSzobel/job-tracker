import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.registerAction);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register(form.name, form.email, form.password, form.password_confirmation);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please try again."
      );
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="w-full max-w-md rounded-2xl shadow-xl p-8
                 bg-light dark:bg-dark-soft
                 text-light-text dark:text-white
                 transition-colors"
    >
      <Link to="/" className="inline-block mb-4 text-sm text-accent dark:text-accent-muted hover:underline">
        ← Back to the home page
      </Link>
      <h2 className="text-2xl font-bold text-center mb-2">
        Create your account 🚀
      </h2>
      <p className="text-sm text-light-text/70 dark:text-dark-muted text-center mb-6">
        Start tracking your job applications in one place
      </p>

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="input-label">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="input-label">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="input-label">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="input-label">
            Confirm Password
          </label>
          <input
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={handleChange}
            placeholder="••••••••"
            className="input-field"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg font-semibold
                     bg-accent hover:bg-accent-soft text-white"
        >
          Create Account
        </button>
      </form>

      <div className="text-sm text-light-text/70 dark:text-dark-muted text-center mt-6">
        <p>Already have an account?</p>
        <Link to="/login" className="text-accent font-medium hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}