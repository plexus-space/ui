import type { ApiProp } from "@/components/api-reference-table";

export const scatterPlotApiProps: ApiProp[] = [
  {
    name: "series",
    type: "ScatterSeries[]",
    default: "required",
    description:
      "Array of data series to plot. Each series has: name (string), data (ScatterPoint[]), color (optional), radius (optional), opacity (optional), cluster (optional)",
  },
  {
    name: "xAxis",
    type: "Axis",
    default: '{ type: "number", domain: "auto" }',
    description:
      "X-axis configuration (label, domain, type, timezone, formatter)",
  },
  {
    name: "yAxis",
    type: "Axis",
    default: '{ type: "number", domain: "auto" }',
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
    name: "maxPoints",
    type: "number",
    default: "5000",
    description:
      "Maximum points per series before density-aware sampling (preserves outliers and spatial distribution)",
  },
  {
    name: "variant",
    type: '"default" | "minimal" | "scientific" | "dashboard"',
    default: '"default"',
    description: "Visual variant style preset",
  },
  {
    name: "enableZoom",
    type: "boolean",
    default: "false",
    description:
      "Enable zoom and pan interactions (experimental, not yet implemented)",
  },
  {
    name: "animate",
    type: "boolean",
    default: "false",
    description: "Enable entrance animations for points and grid",
  },
  {
    name: "showRegression",
    type: "boolean",
    default: "false",
    description: "Display linear regression line and R² value",
  },
  {
    name: "snapRadius",
    type: "number",
    default: "30",
    description:
      "Snap radius in pixels for point detection during hover (larger values make it easier to hover points)",
  },
];
