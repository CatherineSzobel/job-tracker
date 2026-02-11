import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
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
        err.response?.data?.message || "Registration failed. Please try again."
      );
    }
  };
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-6 border rounded shadow"
    >
      <h2 className="text-xl font-bold mb-4">Register</h2>

      {error && (
        <div className="mb-3 text-red-600 bg-red-100 border border-red-400 p-2 rounded">
          {error}
        </div>
      )}

      <input
        name="name"
        placeholder="Name"
        className="border p-2 mb-2 w-full"
        value={form.name}
        onChange={handleChange}
        required
      />

      <input
        name="email"
        type="email"
        placeholder="Email"
        className="border p-2 mb-2 w-full"
        value={form.email}
        onChange={handleChange}
        required
      />

      <input
        name="password"
        type="password"
        placeholder="Password"
        className="border p-2 mb-2 w-full"
        value={form.password}
        onChange={handleChange}
        required
      />
      <input
        name="password_confirmation"
        type="password"
        placeholder="Confirm Password"
        className="border p-2 mb-2 w-full"
        value={form.password_confirmation}
        onChange={handleChange}
        required
      />

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Register
      </button>
    </form>
  );
}
