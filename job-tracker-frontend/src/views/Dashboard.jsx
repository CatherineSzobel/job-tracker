import { useState, useEffect } from "react";
import API from "../api/axios";
import TodoList from "../components/ToDoList";
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const dailyGoal = 5;
  const weeklyGoal = 20;

  useEffect(() => {
    API.get("/job-applications")
      .then(res => {
        const jobs = res.data;
        const summary = {
          total: jobs.length,
          applied: jobs.filter(j => j.status === "applied").length,
          interview: jobs.filter(j => j.status === "interview").length,
          offer: jobs.filter(j => j.status === "offer").length,
          rejected: jobs.filter(j => j.status === "rejected").length,
          upcomingInterviews: jobs
            .flatMap(j => j.interviews || [])
            .filter(i => new Date(i.interview_date) >= new Date()),
          todayApplications: jobs.filter(j => {
            const appliedDate = new Date(j.applied_date);
            const today = new Date();
            return appliedDate.toDateString() === today.toDateString();
          }).length,
          weekApplications: jobs.filter(j => {
            const appliedDate = new Date(j.applied_date);
            const now = new Date();
            const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            return appliedDate >= firstDayOfWeek;
          }).length
        };
        setStats(summary);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const statusColors = {
    applied: "bg-blue-100 text-blue-700",
    interview: "bg-yellow-100 text-yellow-700",
    offer: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const renderStatus = (label, count) => {
    const percentage = stats.total ? (count / stats.total) * 100 : 0;
    return (
      <div className="mb-2">
        <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${statusColors[label.toLowerCase()]}`}>
          {label}: {count}
        </span>
        <div className="h-2 bg-gray-200 rounded mt-1">
          <div
            className={`h-2 rounded ${statusColors[label.toLowerCase()]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  const renderGoal = (label, current, goal) => {
    const percentage = goal ? Math.min((current / goal) * 100, 100) : 0;
    return (
      <div className="mb-2">
        <p className="font-semibold">{label}</p>
        <div className="flex justify-between text-sm mb-1">
          <span>{current}</span>
          <span>{goal}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded">
          <div
            className="h-3 bg-indigo-500 rounded"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <p className="font-semibold mb-2">Total Applications</p>
            <p className="text-xl">{stats.total}</p>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <p className="font-semibold mb-2">Application Status</p>
            {renderStatus("Applied", stats.applied)}
            {renderStatus("Interview", stats.interview)}
            {renderStatus("Offer", stats.offer)}
            {renderStatus("Rejected", stats.rejected)}
          </div>

          <div className="p-4 bg-white rounded shadow col-span-2">
            <p className="font-semibold mb-2">Quick Todo</p>

            <TodoList />
          </div>

          <div className="p-4 bg-white rounded shadow">
            <p className="font-semibold mb-2">Goals</p>
            {renderGoal("Today's Applications", stats.todayApplications, dailyGoal)}
            {renderGoal("This Week's Applications", stats.weekApplications, weeklyGoal)}
          </div>

          <div className="p-4 bg-white rounded shadow">
            <p className="font-semibold mb-2">Upcoming Interviews</p>
            <p className="text-xl">{stats.upcomingInterviews.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}
