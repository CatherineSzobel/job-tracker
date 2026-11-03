import Card, { CardLink } from "../UI/Card";
import { JOB_STATUSES, STATUS_BAR_CLASSES } from "../../constants/jobs";
import { INSIGHT_STAT_TILES } from "../../constants/dashboard";
import BarList from "./BarList";
import SearchInsights from "./SearchInsights";
import StatTile from "./StatTile";
import { percentOf } from "../../utils/percent";

// The Dashboard's Insights tab: four stat tiles, progress towards the goals, applications by status, then how the
// search is going (response and offer rates, days to a first reply, applications by source: searchInsights)
export default function Insights({ stats, dailyGoal, weeklyGoal, searchInsights }) {
  const goals = [
    { label: "Today", current: stats.todayApplications ?? 0, goal: dailyGoal },
    { label: "This week", current: stats.weekApplications ?? 0, goal: weeklyGoal },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-4">
        {INSIGHT_STAT_TILES.map(({ label, valueKey }) => (
          <StatTile key={valueKey} label={label} value={stats[valueKey] ?? 0} />
        ))}
      </ul>

      <div className="flex flex-wrap items-start gap-6">
        <Card title="Goals" action={<CardLink to="/settings#goals">Edit goals</CardLink>} className="flex-[1_1_320px]">
          <div className="flex flex-col gap-6">
            {goals.map(({ label, current, goal }) => (
              <div key={label} className="flex flex-col gap-2">
                <div className="flex justify-between gap-4">
                  <span className="font-semibold">{label}</span>
                  <span className="text-muted">
                    {current} of {goal}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${label}: ${current} of ${goal} applications`}
                  aria-valuenow={current}
                  aria-valuemin={0}
                  aria-valuemax={goal}
                  className="h-2 overflow-hidden rounded-full bg-accent-soft"
                >
                  <div className="h-full rounded-full bg-accent" style={{ width: `${percentOf(current, goal)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Applications by status" className="flex-[2_1_400px]">
          <BarList rows={JOB_STATUSES.map(({ value, label }) => ({ key: value, label, count: stats[value] ?? 0, barClassName: STATUS_BAR_CLASSES[value] }))} />
        </Card>
      </div>

      <SearchInsights insights={searchInsights} />
    </div>
  );
}
