import { useState } from "react";
import API from "../../api/axios";

export default function InterviewsPanel({ jobId, initialInterviews }) {
  const [interviews, setInterviews] = useState(initialInterviews);
  const [newInterview, setNewInterview] = useState({
    type: "online",
    date: "",
    notes: "",
  });

  const addInterview = async (e) => {
    e.preventDefault();
    if (!newInterview.date) return;

    try {
      const res = await API.post(`/job-applications/${jobId}/interviews`, newInterview);
      setInterviews([...interviews, res.data]);
      setNewInterview({ type: "online", date: "", notes: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add interview");
    }
  };

  return (
    <div className="mt-4 pt-2 border-t border-gray-300">
      <h3 className="font-semibold text-gray-800 mb-2">Interviews</h3>

      <ul className="list-disc list-inside space-y-1 text-gray-700">
        {interviews.map((iv) => (
          <li key={iv.id}>
            <span className="font-medium">{iv.type}</span> on{" "}
            {new Date(iv.interview_date).toLocaleDateString()} – {iv.notes || "—"}
          </li>
        ))}
      </ul>

      <form onSubmit={addInterview} className="mt-3 flex flex-col gap-2">
        <input
          type="date"
          value={newInterview.date}
          onChange={(e) =>
            setNewInterview({ ...newInterview, date: e.target.value })
          }
          className="border border-gray-300 px-2 py-1 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={newInterview.type}
          onChange={(e) =>
            setNewInterview({ ...newInterview, type: e.target.value })
          }
          className="border border-gray-300 px-2 py-1 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="phone">Phone</option>
          <option value="online">Online</option>
          <option value="onsite">On-site</option>
        </select>

        <input
          placeholder="Notes"
          value={newInterview.notes}
          onChange={(e) =>
            setNewInterview({ ...newInterview, notes: e.target.value })
          }
          className="border border-gray-300 px-2 py-1 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg transition"
        >
          Add Interview
        </button>
      </form>
    </div>
  );
}
