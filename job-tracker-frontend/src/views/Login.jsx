import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div
      className="w-full max-w-md rounded-2xl shadow-xl p-8
             bg-light dark:bg-dark-soft
             text-light-text dark:text-white transition-colors"
    >

      <h2 className="text-2xl font-bold text-center mb-2">
        Welcome back 👋
      </h2>
      <p className="text-sm text-light-text/70 dark:text-gray-300 text-center mb-6">
        Log in to continue tracking your job applications
      </p>

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
            className="w-full border border-light-muted dark:border-dark-subtle
                       rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                       focus:ring-accent dark:focus:ring-accent transition-colors"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full border border-light-muted dark:border-dark-subtle
                       rounded-lg px-3 py-2 focus:outline-none focus:ring-2
                       focus:ring-accent dark:focus:ring-accent transition-colors"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-lg font-semibold
                     bg-accent hover:bg-accent-soft text-white transition-colors"
        >
          Log In
        </button>
      </form>

      <p className="text-sm mt-6 text-light-text/70 dark:text-gray-300 text-center">
        Don’t have an account?{" "}
        <a
          href="/register"
          className="font-medium text-accent hover:underline"
        >
          Sign up
        </a>
      </p>
    </div>
  );
}
