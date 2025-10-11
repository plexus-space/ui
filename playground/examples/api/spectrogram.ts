import type { ApiProp } from "@/components/api-reference-table";

export const spectrogramApiProps: ApiProp[] = [
  {
    name: "data",
    type: "SpectrogramDataPoint[] | SpectrogramTimeSeries",
    default: "required",
    description:
      "Spectrogram data points OR time series for automatic FFT transformation",
  },
  {
    name: "timeAxis",
    type: "SpectrogramAxis",
    default: '{ type: "number", domain: "auto" }',
    description:
      "Time axis configuration (label, domain, type, timezone, formatter)",
  },
  {
    name: "frequencyAxis",
    type: "SpectrogramAxis",
    default: '{ type: "number", domain: "auto" }',
    description:
      "Frequency axis configuration (label, domain, type, timezone, formatter)",
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
    name: "colorScale",
    type: '"viridis" | "plasma" | "inferno" | "magma" | "jet" | "hot" | "cool" | "turbo"',
    default: '"viridis"',
    description: "Color scale for magnitude visualization",
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
  {
    name: "showColorBar",
    type: "boolean",
    default: "true",
    description: "Show color bar legend displaying magnitude scale",
  },
  {
    name: "magnitudeScale",
    type: '"linear" | "log" | "decibel"',
    default: '"linear"',
    description: "Magnitude scale type (linear, logarithmic, or decibel)",
  },
  {
    name: "frequencyBins",
    type: "number",
    default: "128",
    description: "Number of frequency bins for FFT processing",
  },
];
