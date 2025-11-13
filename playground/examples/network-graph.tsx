"use client";

import { useState } from "react";
import {
  NetworkGraph,
  type NetworkNode,
  type NetworkEdge,
} from "@plexusui/components/charts/network-graph";

export function NetworkGraphExamples() {
  const [selectedExample, setSelectedExample] = useState<
    "spacecraft" | "medical" | "industrial" | "robot"
  >("spacecraft");
  const [layout, setLayout] = useState<"force" | "custom">("force");

  // Spacecraft System Architecture
  const spacecraftNodes: NetworkNode[] = [
    {
      id: "power",
      label: "Power System",
      shape: "square",
      status: "operational",
    },
    {
      id: "computer",
      label: "Computer",
      shape: "square",
      status: "operational",
    },
    {
      id: "comms",
      label: "Communications",
      shape: "square",
      status: "operational",
    },
    {
      id: "propulsion",
      label: "Propulsion",
      shape: "square",
      status: "operational",
    },
    { id: "sensors", label: "Sensors", shape: "circle", status: "operational" },
    { id: "camera", label: "Camera", shape: "circle", status: "degraded" },
    {
      id: "antenna",
      label: "Antenna",
      shape: "triangle",
      status: "operational",
    },
    {
      id: "thruster1",
      label: "Thruster 1",
      shape: "diamond",
      status: "operational",
    },
    {
      id: "thruster2",
      label: "Thruster 2",
      shape: "diamond",
      status: "failed",
    },
  ];

  const spacecraftEdges: NetworkEdge[] = [
    { id: "e1", source: "power", target: "computer", directed: true },
    { id: "e2", source: "power", target: "comms", directed: true },
    { id: "e3", source: "power", target: "propulsion", directed: true },
    { id: "e4", source: "computer", target: "sensors", directed: true },
    { id: "e5", source: "computer", target: "camera", directed: true },
    { id: "e6", source: "comms", target: "antenna", directed: true },
    { id: "e7", source: "propulsion", target: "thruster1", directed: true },
    {
      id: "e8",
      source: "propulsion",
      target: "thruster2",
      directed: true,
      style: "dashed",
    },
  ];

  // Medical Device Network
  const medicalNodes: NetworkNode[] = [
    {
      id: "central",
      label: "Central Monitor",
      shape: "square",
      status: "operational",
    },
    { id: "ecg", label: "ECG", shape: "circle", status: "operational" },
    {
      id: "bp",
      label: "Blood Pressure",
      shape: "circle",
      status: "operational",
    },
    { id: "spo2", label: "SpO2", shape: "circle", status: "operational" },
    { id: "temp", label: "Temperature", shape: "circle", status: "degraded" },
    {
      id: "ventilator",
      label: "Ventilator",
      shape: "square",
      status: "operational",
    },
    {
      id: "pump1",
      label: "IV Pump 1",
      shape: "diamond",
      status: "operational",
    },
    { id: "pump2", label: "IV Pump 2", shape: "diamond", status: "offline" },
  ];

  const medicalEdges: NetworkEdge[] = [
    { id: "m1", source: "central", target: "ecg", directed: false },
    { id: "m2", source: "central", target: "bp", directed: false },
    { id: "m3", source: "central", target: "spo2", directed: false },
    {
      id: "m4",
      source: "central",
      target: "temp",
      directed: false,
      style: "dashed",
    },
    { id: "m5", source: "central", target: "ventilator", directed: true },
    { id: "m6", source: "central", target: "pump1", directed: true },
    {
      id: "m7",
      source: "central",
      target: "pump2",
      directed: true,
      style: "dotted",
    },
  ];

  // Industrial Process Flow
  const industrialNodes: NetworkNode[] = [
    {
      id: "raw",
      label: "Raw Material",
      shape: "circle",
      status: "operational",
    },
    { id: "mixer", label: "Mixer", shape: "square", status: "operational" },
    { id: "heater", label: "Heater", shape: "square", status: "operational" },
    { id: "reactor", label: "Reactor", shape: "square", status: "degraded" },
    {
      id: "separator",
      label: "Separator",
      shape: "square",
      status: "operational",
    },
    { id: "product", label: "Product", shape: "circle", status: "operational" },
    { id: "waste", label: "Waste", shape: "circle", status: "operational" },
  ];

  const industrialEdges: NetworkEdge[] = [
    { id: "i1", source: "raw", target: "mixer", directed: true, weight: 4 },
    { id: "i2", source: "mixer", target: "heater", directed: true, weight: 4 },
    {
      id: "i3",
      source: "heater",
      target: "reactor",
      directed: true,
      weight: 4,
    },
    {
      id: "i4",
      source: "reactor",
      target: "separator",
      directed: true,
      weight: 3,
    },
    {
      id: "i5",
      source: "separator",
      target: "product",
      directed: true,
      weight: 3,
    },
    {
      id: "i6",
      source: "separator",
      target: "waste",
      directed: true,
      weight: 1,
    },
  ];

  // Robotic Sensor Network
  const robotNodes: NetworkNode[] = [
    {
      id: "controller",
      label: "Controller",
      shape: "square",
      status: "operational",
    },
    { id: "lidar", label: "LIDAR", shape: "triangle", status: "operational" },
    { id: "cam1", label: "Camera 1", shape: "circle", status: "operational" },
    { id: "cam2", label: "Camera 2", shape: "circle", status: "operational" },
    { id: "imu", label: "IMU", shape: "diamond", status: "operational" },
    { id: "gps", label: "GPS", shape: "diamond", status: "degraded" },
    { id: "motor1", label: "Motor 1", shape: "square", status: "operational" },
    { id: "motor2", label: "Motor 2", shape: "square", status: "operational" },
  ];

  const robotEdges: NetworkEdge[] = [
    { id: "r1", source: "lidar", target: "controller", directed: true },
    { id: "r2", source: "cam1", target: "controller", directed: true },
    { id: "r3", source: "cam2", target: "controller", directed: true },
    { id: "r4", source: "imu", target: "controller", directed: true },
    {
      id: "r5",
      source: "gps",
      target: "controller",
      directed: true,
      style: "dashed",
    },
    { id: "r6", source: "controller", target: "motor1", directed: true },
    { id: "r7", source: "controller", target: "motor2", directed: true },
  ];

  const examples = {
    spacecraft: {
      nodes: spacecraftNodes,
      edges: spacecraftEdges,
      title: "Spacecraft System Architecture",
    },
    medical: {
      nodes: medicalNodes,
      edges: medicalEdges,
      title: "Medical Device Network",
    },
    industrial: {
      nodes: industrialNodes,
      edges: industrialEdges,
      title: "Industrial Process Flow",
    },
    robot: {
      nodes: robotNodes,
      edges: robotEdges,
      title: "Robotic Sensor Network",
    },
  };

  const currentExample = examples[selectedExample];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Network Graph</h1>
        <p className="text-zinc-400">
          Visualize system architectures, sensor networks, process flows, and
          component relationships
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Demo */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{currentExample.title}</h2>
          <NetworkGraph
            nodes={currentExample.nodes}
            edges={currentExample.edges}
            width={600}
            height={500}
            layout={layout}
            showLabels={true}
            nodeSize={12}
            edgeWidth={2}
          />

          <div className="space-y-4 bg-zinc-900 p-4 rounded-lg">
            <div>
              <label
                htmlFor="example-scenario-select"
                className="block text-sm font-medium mb-2"
              >
                Example Scenario
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedExample("spacecraft")}
                  className={`px-4 py-2 rounded font-medium ${
                    selectedExample === "spacecraft"
                      ? "bg-blue-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  Spacecraft
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExample("medical")}
                  className={`px-4 py-2 rounded font-medium ${
                    selectedExample === "medical"
                      ? "bg-blue-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  Medical
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExample("industrial")}
                  className={`px-4 py-2 rounded font-medium ${
                    selectedExample === "industrial"
                      ? "bg-blue-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  Industrial
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedExample("robot")}
                  className={`px-4 py-2 rounded font-medium ${
                    selectedExample === "robot"
                      ? "bg-blue-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  Robotic
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="layout-algorithm-select"
                className="block text-sm font-medium mb-2"
              >
                Layout Algorithm
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLayout("force")}
                  className={`px-4 py-2 rounded font-medium ${
                    layout === "force"
                      ? "bg-blue-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  Force-Directed
                </button>
                <button
                  type="button"
                  onClick={() => setLayout("custom")}
                  className={`px-4 py-2 rounded font-medium ${
                    layout === "custom"
                      ? "bg-blue-600"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  Custom Positions
                </button>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Status Legend</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>Degraded</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Failed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                  <span>Offline</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Use Case Examples */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Cross-Domain Applications</h2>

          <div className="space-y-4">
            {/* Aerospace */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-blue-500/30">
              <h3 className="font-semibold text-blue-400 mb-2">
                🚀 Aerospace Systems
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Spacecraft component architecture</li>
                <li>Satellite network topology</li>
                <li>Aircraft system interconnections</li>
                <li>Mission control data flow</li>
                <li>Avionics bus architecture</li>
              </ul>
            </div>

            {/* Medical */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-green-500/30">
              <h3 className="font-semibold text-green-400 mb-2">
                🏥 Medical Networks
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Patient monitoring device networks</li>
                <li>Hospital equipment connectivity</li>
                <li>Surgical robot component topology</li>
                <li>Medical imaging system architecture</li>
                <li>ICU equipment integration</li>
              </ul>
            </div>

            {/* Industrial */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-purple-500/30">
              <h3 className="font-semibold text-purple-400 mb-2">
                🏭 Industrial Process
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Manufacturing process flow diagrams</li>
                <li>Chemical plant piping & instrumentation</li>
                <li>Energy distribution networks</li>
                <li>Factory sensor network topology</li>
                <li>Supply chain visualization</li>
              </ul>
            </div>

            {/* Robotics */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-orange-500/30">
              <h3 className="font-semibold text-orange-400 mb-2">
                🤖 Robotics & Automation
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Autonomous vehicle sensor fusion</li>
                <li>Drone sensor network architecture</li>
                <li>Robotic arm control hierarchy</li>
                <li>Warehouse robot coordination</li>
                <li>Multi-robot communication topology</li>
              </ul>
            </div>

            {/* Software */}
            <div className="bg-zinc-900 p-4 rounded-lg border border-red-500/30">
              <h3 className="font-semibold text-red-400 mb-2">
                💻 Software & IT
              </h3>
              <ul className="text-sm text-zinc-300 space-y-1 list-disc list-inside">
                <li>Microservices architecture diagrams</li>
                <li>Network infrastructure topology</li>
                <li>Fault tree analysis</li>
                <li>Service dependency mapping</li>
                <li>API integration visualization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Node Shape Legend */}
      <div className="bg-zinc-900 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">Node Shape Semantics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500"></div>
            <div>
              <div className="font-semibold">Circle</div>
              <div className="text-xs text-zinc-400">Sensors, Endpoints</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500"></div>
            <div>
              <div className="font-semibold">Square</div>
              <div className="text-xs text-zinc-400">Systems, Controllers</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500 rotate-45"></div>
            <div>
              <div className="font-semibold">Diamond</div>
              <div className="text-xs text-zinc-400">Actuators, Outputs</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-blue-500"></div>
            <div>
              <div className="font-semibold">Triangle</div>
              <div className="text-xs text-zinc-400">Antennas, Interfaces</div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications */}
      <div className="bg-zinc-900 p-6 rounded-lg space-y-4">
        <h2 className="text-xl font-semibold">Technical Specifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-zinc-300 mb-2">Features</h3>
            <ul className="space-y-1 text-zinc-400">
              <li>• Force-directed or custom layout algorithms</li>
              <li>
                • Multiple node shapes (circle, square, diamond, triangle)
              </li>
              <li>
                • Status color coding (operational/degraded/failed/offline)
              </li>
              <li>• Directed/undirected edges with arrows</li>
              <li>• Edge styles (solid, dashed, dotted)</li>
              <li>• WebGL rendering for 1000+ nodes</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-300 mb-2">Customization</h3>
            <ul className="space-y-1 text-zinc-400">
              <li>• Custom node colors and sizes</li>
              <li>• Variable edge thickness (weighted)</li>
              <li>• Node labels and tooltips</li>
              <li>• Interactive zoom and pan</li>
              <li>• Grouping and clustering support</li>
              <li>• Export to image/data formats</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
