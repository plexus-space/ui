import type { ApiProp } from "@/components/api-reference-table";

export const violinPlotApiProps: ApiProp[] = [
  {
    name: "data",
    type: "ViolinPlotData[]",
    default: "required",
    description:
      "Array of datasets with name, values array, and optional color for each category",
  },
  {
    name: "xAxis",
    type: "Axis",
    default: "{}",
    description: "X-axis configuration (label, formatter)",
  },
  {
    name: "yAxis",
    type: "Axis",
    default: "{}",
    description: "Y-axis configuration (label, domain, formatter)",
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
    name: "orientation",
    type: '"vertical" | "horizontal"',
    default: '"vertical"',
    description: "Violin plot orientation",
  },
  {
    name: "showBox",
    type: "boolean",
    default: "false",
    description: "Show inner box plot with quartiles",
  },
  {
    name: "showMean",
    type: "boolean",
    default: "false",
    description: "Display mean value marker on each violin",
  },
  {
    name: "bandwidth",
    type: "number | 'auto'",
    default: '"auto"',
    description: "Kernel density estimation bandwidth (auto uses Scott's rule)",
  },
  {
    name: "variant",
    type: '"default" | "minimal" | "scientific" | "dashboard"',
    default: '"default"',
    description: "Visual variant style preset",
  },
  {
    name: "animate",
    type: "boolean",
    default: "false",
    description: "Enable entrance animations",
  },
];
