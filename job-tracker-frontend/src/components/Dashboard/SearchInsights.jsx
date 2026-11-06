import Card from "../UI/Card";
import PageLoader from "../UI/PageLoader";
import { sourceLabel } from "../../constants/jobs";
import { countOf } from "../../utils/plural";
import BarList from "./BarList";
import StatTile from "./StatTile";

// How the search is going (GET /job-applications/insights, InsightsService): three tiles with what each number
// is based on, and applications by source. A rate is "—" until there's something to base it on.
// insights: the response's data, null while loading, false when it failed (the Dashboard loads it once).
export default function SearchInsights({ insights }) {
  if (insights === false) return <p className="text-muted">Couldn't load the search insights.</p>;
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

  return (
    <div className="flex flex-wrap items-start gap-6">
      <ul className="grid flex-[2_1_400px] grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-4">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </ul>

      <Card title="Applications by source" className="flex-[1_1_320px]">
        {insights.by_source.length === 0 ? (
          <p className="text-muted">No applications yet.</p>
        ) : (
          <BarList rows={insights.by_source.map(({ source, count }) => ({ key: source ?? "none", label: source ? sourceLabel(source) : "Not set", count }))} />
        )}
      </Card>
    </div>
  );
}
