import { useState } from "react";
import API from "../../api/axios";

export default function InterviewsPanel({ jobId, initialInterviews }) {
  const [interviews, setInterviews] = useState(initialInterviews);
  const [newInterview, setNewInterview] = useState({ type: "online", date: "", notes: "" });

  const addInterview = async (e) => {
    e.preventDefault();
    if (!newInterview.date) return;

    const res = await API.post(`/job-applications/${jobId}/interviews`, newInterview);
    setInterviews([...interviews, res.data]);
    setNewInterview({ type: "online", date: "", notes: "" });
  };

  return (
    <div className="mt-4 border-t pt-2">
      <h3 className="font-semibold mb-1">Interviews</h3>
      <ul>
        {interviews.map(iv => (
          <li key={iv.id}>
            {iv.type} on {new Date(iv.interview_date).toLocaleDateString()} – {iv.notes}
          </li>
        ))}
      </ul>

      <form onSubmit={addInterview} className="mt-2 flex flex-col gap-2">
        <input
          type="date"
          value={newInterview.date}
          onChange={e => setNewInterview({ ...newInterview, date: e.target.value })}
          className="border p-1"
        />
        <select
          value={newInterview.type}
          onChange={e => setNewInterview({ ...newInterview, type: e.target.value })}
          className="border p-1"
        >
          <option value="phone">Phone</option>
          <option value="online">Online</option>
          <option value="onsite">Onsite</option>
        </select>
        <input
          placeholder="Notes"
          value={newInterview.notes}
          onChange={e => setNewInterview({ ...newInterview, notes: e.target.value })}
          className="border p-1"
        />
        <button type="submit" className="bg-green-500 text-white px-2 py-1 rounded">Add Interview</button>
      </form>
    </div>
  );
}
