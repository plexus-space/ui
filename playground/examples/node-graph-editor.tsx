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

  return (
    <div className="space-y-12">
      {/* Interactive Signal Processing Pipeline */}
      <ComponentPreviewPro
        title="Interactive Signal Processing Pipeline"
        description="Drag nodes to rearrange the signal flow. Click and drag from output ports (right side) to input ports (left side) to create new connections. This example demonstrates real-time data processing from sensor input through filtering and decision logic to output systems."
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
              <NodeGraphEditor.Minimap />
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
                <NodeGraphEditor.Grid size={15} color="#d1d5db" />
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
