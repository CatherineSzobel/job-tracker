import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import API from "../api/axios";
import TodoList from "../components/ToDoList";
import useTodos from "../components/Todo/useTodos";
import Tabs, { TabPanel } from "../components/UI/Tabs";
import PageHeader from "../components/UI/PageHeader";
import ComingUp from "../components/Dashboard/ComingUp";
import Reminders from "../components/Dashboard/Reminders";
import Insights from "../components/Dashboard/Insights";
import useComingUp from "../components/Dashboard/useComingUp";
import Notes from "../components/Notes";
import PageLoader from "../components/UI/PageLoader";
import { useAuthStore } from "../stores/useAuthStore";
import { DEFAULT_GOALS } from "../constants/jobs";
import { DASHBOARD_TABS, DEFAULT_DASHBOARD_TAB } from "../constants/dashboard";
import { countOf } from "../utils/plural";

// "Good morning" / "Good afternoon" / "Good evening" by the browser's clock
const greetingFor = (date) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// "Thursday 8 October · 3 interviews and 2 to-dos coming up" (the date alone while the week is loading)
const summaryFor = (date, days, loading) => {
  const dateLabel = format(date, "EEEE d MMMM");
  if (loading) return dateLabel;

  const interviewCount = days.reduce((total, day) => total + day.interviews.length, 0);
  const todoCount = days.reduce((total, day) => total + day.todos.length, 0);
  const parts = [interviewCount && countOf(interviewCount, "interview"), todoCount && countOf(todoCount, "to-do")].filter(Boolean);
  if (parts.length === 0) return `${dateLabel} · nothing coming up this week`;
  return `${dateLabel} · ${parts.join(" and ")} coming up`;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // One to-do list for the page: Quick to-dos changes it and Coming up shows it, so both stay in step
  const todoList = useTodos();
  const comingUp = useComingUp(todoList.todos);

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
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const now = new Date();

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
    <div className="flex flex-col gap-6">
      <PageHeader
        title={firstName ? `${greetingFor(now)}, ${firstName}` : greetingFor(now)}
        description={summaryFor(now, comingUp.days, comingUp.loading || todoList.loading)}
        actions={<Tabs tabs={DASHBOARD_TABS} activeTab={activeTab} onChange={changeTab} idPrefix="dashboard" label="Dashboard views" />}
      />

      {/* Only the active tab is rendered */}
      {activeTab === "insights" ? (
        <TabPanel idPrefix="dashboard" tabId="insights">
          {/* Only Insights needs the stats, so Today doesn't wait for them */}
          {loading ? (
            <PageLoader text="Loading insights..." />
          ) : (
            <Insights stats={stats} dailyGoal={dailyGoal} weeklyGoal={weeklyGoal} />
          )}
        </TabPanel>
      ) : (
        <TabPanel idPrefix="dashboard" tabId="today" className="flex flex-wrap items-start gap-6">
          {/* On phones the two columns stack: Coming up, Time to follow up, Quick to-dos, Notes */}
          <div className="flex min-w-0 flex-[3_1_480px] flex-col gap-6">
            <ComingUp days={comingUp.days} loading={comingUp.loading || todoList.loading} />
            <Reminders />
          </div>

          <div className="flex min-w-0 flex-[2_1_320px] flex-col gap-6">
            <TodoList {...todoList} />
            <Notes />
          </div>
        </TabPanel>
      )}
    </div>
  );
}
