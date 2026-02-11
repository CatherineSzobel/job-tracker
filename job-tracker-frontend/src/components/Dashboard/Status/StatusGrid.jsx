import { Archive, Briefcase, Calendar } from "lucide-react";
import StatCard from "./StatsCard";

const statCards = [
  {
    label: "Total Applications",
    valueKey: "total",
    icon: <Briefcase size={20} />,
    accent: "text-blue-600",
  },
  {
    label: "Archived Applications",
    valueKey: "archived",
    icon: <Archive size={20} />,
    accent: "text-red-600",
  },
  {
    label: "Upcoming Interviews",
    valueKey: "upcomingInterviews",
    icon: <Calendar size={20} />,
    accent: "text-green-600",
  },
];

export default function StatusGrid({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {statCards.map(({ label, valueKey, icon, accent }) => (
        <StatCard
          key={valueKey}
          label={label}
          value={stats?.[valueKey] ?? 0}
          icon={icon}
          accent={accent}
          className="bg-light-soft dark:bg-dark-soft text-light-text dark:text-white transition-colors"
        />
      ))}
    </div>
  );
}
