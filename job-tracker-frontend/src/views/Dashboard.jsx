import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ListChecks } from "lucide-react";
import API from "../api/axios";
import TodoList from "../components/ToDoList";
import useTodos from "../components/Todo/useTodos";
import DashboardTabs, { DashboardTabPanel } from "../components/Dashboard/DashboardTabs";
import ComingUp from "../components/Dashboard/ComingUp";
import Reminders from "../components/Dashboard/Reminders";
import StatusGrid from "../components/Dashboard/Status/StatusGrid";
import GoalStats from "../components/Dashboard/Goals/GoalStats";
import InsightChart from "../components/Dashboard/InsightChart";
import Notes from "../components/Notes";
import PageLoader from "../components/UI/PageLoader";
import { useAuthStore } from "../stores/useAuthStore";
import { DEFAULT_GOALS } from "../constants/jobs";
import { DASHBOARD_TABS, DEFAULT_DASHBOARD_TAB } from "../constants/dashboard";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // One to-do list for the page: Quick to-dos changes it and Coming up shows it, so both stay in step
  const todoList = useTodos();

  // /?tab=insights shows Insights; anything else (including the sidebar's plain "/") shows Today
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab = DASHBOARD_TABS.some((tab) => tab.id === requestedTab) ? requestedTab : DEFAULT_DASHBOARD_TAB;
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

  return (
    <div className="min-h-screen bg-light p-4 sm:p-6 lg:p-8 dark:bg-dark transition-colors rounded-2xl">
      <DashboardTabs activeTab={activeTab} onChange={changeTab} />

      {/* Only the active tab is rendered: a hidden chart would measure 0 width */}
      {activeTab === "insights" ? (
        <DashboardTabPanel tabId="insights">
          {/* Only Insights needs the stats, so Today doesn't wait for them */}
          {loading ? (
            <PageLoader text="Loading insights..." />
          ) : (
            <>
              <StatusGrid stats={stats} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5">
                  <GoalStats stats={stats} dailyGoal={dailyGoal} weeklyGoal={weeklyGoal} />
                </div>
                <div className="lg:col-span-7 card">
                  <h3 className="text-md font-semibold mb-2 text-light-text dark:text-white">Applications Breakdown</h3>
                  <InsightChart stats={stats} />
                </div>
              </div>
            </>
          )}
        </DashboardTabPanel>
      ) : (
        <DashboardTabPanel tabId="today" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* On phones the two columns stack: Coming up, Reminders, Quick to-dos, Notes */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <ComingUp todos={todoList.todos} todosLoading={todoList.loading} />
            <Reminders />
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="card">
              <h2 className="card-title mb-4">
                <ListChecks size={18} aria-hidden="true" />
                Quick to-dos
              </h2>
              <TodoList {...todoList} />
            </div>

            <div className="card flex flex-col">
              <Notes />
            </div>
          </div>
        </DashboardTabPanel>
      )}
    </div>
  );
}
