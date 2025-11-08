import { useColorScheme } from "@/components/color-scheme-provider";
import { useState } from "react";
import { ComponentPreview } from "@/components/component-preview";
import { GanttChart, type Task } from "@plexusui/components/charts/gantt-chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiReferenceTable } from "@/components/api-reference-table";
import { ganttChartApiProps } from "./api/gantt-chart";

export const GanttChartExamples = () => {
  const { color } = useColorScheme();
  const [timezone, setTimezone] = useState("UTC");
  const [timeWindowHours, setTimeWindowHours] = useState(12);

  const now = new Date();
  const baseTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    8,
    0,
    0
  );

  // Ground station pass schedule
  const groundStationPasses = [
    {
      id: "p1",
      name: "Sentinel-1A",
      start: new Date(baseTime.getTime() - 120 * 60000), // 06:00
      end: new Date(baseTime.getTime() - 108 * 60000), // 06:12
      status: "completed" as const,
      description: "SAR data downlink",
      color: color,
    },
    {
      id: "p2",
      name: "ISS Pass",
      start: new Date(baseTime.getTime() - 60 * 60000), // 07:00
      end: new Date(baseTime.getTime() - 45 * 60000), // 07:15
      status: "completed" as const,
      description: "Low elevation pass",
      color: color,
    },
    {
      id: "p3",
      name: "NOAA-19",
      start: new Date(baseTime.getTime() - 15 * 60000), // 07:45
      end: new Date(baseTime.getTime() - 3 * 60000), // 07:57
      status: "completed" as const,
      description: "Weather imagery",
      color: color,
    },
    {
      id: "p4",
      name: "NOAA-18 Downlink",
      start: new Date(baseTime.getTime() + 20 * 60000), // 08:20
      end: new Date(baseTime.getTime() + 32 * 60000), // 08:32
      status: "in-progress" as const,
      description: "Weather data acquisition",
      color: color,
    },
    {
      id: "p5",
      name: "TerraSAR-X",
      start: new Date(baseTime.getTime() + 95 * 60000), // 09:35
      end: new Date(baseTime.getTime() + 108 * 60000), // 09:48
      status: "planned" as const,
      description: "Radar imaging pass",
      color: color,
    },
    {
      id: "p7",
      name: "Aqua",
      start: new Date(baseTime.getTime() + 255 * 60000), // 12:15
      end: new Date(baseTime.getTime() + 270 * 60000), // 12:30
      status: "planned" as const,
      description: "MODIS data collection",
      color: color,
    },
    {
      id: "p8",
      name: "Landsat 9 TLM",
      start: new Date(baseTime.getTime() + 335 * 60000), // 13:35
      end: new Date(baseTime.getTime() + 350 * 60000), // 13:50
      status: "planned" as const,
      description: "Earth observation data",
      color: color,
    },
    {
      id: "p9",
      name: "MetOp-B",
      start: new Date(baseTime.getTime() + 425 * 60000), // 15:05
      end: new Date(baseTime.getTime() + 437 * 60000), // 15:17
      status: "planned" as const,
      description: "Meteorological data",
      color: color,
    },
    {
      id: "p10",
      name: "Sentinel-3B",
      start: new Date(baseTime.getTime() + 510 * 60000), // 16:30
      end: new Date(baseTime.getTime() + 523 * 60000), // 16:43
      status: "planned" as const,
      description: "Ocean monitoring",
      color: color,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Controls */}
      <div className="flex items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Timezone:
          </label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">America/New_York</SelectItem>
              <SelectItem value="America/Los_Angeles">
                America/Los_Angeles
              </SelectItem>
              <SelectItem value="America/Chicago">America/Chicago</SelectItem>
              <SelectItem value="Europe/London">Europe/London</SelectItem>
              <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
              <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
              <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Time Window:
          </label>
          <Select
            value={timeWindowHours.toString()}
            onValueChange={(v) => setTimeWindowHours(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 hours</SelectItem>
              <SelectItem value="8">8 hours</SelectItem>
              <SelectItem value="12">12 hours</SelectItem>
              <SelectItem value="24">24 hours</SelectItem>
              <SelectItem value="48">48 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ComponentPreview
        title="Ground Station Pass Schedule"
        description="Satellite contact windows with precise timing for ground station operations. Shows pass duration in minutes with 15-minute grid intervals. Use the controls above to change timezone and time window."
        preview={
          <div className="space-y-4">
            <GanttChart
              tasks={groundStationPasses}
              timezone={timezone}
              rowHeight={50}
              timeWindowHours={timeWindowHours}
              startTime={baseTime}
              interactive={true}
              onTaskClick={(task: Task) => console.log("Clicked:", task.name)}
              variant="compact"
            >
              <div className="flex justify-end p-4 w-full">
                <GanttChart.Controls />
              </div>
              <GanttChart.Container>
                <GanttChart.Viewport>
                  <GanttChart.Grid />
                  <GanttChart.Header />
                  <GanttChart.Tasks />
                  <GanttChart.CurrentTime />
                </GanttChart.Viewport>
                <GanttChart.LeftPanel />
              </GanttChart.Container>
            </GanttChart>
          </div>
        }
        code={`<div className="space-y-4">
  <GanttChart
    tasks={groundStationPasses}
    timezone={timezone}
    rowHeight={50}
    timeWindowHours={timeWindowHours}
    startTime={baseTime}
    interactive={true}
    onTaskClick={(task) => console.log("Clicked:", task.name)}
    variant="compact"
  >
    <div className="flex justify-end p-4 w-full">
      <GanttChart.Controls />
    </div>
    <GanttChart.Container>
      <GanttChart.Viewport>
        <GanttChart.Grid />
        <GanttChart.Header />
        <GanttChart.Tasks />
        <GanttChart.CurrentTime />
      </GanttChart.Viewport>
      <GanttChart.LeftPanel />
    </GanttChart.Container>
  </GanttChart>
</div>`}
      />

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">API Reference</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          GanttChart is a primitive component. Use the all-in-one component or
          compose with primitives for full control.
        </p>
        <div className="mb-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
          <h4 className="text-sm font-semibold mb-2">Features</h4>
          <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1 list-disc list-inside">
            <li>
              <strong>Infinite Scroll:</strong> Automatically loads 7 more days
              when scrolling near edges (left or right)
            </li>
            <li>
              <strong>Drag to Scroll:</strong> Click and drag anywhere on the
              timeline to pan horizontally
            </li>
            <li>
              <strong>Zoom Controls:</strong> Zoom from 0.07x (week view) to 4x
              with themed controls and icons
            </li>
            <li>
              <strong>Real-time Indicator:</strong> Live current time marker
              updates every second
            </li>
            <li>
              <strong>Primitive-based:</strong> Compose with Root, Container,
              Viewport, Grid, Header, Tasks, CurrentTime, LeftPanel, and
              Controls
            </li>
          </ul>
        </div>
        <ApiReferenceTable props={ganttChartApiProps} />
      </div>
    </div>
  );
};

export { ganttChartApiProps as GanttChartApiReference } from "./api/gantt-chart";
