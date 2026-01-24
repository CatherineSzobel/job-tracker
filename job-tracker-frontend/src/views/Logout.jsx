import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/logout", form);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Logout</h2>
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </form>
  );
}
