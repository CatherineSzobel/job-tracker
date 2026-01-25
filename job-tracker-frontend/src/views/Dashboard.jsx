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

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded shadow">
            <p className="font-semibold mb-2">Total Applications</p>
            <p className="text-xl">{stats.total}</p>

            <p className="font-semibold mb-2">Archived Applications</p>
            <p className="text-xl">{stats.todayApplications}</p>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <p className="font-semibold mb-2">Application Status</p>
            <Status label="Applied" count={stats.applied} total={stats.total} />
            <Status label="Interview" count={stats.interview} total={stats.total} />
            <Status label="Offer" count={stats.offer} total={stats.total} />
            <Status label="Rejected" count={stats.rejected} total={stats.total} />
          </div>

          <div className="p-4 bg-white rounded shadow col-span-2">
            <p className="font-semibold mb-2">Quick Todo</p>

            <TodoList />
          </div>

          <div className="p-4 bg-white rounded shadow">
            <p className="font-semibold mb-2">Goals</p>
            <GoalBar label="Today's Applications" current={stats.todayApplications} goal={dailyGoal} />
            <GoalBar label="This Week's Applications" current={stats.weekApplications} goal={weeklyGoal} />
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
