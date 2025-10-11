import type { ApiProp } from "@/components/api-reference-table";

export const heatmapApiProps: ApiProp[] = [
  {
    name: "data",
    type: "number[][] | HeatmapCell[]",
    default: "required",
    description: "2D data grid or flat array of cells with x, y, value",
  },
  {
    name: "xLabels",
    type: "string[]",
    default: "-",
    description: "X-axis categorical labels",
  },
  {
    name: "yLabels",
    type: "string[]",
    default: "-",
    description: "Y-axis categorical labels",
  },
  {
    name: "colormap",
    type: "ColormapName",
    default: '"viridis"',
    description: "Scientific colormap (viridis, plasma, coolwarm, etc.)",
  },
  {
    name: "cellShape",
    type: '"square" | "hexagon"',
    default: '"square"',
    description: "Cell shape: square grid or honeycomb hexagons",
  },
  {
    name: "cellGap",
    type: "number",
    default: "0.05",
    description: "Cell gap/padding (0-1, as fraction of cell size)",
  },
  {
    name: "domain",
    type: '[number, number] | "auto"',
    default: '"auto"',
    description: "Value domain [min, max] or auto-calculate",
  },
  {
    name: "showColorbar",
    type: "boolean",
    default: "true",
    description: "Show color scale legend",
  },
  {
    name: "showValues",
    type: "boolean",
    default: "false",
    description: "Show cell values as text",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "true",
    description: "Show grid lines between cells",
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
    default: "600",
    description: "Chart height in pixels",
  },
  {
    name: "responsive",
    type: "boolean",
    default: "false",
    description: "Enable responsive container",
  },
  {
    name: "animate",
    type: "boolean",
    default: "true",
    description: "Enable entrance animations",
  },
  {
    name: "valueFormatter",
    type: "(value: number) => string",
    default: "-",
    description: "Custom value formatting function",
  },
];
