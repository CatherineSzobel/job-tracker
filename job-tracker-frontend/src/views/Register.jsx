import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await API.post("/register", form);
      await API.post("/login", {
        email: form.email,
        password: form.password,
      });

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
      <h2 className="text-2xl font-bold text-center mb-2">
        Create your account 🚀
      </h2>
      <p className="text-sm text-light-text/70 dark:text-gray-300 text-center mb-6">
        Start tracking your job applications in one place
      </p>

      {error && (
        <div className="mb-4 text-red-700 bg-red-100 border border-red-300 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            placeholder="Jane Doe"
            className="w-full border border-light-muted dark:border-dark-subtle
                       rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                       focus:ring-accent dark:focus:ring-accent transition-colors"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full border border-light-muted dark:border-dark-subtle
                       rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                       focus:ring-accent dark:focus:ring-accent transition-colors"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className="w-full border border-light-muted dark:border-dark-subtle
                       rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                       focus:ring-accent dark:focus:ring-accent transition-colors"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            name="password_confirmation"
            type="password"
            placeholder="••••••••"
            className="w-full border border-light-muted dark:border-dark-subtle
                       rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                       focus:ring-accent dark:focus:ring-accent transition-colors"
            value={form.password_confirmation}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg font-semibold
                     bg-accent hover:bg-accent-soft text-white transition-colors"
        >
          Create Account
        </button>
      </form>

      <div className="text-sm text-light-text/70 dark:text-gray-300 text-center mt-6">
        <p>Already have an account?</p>
        <Link
          to="/login"
          className="text-accent font-medium hover:underline"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
