import type { ApiProp } from "@/components/api-reference-table";

export const barChartApiProps: ApiProp[] = [
  {
    name: "series",
    type: "BarSeries[]",
    default: "required",
    description:
      "Array of data series to plot. Each series has: name (string), data (BarDataPoint[]), color (optional), opacity (optional)",
  },
  {
    name: "xAxis",
    type: "Axis",
    default: "{}",
    description:
      "X-axis configuration (label, domain, type, timezone, formatter)",
  },
  {
    name: "yAxis",
    type: "Axis",
    default: "{}",
    description:
      "Y-axis configuration (label, domain, type, timezone, formatter)",
  },
  {
    name: "width",
    type: "number",
    default: "800",
    description: "Chart width in pixels",
  },
  {
    name: "height",
    type: "number",
    default: "400",
    description: "Chart height in pixels",
  },
  {
    name: "variant",
    type: '"default" | "minimal" | "scientific" | "dashboard"',
    default: '"default"',
    description: "Visual variant style",
  },
  {
    name: "orientation",
    type: '"vertical" | "horizontal"',
    default: '"vertical"',
    description: "Bar orientation (vertical or horizontal)",
  },
  {
    name: "mode",
    type: '"grouped" | "stacked"',
    default: '"grouped"',
    description: "Grouping mode for multiple series (grouped or stacked)",
  },
  {
    name: "barWidth",
    type: "number",
    default: "0.8",
    description: "Bar width as a percentage (0-1) of available space",
  },
  {
    name: "barGap",
    type: "number",
    default: "0.05",
    description: "Gap between bars in a group as a percentage",
  },
  {
    name: "groupGap",
    type: "number",
    default: "0.2",
    description: "Gap between groups as a percentage",
  },
  {
    name: "animate",
    type: "boolean",
    default: "false",
    description: "Enable animations for chart transitions",
  },
];
