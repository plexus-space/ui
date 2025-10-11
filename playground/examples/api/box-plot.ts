import type { ApiProp } from "@/components/api-reference-table";

export const boxPlotApiProps: ApiProp[] = [
  {
    name: "data",
    type: "BoxPlotData[]",
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
    description: "Box plot orientation",
  },
  {
    name: "showMean",
    type: "boolean",
    default: "false",
    description: "Display mean value marker on each box",
  },
  {
    name: "showOutliers",
    type: "boolean",
    default: "true",
    description: "Display outlier points beyond whiskers",
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
