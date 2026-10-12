import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import AuthCard, { AuthError } from "../components/Layouts/AuthCard";
import PasswordInput from "../components/UI/PasswordInput";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  // One toggle for both password fields
  const [showPasswords, setShowPasswords] = useState(false);
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
    <AuthCard
      title="Create your account"
      intro="Start tracking your job applications in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent-text hover:underline">
            Log in
          </Link>
        </>
      }
    >
      {error && <AuthError message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="register-name" className="input-label">
            Name
          </label>
          <input
            id="register-name"
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="register-email" className="input-label">
            Email
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="register-password" className="input-label">
            Password
          </label>
          <PasswordInput
            id="register-password"
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            aria-describedby="register-password-hint"
            shown={showPasswords}
            onToggleShown={() => setShowPasswords(!showPasswords)}
            required
          />
          <p id="register-password-hint" className="mt-2 text-sm text-muted">
            At least 8 characters.
          </p>
        </div>

        <div>
          <label htmlFor="register-password-confirmation" className="input-label">
            Confirm password
          </label>
          <input
            id="register-password-confirmation"
            name="password_confirmation"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            value={form.password_confirmation}
            onChange={handleChange}
            placeholder="••••••••"
            className="input-field"
            required
          />
        </div>

        <button type="submit" className="btn-primary mt-2 w-full">
          Create account
        </button>
      </form>
    </AuthCard>
  );
}
