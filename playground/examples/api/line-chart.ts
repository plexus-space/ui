import type { ApiProp } from "@/components/api-reference-table";

export const lineChartApiProps: ApiProp[] = [
  {
    name: "series",
    type: "Series[]",
    default: "required",
    description:
      "Array of data series to plot (name, data, color, strokeWidth, dashed, filled)",
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
    default: "2000",
    description: "Max points per series before automatic decimation",
  },
  {
    name: "magneticCrosshair",
    type: "boolean",
    default: "true",
    description: "Enable magnetic crosshair that snaps to nearest data point",
  },
  {
    name: "unifiedTooltip",
    type: "boolean",
    default: "false",
    description:
      "Show unified tooltip with all series values at same x-coordinate",
  },
  {
    name: "variant",
    type: '"default" | "minimal" | "scientific" | "dashboard"',
    default: '"default"',
    description: "Visual variant style preset",
  },
  {
    name: "snapRadius",
    type: "number",
    default: "40",
    description: "Snap radius in pixels for point detection during hover",
  },
  {
    name: "enableZoom",
    type: "boolean",
    default: "false",
    description: "Enable zoom and pan interactions (experimental)",
  },
  {
    name: "animate",
    type: "boolean",
    default: "false",
    description: "Enable entrance animations for lines and grid",
  },
];
