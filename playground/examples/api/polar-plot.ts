import type { ApiProp } from "@/components/api-reference-table";

export const polarPlotApiProps: ApiProp[] = [
  {
    name: "series",
    type: "PolarSeries[]",
    default: "required",
    description: "Array of data series with theta, r coordinates",
  },
  {
    name: "axis",
    type: "PolarAxis",
    default: "-",
    description: "Radial domain, rings, angle labels configuration",
  },
  {
    name: "width",
    type: "number",
    default: "600",
    description: "Chart width in pixels",
  },
  {
    name: "height",
    type: "number",
    default: "600",
    description: "Chart height in pixels",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "true",
    description: "Show concentric circles and radial lines",
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "true",
    description: "Show series legend",
  },
  {
    name: "animate",
    type: "boolean",
    default: "true",
    description: "Enable entrance animations",
  },
  {
    name: "variant",
    type: '"polar" | "radar" | "rose"',
    default: '"polar"',
    description: "Plot type: standard polar, radar chart, or rose diagram",
  },
  {
    name: "responsive",
    type: "boolean",
    default: "false",
    description: "Enable responsive container",
  },
  {
    name: "toggleableSeries",
    type: "boolean",
    default: "false",
    description: "Allow series visibility toggle via legend",
  },
  {
    name: "className",
    type: "string",
    default: "-",
    description: "Additional CSS classes for the root element",
  },
];
