"use client";

import { ScatterChart } from "@plexusui/components/charts/scatter-chart";
import type { DataPoint } from "@plexusui/components/charts/scatter-chart";
import { ComponentPreview } from "@/components/component-preview";

// ============================================================================
// Example Data
// ============================================================================

const performanceData: DataPoint[] = Array.from({ length: 100 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
}));

const clusterData: DataPoint[] = [
  // Cluster 1 (top-right)
  ...Array.from({ length: 30 }, () => ({
    x: 70 + Math.random() * 20,
    y: 70 + Math.random() * 20,
    size: 1.2,
  })),
  // Cluster 2 (bottom-left)
  ...Array.from({ length: 30 }, () => ({
    x: 20 + Math.random() * 20,
    y: 20 + Math.random() * 20,
    size: 1.0,
  })),
  // Cluster 3 (center)
  ...Array.from({ length: 40 }, () => ({
    x: 45 + Math.random() * 10,
    y: 45 + Math.random() * 10,
    size: 0.8,
  })),
];

const correlationData: DataPoint[] = Array.from({ length: 50 }, (_, i) => ({
  x: i * 2,
  y: i * 2 + (Math.random() - 0.5) * 20,
  size: 1,
  label: `Point ${i}`,
}));

// ============================================================================
// Example Components
// ============================================================================

function BasicScatterChart() {
  return (
    <ComponentPreview
      title="Basic Scatter Plot"
      description="Simple scatter plot showing random performance data"
      code={`import { ScatterChart } from "@/components/plexusui/charts/scatter-chart";

const data = Array.from({ length: 100 }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
}));

<ScatterChart
  series={[{ name: "Performance", data, color: "#06b6d4" }]}
  width={800}
  height={400}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <ScatterChart
            series={[
              {
                name: "Performance",
                data: performanceData,
                color: "#06b6d4",
                size: 8,
              },
            ]}
            width={800}
            height={400}
            showTooltip
          />
        </div>
      }
    />
  );
}

function MultiSeriesScatterChart() {
  return (
    <ComponentPreview
      title="Multi-Series Scatter Plot"
      description="Visualizing multiple data clusters with different colors"
      code={`const clusterData = [
  // Three different clusters with varying properties
];

<ScatterChart
  series={[
    { name: "Cluster A", data: cluster1, color: "#ef4444", size: 10 },
    { name: "Cluster B", data: cluster2, color: "#3b82f6", size: 8 },
    { name: "Cluster C", data: cluster3, color: "#10b981", size: 6 },
  ]}
  xAxis={{ label: "X Axis" }}
  yAxis={{ label: "Y Axis" }}
  showGrid
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <ScatterChart
            series={[
              {
                name: "High Performance",
                data: clusterData.slice(0, 30),
                color: "#ef4444",
                size: 10,
                opacity: 0.7,
              },
              {
                name: "Medium Performance",
                data: clusterData.slice(30, 60),
                color: "#3b82f6",
                size: 8,
                opacity: 0.7,
              },
              {
                name: "Standard",
                data: clusterData.slice(60),
                color: "#10b981",
                size: 6,
                opacity: 0.7,
              },
            ]}
            xAxis={{ label: "Processing Time (ms)" }}
            yAxis={{ label: "Throughput (req/s)" }}
            width={800}
            height={400}
            showGrid
            showTooltip
          />
        </div>
      }
    />
  );
}

function CorrelationScatterChart() {
  return (
    <ComponentPreview
      title="Correlation Analysis"
      description="Scatter plot showing correlation between two variables"
      code={`const correlationData = Array.from({ length: 50 }, (_, i) => ({
  x: i * 2,
  y: i * 2 + (Math.random() - 0.5) * 20,
  label: \`Point \${i}\`,
}));

<ScatterChart
  series={[{
    name: "Temperature vs Pressure",
    data: correlationData,
    color: "#f59e0b",
  }]}
  xAxis={{ label: "Temperature (°C)" }}
  yAxis={{ label: "Pressure (PSI)" }}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <ScatterChart
            series={[
              {
                name: "Temperature vs Pressure",
                data: correlationData,
                color: "#f59e0b",
                size: 7,
              },
            ]}
            xAxis={{ label: "Temperature (°C)" }}
            yAxis={{ label: "Pressure (PSI)" }}
            width={800}
            height={400}
            showGrid
            showTooltip
          />
        </div>
      }
    />
  );
}

function PrimitiveScatterChart() {
  return (
    <ComponentPreview
      title="Primitive Components"
      description="Build custom scatter plots with primitive components"
      code={`import { ScatterChart } from "@/components/plexusui/charts/scatter-chart";

<ScatterChart.Root
  series={[{ name: "Data", data, color: "#8b5cf6" }]}
  width={800}
  height={400}
>
  <ScatterChart.Canvas showGrid />
  <ScatterChart.Axes />
  <ScatterChart.Tooltip />
  <ScatterChart.Legend />
</ScatterChart.Root>`}
      preview={
        <div className="w-full h-[400px]">
          <ScatterChart.Root
            series={[
              {
                name: "Custom Data",
                data: performanceData,
                color: "#8b5cf6",
                size: 9,
              },
            ]}
            width={800}
            height={400}
            preferWebGPU={true}
          >
            <ScatterChart.Canvas showGrid />
            <ScatterChart.Axes />
            <ScatterChart.Tooltip />
            <ScatterChart.Legend />
          </ScatterChart.Root>
        </div>
      }
    />
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function ScatterChartExamples() {
  return (
    <div className="space-y-8">
      <BasicScatterChart />
      <MultiSeriesScatterChart />
      <CorrelationScatterChart />
      <PrimitiveScatterChart />
    </div>
  );
}
