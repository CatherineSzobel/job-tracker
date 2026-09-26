import ReactECharts from "echarts-for-react";
import { JOB_STATUSES, STATUS_COLORS } from "../../constants/jobs";

export default function InsightChart({ stats }) {
  const data = [
    ...JOB_STATUSES.map(({ value, label }) => ({
      value: stats[value],
      name: label,
      itemStyle: { color: STATUS_COLORS[value] },
    })),
    { value: stats.archived, name: "Archived", itemStyle: { color: STATUS_COLORS.archived } },
  ];

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
      textStyle: {
        color: "var(--color-white-text)", 
      },
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      left: "center",
      itemGap: 20,
      textStyle: {
        fontSize: 12,
        color: "var(--color-white-text)",
      },
    },
    series: [
      {
        name: "Applications",
        type: "pie",
        radius: ["35%", "65%"], 
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 5,
          borderColor: "var(--color-dark-soft)",
          borderWidth: 2,
        },
        label: {
          show: true,
          position: "outside",
          formatter: "{b}: {c} ({d}%)",
          fontSize: 12,
          color: "var(--color-white-text)",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        labelLine: {
          length: 10,
          length2: 10,
        },
        data: data,
      },
    ],
  };

  return (
    <div className="bg-light-soft dark:bg-dark-soft shadow-md rounded-2xl p-4 sm:p-6 lg:p-6 transition-colors hover:shadow-xl">
      <h3 className="text-md font-semibold mb-4 text-light-text dark:text-dark-text">
        Applications Breakdown
      </h3>
      <ReactECharts
        option={option}
        style={{ width: "100%", minHeight: 250 }}
        className="w-full h-full"
        opts={{ renderer: "svg" }}
      />
    </div>
  );
}
