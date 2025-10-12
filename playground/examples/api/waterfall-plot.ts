import type { ApiProp } from "@/components/api-reference-table";

export const waterfallPlotApiProps: ApiProp[] = [
  {
    name: "data",
    type: "WaterfallDataPoint[]",
    default: "required",
    description:
      "Array of data points with x, y, z coordinates for 3D waterfall visualization",
  },
  {
    name: "xAxis",
    type: "WaterfallAxis",
    default: '{ domain: "auto" }',
    description:
      "X-axis configuration (label, domain, formatter) - typically wavelength or frequency",
  },
  {
    name: "yAxis",
    type: "WaterfallAxis",
    default: '{ domain: "auto" }',
    description:
      "Y-axis configuration (label, domain, formatter) - typically time or position",
  },
  {
    name: "zAxis",
    type: "WaterfallAxis",
    default: '{ domain: "auto" }',
    description:
      "Z-axis configuration (label, domain, formatter) - typically intensity or magnitude",
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
    default: "500",
    description: "Chart height in pixels",
  },
  {
    name: "colorScale",
    type: '"viridis" | "plasma" | "inferno" | "magma" | "jet" | "hot" | "cool" | "turbo" | "rainbow"',
    default: '"jet"',
    description:
      "Color scale for Y-value visualization (each line colored by its Y position)",
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
    description: "Enable entrance animations for waterfall lines",
  },
  {
    name: "showColorBar",
    type: "boolean",
    default: "true",
    description: "Show color bar legend displaying Y-axis scale",
  },
  {
    name: "lineWidth",
    type: "number",
    default: "1.5",
    description: "Width of waterfall trace lines in pixels",
  },
  {
    name: "fillLines",
    type: "boolean",
    default: "true",
    description: "Enable semi-transparent fill under waterfall curves",
  },
  {
    name: "viewAngle",
    type: "number",
    default: "30",
    description:
      "3D viewing angle in degrees (0-90), affects perspective projection",
  },
  {
    name: "rotationAngle",
    type: "number",
    default: "0",
    description:
      "Horizontal rotation angle in degrees (-180 to 180), rotates chart around vertical axis",
  },
  {
    name: "enableRotation",
    type: "boolean",
    default: "false",
    description:
      "Enable interactive rotation via mouse drag (cursor changes to grab/grabbing)",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "true",
    description:
      "Show grid lines on base plane for better depth perception and accuracy",
  },
];
