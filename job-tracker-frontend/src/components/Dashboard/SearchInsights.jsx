import { useEffect, useState } from "react";
import API from "../../api/axios";
import Card from "../UI/Card";
import PageLoader from "../UI/PageLoader";
import { sourceLabel } from "../../constants/jobs";
import { countOf } from "../../utils/plural";

// How the search is going (GET /job-applications/insights, InsightsService): three tiles with what each number
// is based on, and applications by source. A rate is "—" until there's something to base it on.
export default function SearchInsights() {
  const [insights, setInsights] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    API.get("/job-applications/insights")
      .then((res) => setInsights(res.data.data))
      .catch((err) => {
        console.error(err);
        setFailed(true);
      });
  }, []);

  if (failed) return <p className="text-muted">Couldn't load the search insights.</p>;
  if (!insights) return <PageLoader text="Loading insights..." compact />;

  const tiles = [
    {
      label: "Response rate",
      value: insights.response_rate === null ? "—" : `${insights.response_rate}%`,
      note: `${insights.responded} of ${countOf(insights.applied, "application")} got a reply`,
    },
    {
      label: "Interview → offer",
      value: insights.offer_rate === null ? "—" : `${insights.offer_rate}%`,
      note: `${insights.offers} of ${insights.interviewed} interviewed got an offer`,
    },
    {
      label: "Days to first reply",
      value: insights.average_days_to_reply === null ? "—" : `${insights.average_days_to_reply}`,
      note: insights.timed_replies === 0 ? "Shows once replies come in" : `Average of ${countOf(insights.timed_replies, "reply", "replies")}`,
    },
  ];
  const largestSource = Math.max(0, ...insights.by_source.map(({ count }) => count));

  return (
    <div className="flex flex-wrap items-start gap-6">
      <ul className="grid flex-[2_1_400px] grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-4">
        {tiles.map(({ label, value, note }) => (
          <li key={label} className="card flex flex-col gap-2">
            {/* Two lines reserved for the label, so the numbers line up when one wraps; stacked from the top, so a
                longer note doesn't push its number out of line */}
            <span className="min-h-12 font-medium text-muted">{label}</span>
            <span className="text-[40px] leading-12 font-bold">{value}</span>
            <span className="text-sm text-muted">{note}</span>
          </li>
        ))}
      </ul>

      <Card title="Applications by source" className="flex-[1_1_320px]">
        {insights.by_source.length === 0 ? (
          <p className="text-muted">No applications yet.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {insights.by_source.map(({ source, count }) => (
              <li key={source ?? "none"} className="grid grid-cols-[136px_minmax(0,1fr)_32px] items-center gap-4">
                <span className="font-medium">{source ? sourceLabel(source) : "Not set"}</span>
                <div className="h-6 rounded bg-soft">
                  <div className="h-full rounded bg-accent" style={{ width: `${(count / largestSource) * 100}%` }} />
                </div>
                <span className="text-right font-bold">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
