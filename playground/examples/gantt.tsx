"use client";

import { useState } from "react";
import { GanttChart } from "@plexusui/components/charts/gantt";
import type { Task } from "@plexusui/components/charts/gantt";
import { ComponentPreview } from "@/components/component-preview";
import { addHours, addMinutes } from "date-fns";

function SatelliteContactSchedule() {
  const now = new Date();

  const [tasks] = useState<Task[]>([
    {
      id: "gs1-contact",
      name: "GS-1 Telemetry",
      start: addMinutes(now, -30),
      end: addMinutes(now, 45),
      status: "in-progress",
      description: "Telemetry downlink and command uplink",
    },
    {
      id: "gs2-contact",
      name: "GS-2 Science Data",
      start: addHours(now, 2),
      end: addHours(now, 3.5),
      status: "planned",
      description: "High-rate science data transfer",
    },
    {
      id: "gs3-contact",
      name: "GS-3 Maintenance",
      start: addHours(now, 5),
      end: addHours(now, 6),
      status: "planned",
      description: "Scheduled maintenance window",
    },
    {
      id: "gs1-contact-2",
      name: "GS-1 Telemetry",
      start: addHours(now, 7.5),
      end: addHours(now, 9),
      status: "planned",
      description: "Evening telemetry pass",
    },
    {
      id: "gs4-contact",
      name: "GS-4 Emergency",
      start: addHours(now, 4),
      end: addHours(now, 4.5),
      status: "blocked",
      description: "Weather hold - storm warning",
    },
  ]);

  return (
    <ComponentPreview
      title="Satellite Ground Station Schedule"
      description="Real-time ground station contact scheduling with live time indicator. Interactive timeline with zoom controls and drag-to-scroll."
      code={`import { GanttChart } from "@plexusui/components/charts/gantt";
import { addHours, addMinutes } from "date-fns";

const now = new Date();

const tasks = [
  {
    id: "gs1-contact",
    name: "GS-1 Telemetry",
    start: addMinutes(now, -30),
    end: addMinutes(now, 45),
    status: "in-progress",
    description: "Telemetry downlink and command uplink",
  },
  {
    id: "gs2-contact",
    name: "GS-2 Science Data",
    start: addHours(now, 2),
    end: addHours(now, 3.5),
    status: "planned",
    description: "High-rate science data transfer",
  },
  // ... more tasks
];

<GanttChart
  tasks={tasks}
  timezone="UTC"
  timeWindowHours={12}
  onTaskClick={(task) => console.log('Clicked:', task.name)}
/>`}
      preview={
        <div className="w-full">
          <GanttChart
            tasks={tasks}
            timezone="UTC"
            timeWindowHours={12}
            onTaskClick={(task) => alert(`Clicked: ${task.name}`)}
          />
        </div>
      }
    />
  );
}

function MissionOperationsTimeline() {
  const now = new Date();

  const [tasks] = useState<Task[]>([
    {
      id: "prelaunch",
      name: "Pre-Launch Checks",
      start: addHours(now, -1),
      end: addMinutes(now, -15),
      status: "completed",
      color: "#10b981",
    },
    {
      id: "launch",
      name: "Launch Window",
      start: addMinutes(now, -15),
      end: addMinutes(now, 5),
      status: "in-progress",
      color: "#3b82f6",
    },
    {
      id: "stage1-sep",
      name: "Stage 1 Separation",
      start: addMinutes(now, 5),
      end: addMinutes(now, 8),
      status: "planned",
      color: "#8b5cf6",
    },
    {
      id: "stage2-burn",
      name: "Stage 2 Burn",
      start: addMinutes(now, 8),
      end: addMinutes(now, 25),
      status: "planned",
      color: "#8b5cf6",
    },
    {
      id: "payload-deploy",
      name: "Payload Deployment",
      start: addMinutes(now, 25),
      end: addMinutes(now, 35),
      status: "planned",
      color: "#f59e0b",
    },
    {
      id: "orbit-adjust",
      name: "Orbit Adjustment",
      start: addMinutes(now, 35),
      end: addMinutes(now, 55),
      status: "planned",
      color: "#06b6d4",
    },
  ]);

  return (
    <ComponentPreview
      title="Launch Mission Timeline"
      description="Critical mission phase tracking with custom colors and compact variant. Hover over tasks to see detailed timing information."
      code={`const tasks = [
  {
    id: "launch",
    name: "Launch Window",
    start: addMinutes(now, -15),
    end: addMinutes(now, 5),
    status: "in-progress",
    color: "#3b82f6",
  },
  {
    id: "stage1-sep",
    name: "Stage 1 Separation",
    start: addMinutes(now, 5),
    end: addMinutes(now, 8),
    status: "planned",
    color: "#8b5cf6",
  },
  // ... more phases
];

<GanttChart
  tasks={tasks}
  variant="compact"
  timeWindowHours={2}
  rowHeight={40}
/>`}
      preview={
        <div className="w-full">
          <GanttChart
            tasks={tasks}
            variant="compact"
            timeWindowHours={2}
            rowHeight={40}
          />
        </div>
      }
    />
  );
}

function DetailedMaintenanceSchedule() {
  const now = new Date();

  const [tasks] = useState<Task[]>([
    {
      id: "thermal-system",
      name: "Thermal System",
      start: addHours(now, 1),
      end: addHours(now, 3),
      status: "planned",
      description: "Routine thermal control system inspection",
    },
    {
      id: "power-system",
      name: "Power System",
      start: addHours(now, 3.5),
      end: addHours(now, 5),
      status: "planned",
      description: "Solar array efficiency check and battery calibration",
    },
    {
      id: "comms-system",
      name: "Communications",
      start: addHours(now, 5.5),
      end: addHours(now, 7),
      status: "planned",
      description: "Transponder alignment and signal strength test",
    },
    {
      id: "attitude-control",
      name: "Attitude Control",
      start: addHours(now, 7.5),
      end: addHours(now, 9),
      status: "planned",
      description: "Reaction wheel bearing lubrication and calibration",
    },
  ]);

  return (
    <ComponentPreview
      title="Detailed Maintenance Schedule"
      description="Spacecraft subsystem maintenance with detailed descriptions. Uses the 'detailed' variant to show additional task information."
      code={`<GanttChart
  tasks={tasks}
  variant="detailed"
  timeWindowHours={10}
  rowHeight={60}
  use12HourFormat={true}
/>`}
      preview={
        <div className="w-full">
          <GanttChart
            tasks={tasks}
            variant="detailed"
            timeWindowHours={10}
            rowHeight={60}
            use12HourFormat={true}
          />
        </div>
      }
    />
  );
}

function PrimitiveAPIExample() {
  const now = new Date();

  const [tasks] = useState<Task[]>([
    {
      id: "orbit1",
      name: "Orbit 1",
      start: addMinutes(now, -20),
      end: addMinutes(now, 70),
      status: "in-progress",
    },
    {
      id: "orbit2",
      name: "Orbit 2",
      start: addMinutes(now, 70),
      end: addMinutes(now, 160),
      status: "planned",
    },
    {
      id: "orbit3",
      name: "Orbit 3",
      start: addMinutes(now, 160),
      end: addMinutes(now, 250),
      status: "planned",
    },
  ]);

  return (
    <ComponentPreview
      title="Primitive API - Custom Composition"
      description="Build custom Gantt charts with full control using primitive components. Compose your own layouts and customize every aspect."
      code={`import { GanttChart } from "@plexusui/components/charts/gantt";

// Primitive API - full control over composition
<GanttChart.Root
  tasks={tasks}
  timeWindowHours={6}
  timezone="UTC"
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
</GanttChart.Root>`}
      preview={
        <div className="w-full">
          <GanttChart.Root tasks={tasks} timeWindowHours={6} timezone="UTC">
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
          </GanttChart.Root>
        </div>
      }
    />
  );
}

function FlightOperationsSchedule() {
  const now = new Date();

  const [tasks] = useState<Task[]>([
    {
      id: "preflight",
      name: "Pre-Flight Brief",
      start: addHours(now, -2),
      end: addHours(now, -1),
      status: "completed",
    },
    {
      id: "boarding",
      name: "Passenger Boarding",
      start: addHours(now, -1),
      end: addMinutes(now, -15),
      status: "completed",
    },
    {
      id: "taxi",
      name: "Taxi to Runway",
      start: addMinutes(now, -15),
      end: addMinutes(now, -5),
      status: "in-progress",
    },
    {
      id: "takeoff",
      name: "Takeoff",
      start: addMinutes(now, -5),
      end: now,
      status: "in-progress",
    },
    {
      id: "climb",
      name: "Climb to Altitude",
      start: now,
      end: addMinutes(now, 20),
      status: "planned",
    },
    {
      id: "cruise",
      name: "Cruise",
      start: addMinutes(now, 20),
      end: addHours(now, 3),
      status: "planned",
    },
    {
      id: "descent",
      name: "Descent",
      start: addHours(now, 3),
      end: addMinutes(addHours(now, 3), 25),
      status: "planned",
    },
    {
      id: "landing",
      name: "Landing",
      start: addMinutes(addHours(now, 3), 25),
      end: addMinutes(addHours(now, 3), 30),
      status: "planned",
    },
    {
      id: "deboarding",
      name: "Deboarding",
      start: addMinutes(addHours(now, 3), 30),
      end: addHours(now, 4),
      status: "planned",
    },
  ]);

  return (
    <ComponentPreview
      title="Flight Operations Timeline"
      description="Complete flight phase tracking from pre-flight to deboarding. Interactive timeline with automatic status progression."
      code={`<GanttChart
  tasks={flightTasks}
  timeWindowHours={6}
  timezone="UTC"
  variant="default"
  onTaskClick={(task) => showFlightPhaseDetails(task)}
/>`}
      preview={
        <div className="w-full">
          <GanttChart
            tasks={tasks}
            timeWindowHours={6}
            timezone="UTC"
            variant="default"
          />
        </div>
      }
    />
  );
}

export function GanttExamples() {
  return (
    <div className="space-y-8">
      <SatelliteContactSchedule />
      <MissionOperationsTimeline />
      <FlightOperationsSchedule />
      <DetailedMaintenanceSchedule />
      <PrimitiveAPIExample />
    </div>
  );
}
