import Card, { CardLink } from "../UI/Card";
import { JOB_STATUSES } from "../../constants/jobs";

const STAT_TILES = [
  { label: "Total applications", valueKey: "total" },
  { label: "Applied today", valueKey: "todayApplications" },
  { label: "Applied this week", valueKey: "weekApplications" },
  { label: "Upcoming interviews", valueKey: "upcomingInterviews" },
];

// Full class strings (not built at runtime) so Tailwind can find them
const STATUS_BAR_CLASSES = {
  applied: "bg-accent",
  interview: "bg-bar-interview",
  offer: "bg-bar-offer",
  rejected: "bg-bar-rejected",
};

const percentOf = (part, whole) => (whole > 0 ? Math.min((part / whole) * 100, 100) : 0);

// The Dashboard's Insights tab: four stat tiles, progress towards the goals, and applications by status
export default function Insights({ stats, dailyGoal, weeklyGoal }) {
  const goals = [
    { label: "Today", current: stats.todayApplications ?? 0, goal: dailyGoal },
    { label: "This week", current: stats.weekApplications ?? 0, goal: weeklyGoal },
  ];
  const largestStatus = Math.max(...JOB_STATUSES.map(({ value }) => stats[value] ?? 0));

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-4">
        {STAT_TILES.map(({ label, valueKey }) => (
          <li key={valueKey} className="card flex flex-col justify-between gap-2">
            {/* Two lines reserved for the label, so the numbers line up when one wraps */}
            <span className="min-h-12 font-medium text-muted">{label}</span>
            <span className="text-[40px] leading-12 font-bold">{stats[valueKey] ?? 0}</span>
          </li>
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
          <ul className="flex flex-col gap-4">
            {JOB_STATUSES.map(({ value, label }) => {
              const count = stats[value] ?? 0;
              return (
                <li key={value} className="grid grid-cols-[88px_minmax(0,1fr)_32px] items-center gap-4">
                  <span className="font-medium">{label}</span>
                  <div className="h-6 rounded bg-soft">
                    <div className={`h-full rounded ${STATUS_BAR_CLASSES[value]}`} style={{ width: `${percentOf(count, largestStatus)}%` }} />
                  </div>
                  <span className="text-right font-bold">{count}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
