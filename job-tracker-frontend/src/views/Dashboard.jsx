import { useState, useEffect } from "react";
import API from "../api/axios";
import TodoList from "../components/ToDoList";
import StatusBadges from "../components/Dashboard/Status/StatusBadges";
import StatusGrid from "../components/Dashboard/Status/StatusGrid";
import GoalStats from "../components/Dashboard/Goals/GoalStats";
import InsightChart from "../components/Dashboard/InsightChart";
import Notes from "../components/Notes";

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
    <div className="min-h-screen bg-light p-4 sm:p-6 lg:p-8 dark:bg-dark transition-colors rounded-2xl">

      {/* Top Stats */}
      <StatusGrid stats={stats} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Quick Todo */}
          <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 transition-shadow hover:shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-light-text dark:text-white">Quick Todo</h2>
            <TodoList />
          </div>

          {/* Goals */}
          <GoalStats stats={stats} dailyGoal={dailyGoal} weeklyGoal={weeklyGoal} />
        </div>

        {/* CENTER COLUMN */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Status Badges */}
          <StatusBadges stats={stats} />

          {/* Insights */}
          <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 transition-shadow hover:shadow-xl">
            <h3 className="text-md font-semibold mb-2 text-light-text dark:text-white">Insights</h3>
            <InsightChart stats={stats} />
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">

          {/* Notes */}
          <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 sticky top-6 min-h-162.5 flex flex-col transition-shadow hover:shadow-xl">
            <Notes />
          </div>


        </div>

      </div>
    </div>

  );
}
