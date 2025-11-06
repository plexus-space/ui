import type { ApiProp } from "@/components/api-reference-table";

export const waveformMonitorApiProps: ApiProp[] = [
  {
    name: "width",
    type: "number",
    default: "required",
    description: "Canvas width in pixels",
  },
  {
    name: "height",
    type: "number",
    default: "required",
    description: "Canvas height in pixels",
  },
  {
    name: "traces",
    type: "WaveformTrace[]",
    default: "required",
    description:
      "Array of traces: { id: string, data: [x,y][], color?: [r,g,b], label?: string }",
  },
  {
    name: "xDomain",
    type: "[min, max]",
    default: "auto",
    description:
      "X-axis range. Auto-calculated if omitted",
  },
  {
    name: "yDomain",
    type: "[min, max]",
    default: "auto",
    description:
      "Y-axis range. Auto-calculated if omitted",
  },
  {
    name: "margin",
    type: "{ top, right, bottom, left }",
    default: "{ 40, 40, 60, 70 }",
    description: "Plot margins in pixels",
  },
  {
    name: "backgroundColor",
    type: "[r, g, b, a]",
    default: "[0.05, 0.05, 0.08, 1.0]",
    description: "Background as RGBA (0-1 range)",
  },
  {
    name: "onReady",
    type: "() => void",
    default: "-",
    description: "Called when renderer ready",
  },
  {
    name: "onError",
    type: "(error: Error) => void",
    default: "-",
    description: "Called on errors",
  },
  {
    name: "className",
    type: "string",
    default: "-",
    description: "CSS class for container",
  },
  {
    name: "style",
    type: "CSSProperties",
    default: "-",
    description: "Inline styles for container",
  },
  {
    name: "...props",
    type: "HTMLAttributes",
    default: "-",
    description: "All standard div props (onClick, onMouseMove, etc.)",
  },
];
