import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ListChecks } from "lucide-react";
import API from "../api/axios";
import TodoList from "../components/ToDoList";
import DashboardTabs from "../components/Dashboard/DashboardTabs";
import ComingUp from "../components/Dashboard/ComingUp";
import Reminders from "../components/Dashboard/Reminders";
import StatusGrid from "../components/Dashboard/Status/StatusGrid";
import GoalStats from "../components/Dashboard/Goals/GoalStats";
import InsightChart from "../components/Dashboard/InsightChart";
import Notes from "../components/Notes";
import PageLoader from "../components/UI/PageLoader";
import { useAuthStore } from "../stores/useAuthStore";
import { DEFAULT_GOALS } from "../constants/jobs";
import { DEFAULT_DASHBOARD_TAB } from "../constants/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Coming up loads its own to-dos; each change in Quick to-dos bumps this so it refetches quietly.
  // A stopgap until TanStack Query.
  const [todoChanges, setTodoChanges] = useState(0);
  const reloadComingUp = () => setTodoChanges((count) => count + 1);

  // /?tab=insights shows Insights; anything else (including the sidebar's plain "/") shows Today
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "insights" ? "insights" : DEFAULT_DASHBOARD_TAB;
  const changeTab = (tabId) => {
    // Clicking the tab you're on shouldn't add a history entry
    if (tabId === activeTab) return;
    setSearchParams(tabId === DEFAULT_DASHBOARD_TAB ? {} : { tab: tabId });
  };

  const user = useAuthStore((state) => state.user);
  const dailyGoal = user?.daily_goal ?? DEFAULT_GOALS.daily_goal;
  const weeklyGoal = user?.weekly_goal ?? DEFAULT_GOALS.weekly_goal;

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await API.get("/job-applications/stats");
      setStats(res.data.data);
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
     <PageLoader text="Loading dashboard..."/>
    );
  }

  return (
    <div className="min-h-screen bg-light p-4 sm:p-6 lg:p-8 dark:bg-dark transition-colors rounded-2xl">
      <DashboardTabs activeTab={activeTab} onChange={changeTab} />

      {/* Only the active tab is rendered: a hidden chart would measure 0 width */}
      {activeTab === "insights" ? (
        <div id="dashboard-panel-insights" role="tabpanel" aria-labelledby="dashboard-tab-insights">
          <StatusGrid stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <GoalStats stats={stats} dailyGoal={dailyGoal} weeklyGoal={weeklyGoal} />
            </div>
            <div className="lg:col-span-7 bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 transition-shadow hover:shadow-xl">
              <h3 className="text-md font-semibold mb-2 text-light-text dark:text-white">Applications Breakdown</h3>
              <InsightChart stats={stats} />
            </div>
          </div>
        </div>
      ) : (
        <div
          id="dashboard-panel-today"
          role="tabpanel"
          aria-labelledby="dashboard-tab-today"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* On phones the two columns stack: Coming up, Reminders, Quick to-dos, Notes */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <ComingUp reloadSignal={todoChanges} />
            {/* Only shows up when an application needs a follow-up */}
            <Reminders />
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 transition-shadow hover:shadow-xl">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-4 text-light-text dark:text-white">
                <ListChecks size={18} aria-hidden="true" />
                Quick to-dos
              </h2>
              <TodoList onTodosChanged={reloadComingUp} />
            </div>

            <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-6 flex flex-col transition-shadow hover:shadow-xl">
              <Notes />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
