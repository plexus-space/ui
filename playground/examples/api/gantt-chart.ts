import type { ApiProp } from "@/components/api-reference-table";

export const ganttChartApiProps: ApiProp[] = [
  {
    name: "tasks",
    type: "Task[]",
    default: "required",
    description:
      "Array of tasks with id, name, start, end, status, color, description",
  },
  {
    name: "timezone",
    type: "string",
    default: '"UTC"',
    description: 'IANA timezone (e.g., "America/New_York", "Europe/London")',
  },
  {
    name: "width",
    type: "number",
    default: "1200",
    description: "Chart width in pixels (auto-detects container width if omitted)",
  },
  {
    name: "rowHeight",
    type: "number",
    default: "48",
    description: "Height of each task row in pixels",
  },
  {
    name: "timeWindowHours",
    type: "number",
    default: "12",
    description: "Visible time window in hours (zoom controls: 0.07x-4x range, supports up to week view)",
  },
  {
    name: "startTime",
    type: "Date | number",
    default: "new Date()",
    description: "Chart start time (infinite scroll: starts with 30-day window, auto-expands 7 days when near edges)",
  },
  {
    name: "interactive",
    type: "boolean",
    default: "true",
    description: "Enable hover tooltips and task interactions",
  },
  {
    name: "onTaskClick",
    type: "(task: Task) => void",
    default: "-",
    description: "Callback when task is clicked",
  },
  {
    name: "variant",
    type: '"default" | "compact" | "detailed"',
    default: '"default"',
    description:
      "Visual density: compact (160px), default (200px), detailed (240px)",
  },
  {
    name: "className",
    type: "string",
    default: "-",
    description: "Additional CSS classes for the root element",
  },
  {
    name: "use12HourFormat",
    type: "boolean",
    default: "false",
    description: "Use 12-hour time format instead of 24-hour",
  },
];
