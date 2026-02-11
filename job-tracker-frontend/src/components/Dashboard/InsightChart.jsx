import React from "react";
import ReactECharts from "echarts-for-react";

export default function InsightChart({ stats }) {
  const data = [
    { value: stats.applied, name: "Applied", itemStyle: { color: "#3b82f6" } },     // Blue
    { value: stats.interview, name: "Interview", itemStyle: { color: "#facc15" } }, // Yellow
    { value: stats.offer, name: "Offer", itemStyle: { color: "#22c55e" } },         // Green
    { value: stats.rejected, name: "Rejected", itemStyle: { color: "#ef4444" } },   // Red
    { value: stats.archived, name: "Archived", itemStyle: { color: "#06b6d4" } },   // Teal
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
