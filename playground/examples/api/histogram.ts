import type { ApiProp } from "@/components/api-reference-table";

export const histogramApiProps: ApiProp[] = [
  {
    name: "data",
    type: "number[]",
    default: "required",
    description: "Raw data values to bin and visualize",
  },
  {
    name: "bins",
    type: "BinConfig",
    default: '{ count: 10 }',
    description:
      "Bin configuration: count (default 10), width, or explicit edges",
  },
  {
    name: "xAxis",
    type: "HistogramAxis",
    default: "auto",
    description:
      "X-axis (value axis) configuration with domain, label, formatter",
  },
  {
    name: "yAxis",
    type: "HistogramAxis",
    default: "auto",
    description: "Y-axis (frequency/density axis) configuration",
  },
  {
    name: "mode",
    type: '"count" | "density"',
    default: '"count"',
    description: "Display mode: raw counts or normalized density",
  },
  {
    name: "variant",
    type: "HistogramVariant",
    default: '"default"',
    description: 'Visual style: "default", "minimal", "scientific", "dashboard"',
  },
  {
    name: "color",
    type: "string",
    default: '"#06b6d4"',
    description: "Bar fill color in any CSS color format",
  },
  {
    name: "barOpacity",
    type: "number",
    default: "0.8",
    description: "Bar opacity (0.0-1.0)",
  },
  {
    name: "barGap",
    type: "number",
    default: "0.1",
    description: "Gap between bars as fraction of bar width (0.0-0.5)",
  },
  {
    name: "showStats",
    type: "boolean",
    default: "false",
    description: "Display statistical overlays (mean, median, std dev)",
  },
  {
    name: "showMean",
    type: "boolean",
    default: "false",
    description: "Display vertical line at mean value",
  },
  {
    name: "showMedian",
    type: "boolean",
    default: "false",
    description: "Display vertical line at median value",
  },
  {
    name: "animate",
    type: "boolean",
    default: "false",
    description: "Enable entrance animations for bars and grid",
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
];
