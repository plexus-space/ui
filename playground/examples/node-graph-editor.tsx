import { useState } from "react";
import { ComponentPreviewPro } from "@/components/component-preview-pro";
import {
  NodeGraphEditor,
  type GraphNode,
  type Edge,
} from "@plexusui/components-pro/node-graph-editor";

export const NodeGraphEditorExamples = () => {
  // Simple dataflow example
  const [dataflowNodes, setDataflowNodes] = useState<GraphNode[]>([
    {
      id: "input-1",
      type: "input",
      position: { x: 50, y: 100 },
      label: "Sensor Data",
      outputs: [
        { id: "out-1", label: "Raw Signal" },
        { id: "out-2", label: "Timestamp" },
      ],
    },
    {
      id: "process-1",
      type: "process",
      position: { x: 300, y: 80 },
      label: "Filter",
      inputs: [{ id: "in-1", label: "Input" }],
      outputs: [{ id: "out-1", label: "Filtered" }],
    },
    {
      id: "process-2",
      type: "process",
      position: { x: 300, y: 200 },
      label: "Amplify",
      inputs: [{ id: "in-1", label: "Input" }],
      outputs: [{ id: "out-1", label: "Amplified" }],
    },
    {
      id: "decision-1",
      type: "decision",
      position: { x: 550, y: 120 },
      label: "Threshold Check",
      inputs: [
        { id: "in-1", label: "Signal A" },
        { id: "in-2", label: "Signal B" },
      ],
      outputs: [
        { id: "out-1", label: "Pass" },
        { id: "out-2", label: "Fail" },
      ],
    },
    {
      id: "output-1",
      type: "output",
      position: { x: 800, y: 100 },
      label: "Valid Data",
      inputs: [{ id: "in-1", label: "Data" }],
    },
    {
      id: "output-2",
      type: "output",
      position: { x: 800, y: 200 },
      label: "Alert System",
      inputs: [{ id: "in-1", label: "Alert" }],
    },
  ]);

  const [dataflowEdges, setDataflowEdges] = useState<Edge[]>([
    {
      id: "e1",
      source: "input-1",
      sourcePort: "out-1",
      target: "process-1",
      targetPort: "in-1",
    },
    {
      id: "e2",
      source: "input-1",
      sourcePort: "out-1",
      target: "process-2",
      targetPort: "in-1",
    },
    {
      id: "e3",
      source: "process-1",
      sourcePort: "out-1",
      target: "decision-1",
      targetPort: "in-1",
    },
    {
      id: "e4",
      source: "process-2",
      sourcePort: "out-1",
      target: "decision-1",
      targetPort: "in-2",
    },
    {
      id: "e5",
      source: "decision-1",
      sourcePort: "out-1",
      target: "output-1",
      targetPort: "in-1",
      color: "#10b981",
    },
    {
      id: "e6",
      source: "decision-1",
      sourcePort: "out-2",
      target: "output-2",
      targetPort: "in-1",
      color: "#ef4444",
    },
  ]);

  // Control system architecture
  const controlSystemNodes: GraphNode[] = [
    {
      id: "sensor-1",
      type: "input",
      position: { x: 50, y: 150 },
      label: "IMU",
      outputs: [
        { id: "accel", label: "Accel" },
        { id: "gyro", label: "Gyro" },
      ],
    },
    {
      id: "sensor-2",
      type: "input",
      position: { x: 50, y: 280 },
      label: "GPS",
      outputs: [{ id: "pos", label: "Position" }],
    },
    {
      id: "fusion",
      type: "process",
      position: { x: 280, y: 200 },
      label: "Sensor Fusion",
      inputs: [
        { id: "in-1", label: "Accel" },
        { id: "in-2", label: "Gyro" },
        { id: "in-3", label: "GPS" },
      ],
      outputs: [{ id: "state", label: "State Est." }],
    },
    {
      id: "controller",
      type: "process",
      position: { x: 520, y: 200 },
      label: "PID Controller",
      inputs: [
        { id: "state", label: "State" },
        { id: "target", label: "Target" },
      ],
      outputs: [{ id: "cmd", label: "Command" }],
    },
    {
      id: "target",
      type: "input",
      position: { x: 280, y: 350 },
      label: "Target State",
      outputs: [{ id: "out", label: "Target" }],
    },
    {
      id: "actuator",
      type: "output",
      position: { x: 760, y: 200 },
      label: "Motor Control",
      inputs: [{ id: "cmd", label: "Command" }],
    },
  ];

  const controlSystemEdges: Edge[] = [
    {
      id: "e1",
      source: "sensor-1",
      sourcePort: "accel",
      target: "fusion",
      targetPort: "in-1",
    },
    {
      id: "e2",
      source: "sensor-1",
      sourcePort: "gyro",
      target: "fusion",
      targetPort: "in-2",
    },
    {
      id: "e3",
      source: "sensor-2",
      sourcePort: "pos",
      target: "fusion",
      targetPort: "in-3",
    },
    {
      id: "e4",
      source: "fusion",
      sourcePort: "state",
      target: "controller",
      targetPort: "state",
    },
    {
      id: "e5",
      source: "target",
      sourcePort: "out",
      target: "controller",
      targetPort: "target",
    },
    {
      id: "e6",
      source: "controller",
      sourcePort: "cmd",
      target: "actuator",
      targetPort: "cmd",
    },
  ];

  // Mission planning workflow
  const missionNodes: GraphNode[] = [
    {
      id: "mission-def",
      type: "input",
      position: { x: 50, y: 100 },
      label: "Mission Definition",
      outputs: [{ id: "params", label: "Parameters" }],
    },
    {
      id: "orbit-design",
      type: "process",
      position: { x: 280, y: 80 },
      label: "Orbit Design",
      inputs: [{ id: "params", label: "Params" }],
      outputs: [{ id: "orbit", label: "Orbit" }],
    },
    {
      id: "traj-opt",
      type: "process",
      position: { x: 520, y: 80 },
      label: "Trajectory Optimizer",
      inputs: [{ id: "orbit", label: "Orbit" }],
      outputs: [{ id: "traj", label: "Trajectory" }],
    },
    {
      id: "fuel-calc",
      type: "process",
      position: { x: 280, y: 200 },
      label: "ΔV Calculator",
      inputs: [{ id: "traj", label: "Trajectory" }],
      outputs: [{ id: "deltav", label: "ΔV Budget" }],
    },
    {
      id: "validation",
      type: "decision",
      position: { x: 520, y: 200 },
      label: "Feasibility Check",
      inputs: [
        { id: "traj", label: "Trajectory" },
        { id: "deltav", label: "ΔV" },
      ],
      outputs: [
        { id: "pass", label: "Valid" },
        { id: "fail", label: "Invalid" },
      ],
    },
    {
      id: "mission-plan",
      type: "output",
      position: { x: 760, y: 180 },
      label: "Mission Plan",
      inputs: [{ id: "plan", label: "Plan" }],
    },
    {
      id: "redesign",
      type: "output",
      position: { x: 760, y: 280 },
      label: "Redesign Required",
      inputs: [{ id: "feedback", label: "Feedback" }],
      color: "#f59e0b",
    },
  ];

  const missionEdges: Edge[] = [
    {
      id: "e1",
      source: "mission-def",
      sourcePort: "params",
      target: "orbit-design",
      targetPort: "params",
    },
    {
      id: "e2",
      source: "orbit-design",
      sourcePort: "orbit",
      target: "traj-opt",
      targetPort: "orbit",
    },
    {
      id: "e3",
      source: "traj-opt",
      sourcePort: "traj",
      target: "validation",
      targetPort: "traj",
    },
    {
      id: "e4",
      source: "traj-opt",
      sourcePort: "traj",
      target: "fuel-calc",
      targetPort: "traj",
    },
    {
      id: "e5",
      source: "fuel-calc",
      sourcePort: "deltav",
      target: "validation",
      targetPort: "deltav",
    },
    {
      id: "e6",
      source: "validation",
      sourcePort: "pass",
      target: "mission-plan",
      targetPort: "plan",
      color: "#10b981",
    },
    {
      id: "e7",
      source: "validation",
      sourcePort: "fail",
      target: "redesign",
      targetPort: "feedback",
      color: "#ef4444",
    },
  ];

  // State machine example
  const stateMachineNodes: GraphNode[] = [
    {
      id: "idle",
      type: "input",
      position: { x: 50, y: 200 },
      label: "Idle",
      outputs: [
        { id: "start", label: "start" },
        { id: "shutdown", label: "shutdown" },
      ],
    },
    {
      id: "initializing",
      type: "process",
      position: { x: 280, y: 100 },
      label: "Initializing",
      inputs: [{ id: "in", label: "" }],
      outputs: [
        { id: "success", label: "ready" },
        { id: "fail", label: "error" },
      ],
    },
    {
      id: "running",
      type: "process",
      position: { x: 520, y: 100 },
      label: "Running",
      inputs: [{ id: "in", label: "" }],
      outputs: [
        { id: "pause", label: "pause" },
        { id: "stop", label: "stop" },
        { id: "error", label: "error" },
      ],
    },
    {
      id: "paused",
      type: "decision",
      position: { x: 520, y: 280 },
      label: "Paused",
      inputs: [{ id: "in", label: "" }],
      outputs: [
        { id: "resume", label: "resume" },
        { id: "stop", label: "stop" },
      ],
    },
    {
      id: "error",
      type: "output",
      position: { x: 760, y: 200 },
      label: "Error",
      inputs: [{ id: "in", label: "" }],
      color: "#ef4444",
    },
    {
      id: "shutdown",
      type: "output",
      position: { x: 280, y: 320 },
      label: "Shutdown",
      inputs: [{ id: "in", label: "" }],
    },
  ];

  const stateMachineEdges: Edge[] = [
    {
      id: "e1",
      source: "idle",
      sourcePort: "start",
      target: "initializing",
      targetPort: "in",
      color: "#10b981",
    },
    {
      id: "e2",
      source: "initializing",
      sourcePort: "success",
      target: "running",
      targetPort: "in",
      color: "#10b981",
    },
    {
      id: "e3",
      source: "initializing",
      sourcePort: "fail",
      target: "error",
      targetPort: "in",
      color: "#ef4444",
    },
    {
      id: "e4",
      source: "running",
      sourcePort: "pause",
      target: "paused",
      targetPort: "in",
      color: "#f59e0b",
    },
    {
      id: "e5",
      source: "paused",
      sourcePort: "resume",
      target: "running",
      targetPort: "in",
      color: "#10b981",
    },
    {
      id: "e6",
      source: "running",
      sourcePort: "error",
      target: "error",
      targetPort: "in",
      color: "#ef4444",
    },
    {
      id: "e7",
      source: "running",
      sourcePort: "stop",
      target: "shutdown",
      targetPort: "in",
      color: "#6b7280",
    },
    {
      id: "e8",
      source: "paused",
      sourcePort: "stop",
      target: "shutdown",
      targetPort: "in",
      color: "#6b7280",
    },
    {
      id: "e9",
      source: "idle",
      sourcePort: "shutdown",
      target: "shutdown",
      targetPort: "in",
      color: "#6b7280",
    },
  ];

  // Dependency graph example
  const dependencyNodes: GraphNode[] = [
    {
      id: "core",
      type: "input",
      position: { x: 50, y: 200 },
      label: "Core Library",
      outputs: [{ id: "api", label: "API" }],
      color: "#8b5cf6",
    },
    {
      id: "utils",
      type: "input",
      position: { x: 50, y: 320 },
      label: "Utilities",
      outputs: [{ id: "helpers", label: "helpers" }],
      color: "#8b5cf6",
    },
    {
      id: "data-layer",
      type: "process",
      position: { x: 280, y: 180 },
      label: "Data Layer",
      inputs: [
        { id: "core", label: "core" },
        { id: "utils", label: "utils" },
      ],
      outputs: [{ id: "models", label: "models" }],
      color: "#3b82f6",
    },
    {
      id: "api-layer",
      type: "process",
      position: { x: 280, y: 320 },
      label: "API Layer",
      inputs: [{ id: "core", label: "core" }],
      outputs: [{ id: "endpoints", label: "endpoints" }],
      color: "#3b82f6",
    },
    {
      id: "business-logic",
      type: "process",
      position: { x: 520, y: 220 },
      label: "Business Logic",
      inputs: [
        { id: "data", label: "data" },
        { id: "api", label: "api" },
      ],
      outputs: [{ id: "services", label: "services" }],
      color: "#06b6d4",
    },
    {
      id: "ui-components",
      type: "output",
      position: { x: 760, y: 160 },
      label: "UI Components",
      inputs: [{ id: "services", label: "services" }],
      color: "#10b981",
    },
    {
      id: "cli",
      type: "output",
      position: { x: 760, y: 280 },
      label: "CLI Tool",
      inputs: [{ id: "services", label: "services" }],
      color: "#10b981",
    },
  ];

  const dependencyEdges: Edge[] = [
    {
      id: "e1",
      source: "core",
      sourcePort: "api",
      target: "data-layer",
      targetPort: "core",
    },
    {
      id: "e2",
      source: "utils",
      sourcePort: "helpers",
      target: "data-layer",
      targetPort: "utils",
    },
    {
      id: "e3",
      source: "core",
      sourcePort: "api",
      target: "api-layer",
      targetPort: "core",
    },
    {
      id: "e4",
      source: "data-layer",
      sourcePort: "models",
      target: "business-logic",
      targetPort: "data",
    },
    {
      id: "e5",
      source: "api-layer",
      sourcePort: "endpoints",
      target: "business-logic",
      targetPort: "api",
    },
    {
      id: "e6",
      source: "business-logic",
      sourcePort: "services",
      target: "ui-components",
      targetPort: "services",
    },
    {
      id: "e7",
      source: "business-logic",
      sourcePort: "services",
      target: "cli",
      targetPort: "services",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Data Flow Example */}
      <ComponentPreviewPro
        title="Data Flow Pipeline"
        description="Interactive signal processing pipeline showing data flow from sensor input through filtering and decision logic to output systems. Drag nodes to rearrange, click and drag from output ports to input ports to create connections."
        preview={
          <NodeGraphEditor.Root
            nodes={dataflowNodes}
            edges={dataflowEdges}
            onNodesChange={setDataflowNodes}
            onEdgesChange={setDataflowEdges}
            width={1000}
            height={400}
            snapToGrid={true}
            gridSize={20}
          >
            <NodeGraphEditor.Container>
              <NodeGraphEditor.Canvas>
                <NodeGraphEditor.Grid />
                <NodeGraphEditor.Edges />
                <NodeGraphEditor.Nodes />
              </NodeGraphEditor.Canvas>
            </NodeGraphEditor.Container>
          </NodeGraphEditor.Root>
        }
      />

      {/* State Machine Example */}
      <ComponentPreviewPro
        title="State Machine"
        description="System lifecycle state machine showing transitions between idle, initialization, running, paused, error, and shutdown states. Demonstrates finite state machine patterns commonly used in control systems."
        preview={
          <NodeGraphEditor.Root
            nodes={stateMachineNodes}
            edges={stateMachineEdges}
            width={1000}
            height={450}
            readOnly={true}
          >
            <NodeGraphEditor.Container>
              <NodeGraphEditor.Canvas>
                <NodeGraphEditor.Grid />
                <NodeGraphEditor.Edges />
                <NodeGraphEditor.Nodes />
              </NodeGraphEditor.Canvas>
            </NodeGraphEditor.Container>
          </NodeGraphEditor.Root>
        }
      />

      {/* Dependency Graph Example */}
      <ComponentPreviewPro
        title="Dependency Graph"
        description="Software architecture dependency graph showing how different modules and layers depend on each other. Core libraries at the foundation, business logic in the middle, and consumer applications at the top."
        preview={
          <NodeGraphEditor.Root
            nodes={dependencyNodes}
            edges={dependencyEdges}
            width={1000}
            height={450}
            readOnly={true}
          >
            <NodeGraphEditor.Container>
              <NodeGraphEditor.Canvas>
                <NodeGraphEditor.Grid />
                <NodeGraphEditor.Edges />
                <NodeGraphEditor.Nodes />
              </NodeGraphEditor.Canvas>
            </NodeGraphEditor.Container>
          </NodeGraphEditor.Root>
        }
      />

      {/* Control System Architecture */}
      <ComponentPreviewPro
        title="Control System Architecture"
        description="Spacecraft attitude control system showing sensor fusion from IMU and GPS, feeding into a PID controller that commands motor actuators. Demonstrates multi-input sensor integration common in aerospace applications."
        preview={
          <NodeGraphEditor.Root
            nodes={controlSystemNodes}
            edges={controlSystemEdges}
            width={1000}
            height={450}
            readOnly={true}
          >
            <NodeGraphEditor.Container>
              <NodeGraphEditor.Canvas>
                <NodeGraphEditor.Grid />
                <NodeGraphEditor.Edges />
                <NodeGraphEditor.Nodes />
              </NodeGraphEditor.Canvas>
            </NodeGraphEditor.Container>
          </NodeGraphEditor.Root>
        }
      />
    </div>
  );
};
