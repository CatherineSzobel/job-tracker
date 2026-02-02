import { useState, useEffect } from "react";
import API from "../api/axios";
import TodoList from "../components/ToDoList";
import GoalBar from "../components/Dashboard/GoalBar";
import Status from "../components/Dashboard/Status";

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
          archived: jobs.filter(j => j.archived).length,
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

  if (loading)
    return (
      <p className="text-center mt-10 text-muted">Loading…</p>
    );

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Combined Summary Card */}
          <div className="p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition col-span-1 md:col-span-3">

            {/* Status badges */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[120px] p-3 bg-white rounded-xl shadow text-center border border-gray-100">
                <p className="text-sm font-medium text-green-500">Applied</p>
                <p className="text-xl font-bold text-green-500">{stats.applied}</p>
              </div>

              <div className="flex-1 min-w-[120px] p-3 bg-white rounded-xl shadow text-center border border-gray-100">
                <p className="text-sm font-medium text-blue-500">Interview</p>
                <p className="text-xl font-bold text-blue-500">{stats.interview}</p>
              </div>

              <div className="flex-1 min-w-[120px] p-3 bg-white rounded-xl shadow text-center border border-gray-100">
                <p className="text-sm font-medium text-purple-500">Offer</p>
                <p className="text-xl font-bold text-purple-500">{stats.offer}</p>
              </div>

              <div className="flex-1 min-w-[120px] p-3 bg-white rounded-xl shadow text-center border border-gray-100">
                <p className="text-sm font-medium text-red-500">Rejected</p>
                <p className="text-xl font-bold text-red-500">{stats.rejected}</p>
              </div>
            </div>

            {/* Upcoming Interviews */}
            <div className="p-4 mb-6 bg-gray-50 rounded-xl shadow-inner text-center">
              <p className="text-xl font-semibold text-gray-700">Total Applications</p>
              <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
            </div>
            {/* Upcoming Interviews */}
            <div className="p-4 mb-6 bg-gray-50 rounded-xl shadow-inner text-center">
              <p className="text-lg font-medium mt-4 text-gray-700">Archived Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.archived}</p>
            </div>
            {/* Upcoming Interviews */}
            <div className="p-4 mb-6 bg-gray-50 rounded-xl shadow-inner text-center">
              <p className="text-sm font-medium text-gray-700">Upcoming Interviews</p>
              <p className="text-3xl font-bold text-gray-900">{stats.upcomingInterviews.length}</p>
            </div>

          </div>

          {/* Quick Todo */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow hover:shadow-lg transition col-span-1 md:col-span-2">
            <p className="font-semibold mb-4 text-gray-800">Quick Todo</p>
            <TodoList />
          </div>

          {/* Goals */}
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow hover:shadow-lg transition">
            <p className="font-semibold mb-4 text-gray-800">Goals</p>
            <GoalBar
              label="Today's Applications"
              current={stats.todayApplications}
              goal={dailyGoal}
              barColor="accent"
            />
            <GoalBar
              label="This Week's Applications"
              current={stats.weekApplications}
              goal={weeklyGoal}
              barColor="accent-soft"
            />
          </div>

        </div>
      )}
    </div >
  );
}