"use client";

import { Timeline } from "@plexusui/components/charts/timeline";
import type { TimelineLane } from "@plexusui/components/charts/timeline";
import { ComponentPreview } from "@/components/component-preview";

const missionTimeline: TimelineLane[] = [
  {
    id: "flight",
    name: "Flight Phase",
    events: [
      { id: "1", timestamp: 0, label: "Takeoff", type: "milestone" },
      { id: "2", timestamp: 300, label: "Climb", type: "info", duration: 600 },
      {
        id: "3",
        timestamp: 900,
        label: "Cruise",
        type: "success",
        duration: 3600,
      },
      {
        id: "4",
        timestamp: 4500,
        label: "Descent",
        type: "info",
        duration: 400,
      },
      { id: "5", timestamp: 4900, label: "Landing", type: "milestone" },
    ],
  },
  {
    id: "systems",
    name: "System Events",
    events: [
      { id: "6", timestamp: 150, label: "APU Start", type: "success" },
      { id: "7", timestamp: 1200, label: "Autopilot On", type: "info" },
      { id: "8", timestamp: 2800, label: "Fuel Low Warning", type: "warning" },
      { id: "9", timestamp: 3200, label: "Fuel Critical", type: "error" },
      { id: "10", timestamp: 4400, label: "Autopilot Off", type: "info" },
    ],
  },
  {
    id: "comms",
    name: "Communications",
    events: [
      { id: "11", timestamp: 50, label: "Tower Contact", type: "info" },
      { id: "12", timestamp: 800, label: "Handoff to Center", type: "info" },
      { id: "13", timestamp: 4300, label: "Approach Contact", type: "info" },
      { id: "14", timestamp: 4850, label: "Tower Contact", type: "info" },
    ],
  },
  {
    id: "maintenance",
    name: "Maintenance Logs",
    events: [
      { id: "15", timestamp: 2500, label: "Engine Check", type: "success" },
      {
        id: "16",
        timestamp: 3500,
        label: "Hydraulic Anomaly",
        type: "warning",
      },
    ],
  },
];

function MissionFlightRecorder() {
  return (
    <ComponentPreview
      title="Mission Flight Recorder"
      description="Complete flight timeline with phases, system events, communications, and maintenance logs. Time-based visualization of all flight operations."
      code={`const missionTimeline: TimelineLane[] = [
  {
    id: "flight",
    name: "Flight Phase",
    events: [
      { id: "1", timestamp: 0, label: "Takeoff", type: "milestone" },
      { id: "2", timestamp: 300, label: "Climb", type: "info", duration: 600 },
      { id: "3", timestamp: 900, label: "Cruise", type: "success", duration: 3600 },
      { id: "4", timestamp: 4500, label: "Descent", type: "info", duration: 400 },
      { id: "5", timestamp: 4900, label: "Landing", type: "milestone" },
    ],
  },
  {
    id: "systems",
    name: "System Events",
    events: [
      { id: "6", timestamp: 150, label: "APU Start", type: "success" },
      { id: "7", timestamp: 1200, label: "Autopilot On", type: "info" },
      { id: "8", timestamp: 2800, label: "Fuel Low Warning", type: "warning" },
      { id: "9", timestamp: 3200, label: "Fuel Critical", type: "error" },
      { id: "10", timestamp: 4400, label: "Autopilot Off", type: "info" },
    ],
  },
  // ... more lanes
];

<Timeline
  lanes={missionTimeline}
  width={1200}
  height={500}
  showAxes={true}
/>`}
      preview={
        <div className="w-full p-4">
          <Timeline
            lanes={missionTimeline}
            width={1200}
            height={500}
            showAxes={true}
          />
        </div>
      }
    />
  );
}

function CompactTimeline() {
  const compactData: TimelineLane[] = [
    {
      id: "flight",
      name: "Flight Phase",
      events: [
        { id: "1", timestamp: 0, label: "Takeoff", type: "milestone" },
        {
          id: "2",
          timestamp: 300,
          label: "Climb",
          type: "info",
          duration: 600,
        },
        {
          id: "3",
          timestamp: 900,
          label: "Cruise",
          type: "success",
          duration: 3600,
        },
        {
          id: "4",
          timestamp: 4500,
          label: "Descent",
          type: "info",
          duration: 400,
        },
        { id: "5", timestamp: 4900, label: "Landing", type: "milestone" },
      ],
    },
    {
      id: "systems",
      name: "System Events",
      events: [
        { id: "6", timestamp: 150, label: "APU Start", type: "success" },
        { id: "7", timestamp: 1200, label: "Autopilot On", type: "info" },
        {
          id: "8",
          timestamp: 2800,
          label: "Fuel Low Warning",
          type: "warning",
        },
        { id: "9", timestamp: 3200, label: "Fuel Critical", type: "error" },
        { id: "10", timestamp: 4400, label: "Autopilot Off", type: "info" },
      ],
    },
  ];

  return (
    <ComponentPreview
      title="Compact Timeline"
      description="Condensed two-lane timeline for focused event tracking. Ideal for embedded displays."
      code={`<Timeline
  lanes={compactData}
  width={1000}
  height={300}
  showAxes={true}
/>`}
      preview={
        <div className="w-full p-4">
          <Timeline
            lanes={compactData}
            width={1000}
            height={300}
            showAxes={true}
          />
        </div>
      }
    />
  );
}

function LaunchSequenceTimeline() {
  const launchSequence: TimelineLane[] = [
    {
      id: "prelaunch",
      name: "Pre-Launch",
      events: [
        {
          id: "1",
          timestamp: -600,
          label: "T-10min Hold",
          type: "warning",
          duration: 300,
        },
        {
          id: "2",
          timestamp: -300,
          label: "Terminal Count",
          type: "info",
          duration: 290,
        },
        {
          id: "3",
          timestamp: -10,
          label: "Final Checks",
          type: "success",
          duration: 10,
        },
      ],
    },
    {
      id: "launch",
      name: "Launch Events",
      events: [
        { id: "4", timestamp: 0, label: "Ignition", type: "milestone" },
        { id: "5", timestamp: 2, label: "Liftoff", type: "milestone" },
        { id: "6", timestamp: 60, label: "Max Q", type: "warning" },
        { id: "7", timestamp: 120, label: "MECO", type: "info" },
        { id: "8", timestamp: 180, label: "Stage Sep", type: "success" },
      ],
    },
    {
      id: "ascent",
      name: "Ascent Phase",
      events: [
        { id: "9", timestamp: 185, label: "S2 Ignition", type: "success" },
        { id: "10", timestamp: 240, label: "Fairing Sep", type: "info" },
        { id: "11", timestamp: 480, label: "SECO", type: "milestone" },
      ],
    },
  ];

  return (
    <ComponentPreview
      title="Launch Sequence Timeline"
      description="Rocket launch event sequence with T-minus countdown and ascent milestones. Negative timestamps for pre-launch events."
      code={`const launchSequence: TimelineLane[] = [
  {
    id: "prelaunch",
    name: "Pre-Launch",
    events: [
      { id: "1", timestamp: -600, label: "T-10min Hold", type: "warning", duration: 300 },
      { id: "2", timestamp: -300, label: "Terminal Count", type: "info", duration: 290 },
      { id: "3", timestamp: -10, label: "Final Checks", type: "success", duration: 10 },
    ],
  },
  {
    id: "launch",
    name: "Launch Events",
    events: [
      { id: "4", timestamp: 0, label: "Ignition", type: "milestone" },
      { id: "5", timestamp: 2, label: "Liftoff", type: "milestone" },
      { id: "6", timestamp: 60, label: "Max Q", type: "warning" },
      { id: "7", timestamp: 120, label: "MECO", type: "info" },
      { id: "8", timestamp: 180, label: "Stage Sep", type: "success" },
    ],
  },
  // ... more lanes
];

<Timeline
  lanes={launchSequence}
  width={1100}
  height={400}
  showAxes={true}
/>`}
      preview={
        <div className="w-full p-4">
          <Timeline
            lanes={launchSequence}
            width={1100}
            height={400}
            showAxes={true}
          />
        </div>
      }
    />
  );
}

export function TimelineExamples() {
  return (
    <div className="space-y-8">
      <MissionFlightRecorder />
      <CompactTimeline />
      <LaunchSequenceTimeline />
    </div>
  );
}
