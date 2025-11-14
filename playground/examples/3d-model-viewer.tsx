"use client";

import { type VertexData } from "@plexusui/components/charts";
import { ComponentPreview } from "@/components/component-preview";
import dynamic from "next/dynamic";
import { useState } from "react";

const ModelViewer = dynamic(
  () => import("@plexusui/components/charts").then((mod) => mod.ModelViewer),
  { ssr: false }
);

// ============================================================================
// Example 1: Basic Cube with Temperature Data
// ============================================================================

function BasicCubeExample() {
  const cubeData: VertexData[] = [
    // Front face (hot)
    { vertexIndex: 0, value: 80 },
    { vertexIndex: 1, value: 75 },
    { vertexIndex: 2, value: 78 },
    { vertexIndex: 3, value: 82 },
    // Back face (cold)
    { vertexIndex: 4, value: 25 },
    { vertexIndex: 5, value: 28 },
    { vertexIndex: 6, value: 30 },
    { vertexIndex: 7, value: 27 },
    // Additional vertices
    { vertexIndex: 8, value: 55 },
    { vertexIndex: 9, value: 58 },
    { vertexIndex: 10, value: 60 },
    { vertexIndex: 11, value: 57 },
  ];

  return (
    <ComponentPreview
      title="Basic 3D Model with Temperature Data"
      description="Simple STL model with vertex-based temperature overlay. Auto-configured camera and data ranges."
      code={`import { ModelViewer } from "@plexusui/components/charts";

const tempData: VertexData[] = [
  { vertexIndex: 0, value: 80 },
  { vertexIndex: 1, value: 75 },
  // ... more vertices
];

<ModelViewer
  src="/models/cube.stl"
  data={tempData}
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="text-sm text-muted-foreground">
            Drag to rotate • Scroll to zoom • Right-click to pan
          </div>
          <ModelViewer src="/models/cube.stl" data={cubeData} />
        </div>
      }
    />
  );
}

// ============================================================================
// Example 2: Different Color Maps
// ============================================================================

function ColorMapExample() {
  const [colorMap, setColorMap] = useState<
    "viridis" | "plasma" | "inferno" | "jet" | "grayscale"
  >("viridis");

  const cubeData: VertexData[] = Array.from({ length: 24 }, (_, i) => ({
    vertexIndex: i,
    value: Math.random() * 100,
  }));

  return (
    <ComponentPreview
      title="Color Map Variants"
      description="Switch between different scientific color maps for data visualization."
      code={`<ModelViewer
  src="/models/cube.stl"
  data={tempData}
  colorMap="plasma"  // viridis | plasma | inferno | jet | grayscale
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="flex gap-2">
            {(
              ["viridis", "plasma", "inferno", "jet", "grayscale"] as const
            ).map((map) => (
              <button
                type="button"
                key={map}
                onClick={() => setColorMap(map)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  colorMap === map
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {map}
              </button>
            ))}
          </div>
          <ModelViewer
            src="/models/cube.stl"
            data={cubeData}
            colorMap={colorMap}
          />
        </div>
      }
    />
  );
}

// ============================================================================
// Example 3: Real-time Data Streaming
// ============================================================================

function LiveDataExample() {
  // Spatial function: pulsing wave from center outward (like a heartbeat)
  const heartbeatFunction = (x: number, y: number, z: number, time = 0) => {
    // Calculate distance from center
    const distance = Math.sqrt(x * x + y * y + z * z);

    // Create expanding wave pattern
    const wave = Math.sin(distance * 0.5 - time * 3);

    // Map to temperature range (60-100°C)
    return 80 + wave * 20;
  };

  return (
    <ComponentPreview
      title="Real-time Spatial Data"
      description="Heartbeat simulation using spatial wave propagation. Data calculated from vertex positions in 3D space."
      code={`// Function based on actual vertex positions (x, y, z)
const heartbeatFunction = (x: number, y: number, z: number, time = 0) => {
  const distance = Math.sqrt(x * x + y * y + z * z);
  const wave = Math.sin(distance * 0.5 - time * 3);
  return 80 + wave * 20; // Temperature: 60-100°C
};

<ModelViewer
  src="/models/heart.stl"
  dataFunction={heartbeatFunction}
  dataMin={60}
  dataMax={100}
  colorMap="plasma"
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="text-sm text-muted-foreground">
            Simulating radial heat wave propagating from center • Temperature
            range: 60-100°C
          </div>
          <ModelViewer
            src="/models/heart.stl"
            dataFunction={heartbeatFunction}
            dataMin={60}
            dataMax={100}
            colorMap="plasma"
          />
        </div>
      }
    />
  );
}

// ============================================================================
// Example 4: Height-based Gradient
// ============================================================================

function CustomRangeExample() {
  // Spatial function: temperature based on height (Y-axis)
  const heightGradient = (x: number, y: number, z: number) => {
    // Map Y coordinate to temperature (higher = hotter)
    return y * 10 + 50; // Assuming Y ranges roughly -3 to 3
  };

  return (
    <ComponentPreview
      title="Height-based Temperature Gradient"
      description="Spatial data function using Y-axis position. Shows how data can represent physical phenomena like altitude-based temperature."
      code={`// Temperature increases with height
const heightGradient = (x: number, y: number, z: number) => {
  return y * 10 + 50; // Higher altitude = higher temp
};

<ModelViewer
  src="/models/cube.stl"
  dataFunction={heightGradient}
  dataMin={20}
  dataMax={80}
  showGrid={true}
  showAxes={true}
  colorMap="inferno"
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="text-sm text-muted-foreground">
            Temperature gradient: 20-80°C • Y-axis spatial mapping
          </div>
          <ModelViewer
            src="/models/cube.stl"
            dataFunction={heightGradient}
            dataMin={20}
            dataMax={80}
            showGrid={true}
            showAxes={true}
            colorMap="inferno"
          />
        </div>
      }
    />
  );
}

// ============================================================================
// Example 5: No Data Visualization
// ============================================================================

function NoDataExample() {
  return (
    <ComponentPreview
      title="Model Without Data Overlay"
      description="View 3D models without sensor data - perfect for CAD visualization and design review."
      code={`<ModelViewer
  src="/models/cube.stl"
  // No data prop - renders model with default material
  showGrid={true}
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="text-sm text-muted-foreground">
            Pure geometry visualization without data overlay
          </div>
          <ModelViewer
            src="/models/cube.stl"
            showGrid={true}
            colorMap="grayscale"
          />
        </div>
      }
    />
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function ModelViewerExamples() {
  return (
    <div className="space-y-8">
      <BasicCubeExample />
      <ColorMapExample />
      <CustomRangeExample />
      <LiveDataExample />
      <NoDataExample />
    </div>
  );
}

export default ModelViewerExamples;
