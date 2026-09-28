import ReactECharts from "echarts-for-react";
import { JOB_STATUSES, STATUS_COLORS } from "../../constants/jobs";
import { useThemeStore } from "../../stores/useThemeStore";

// ECharts draws SVG attributes, which can't use CSS variables, so read the theme tokens' actual values
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

// The chart only: the surrounding card and heading are in Dashboard
export default function InsightChart({ stats }) {
  const darkMode = useThemeStore((state) => state.darkMode); // re-render with the new colors on toggle
  const textColor = cssVar(darkMode ? "--color-dark-text" : "--color-light-text");
  const cardColor = cssVar(darkMode ? "--color-dark-soft" : "--color-light-soft");

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
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      left: "center",
      itemGap: 20,
      textStyle: {
        fontSize: 12,
        color: textColor,
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
          borderColor: cardColor, // gaps between slices match the card background
          borderWidth: 2,
        },
        label: {
          show: true,
          position: "outside",
          formatter: "{b}: {c} ({d}%)",
          fontSize: 12,
          color: textColor,
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
        data,
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ width: "100%", minHeight: 250 }}
      opts={{ renderer: "svg" }}
    />
  );
}
