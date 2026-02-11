import { useState, useEffect } from "react";
import API from "../api/axios";
import TodoList from "../components/ToDoList";
import GoalBar from "../components/Dashboard/GoalBar";
import Status from "../components/Dashboard/Status";

import StatCard from "../components/Dashboard/StatsCard";
import { Briefcase, Archive, Calendar } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const dailyGoal = 5;
  const weeklyGoal = 20;

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await API.get("/job-applications/stats");
      console.log("Fetched stats:", res.data.data);
      setStats(res.data.data);
      console.log("Fetched stats:", res.data.data);
    } catch (err) {
      console.error(err);
      setStats({
        total: 0,
        applied: 0,
        interview: 0,
        offer: 0,
        rejected: 0,
        archived: 0,
        todayApplications: 0,
        weekApplications: 0,
        upcomingInterviews: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-accent rounded-full animate-spin"></div>
        <p className="ml-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  const handleSaveNotes = () => {
    alert("Notes saved! (This is just a placeholder action.)");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard
          label="Total Applications"
          value={stats?.total ?? 0}
          icon={<Briefcase size={20} />}
          accent="text-indigo-600"
        />

        <StatCard
          label="Archived Applications"
          value={stats?.archived ?? 0}
          icon={<Archive size={20} />}
          accent="text-gray-600"
        />

        <StatCard
          label="Upcoming Interviews"
          value={stats?.upcomingInterviews ?? 0}
          icon={<Calendar size={20} />}
          accent="text-green-600"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Quick Todo */}
          <div className="bg-white shadow-md rounded-2xl p-6 transition-shadow hover:shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Quick Todo</h2>
            <TodoList />
          </div>

          {/* Goals */}
          <div className="bg-white shadow-md rounded-2xl p-6 transition-shadow hover:shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Goals</h2>
            <div className="flex flex-col gap-4">
              <GoalBar
                label="Today's Applications"
                current={stats?.todayApplications ?? 0}
                goal={dailyGoal}
                barColor={stats?.todayApplications >= dailyGoal ? "green" : "accent"}
              />
              <GoalBar
                label="This Week's Applications"
                current={stats?.weekApplications ?? 0}
                goal={weeklyGoal}
                barColor={stats?.weekApplications >= weeklyGoal ? "green" : "accent-soft"}
              />
            </div>
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Status Badges */}
          <div className="bg-white shadow-md rounded-2xl p-6 flex flex-wrap gap-4 justify-between transition-shadow hover:shadow-xl">
            <div className="flex-1 min-w-30">
              <Status label="Applied" count={stats.applied ?? 0} total={stats?.total ?? 1} />
            </div>
            <div className="flex-1 min-w-30">
              <Status label="Interview" count={stats.interview ?? 0} total={stats?.total ?? 1} />
            </div>
            <div className="flex-1 min-w-30">
              <Status label="Offer" count={stats.offer ?? 0} total={stats?.total ?? 1} />
            </div>
            <div className="flex-1 min-w-30">
              <Status label="Rejected" count={stats.rejected ?? 0} total={stats?.total ?? 1} />
            </div>
          </div>

          {/* Insights Placeholder */}
          <div className="bg-white shadow-md rounded-2xl p-6 transition-shadow hover:shadow-xl">
            <h3 className="text-md font-semibold mb-2">Insights</h3>
            <p className="text-sm text-gray-500">Application activity overview coming soon…</p>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* Notes */}
          <div className="bg-white shadow-md rounded-2xl p-6 sticky top-6 transition-shadow hover:shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            <textarea
              className="w-full h-40 p-2 border rounded-md focus:outline-none focus:ring focus:ring-accent resize-none"
              placeholder="Write your notes..."
            />
            <button onClick={handleSaveNotes} className="mt-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors">Save</button>
          </div>

        </div>

      </div>
    </div>
  );
}
