"use client";

import { HeatmapChart } from "@plexusui/components/charts/heatmap-chart";
import type { DataPoint } from "@plexusui/components/charts/heatmap-chart";
import { ComponentPreview } from "@/components/component-preview";

// ============================================================================
// Example Data
// ============================================================================

// Server activity heatmap (hour x day)
const serverActivityData: DataPoint[] = [];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, i) => i);

for (const day of days) {
  for (const hour of hours) {
    // Simulate activity patterns
    let value = 20;
    // Business hours (9-17) have more activity
    if (hour >= 9 && hour <= 17) value += 40;
    // Weekend has less activity
    if (day === "Sat" || day === "Sun") value *= 0.5;
    // Add some randomness
    value += Math.random() * 20;

    serverActivityData.push({
      x: day,
      y: hour,
      value,
    });
  }
}

// Correlation matrix
const correlationData: DataPoint[] = [];
const variables = ["Temp", "Pressure", "Humidity", "Wind", "Visibility"];

for (let i = 0; i < variables.length; i++) {
  for (let j = 0; j < variables.length; j++) {
    const value = i === j ? 1 : Math.random() * 0.8 + 0.1;
    correlationData.push({
      x: variables[i],
      y: variables[j],
      value,
    });
  }
}

// Grid performance data
const gridPerformanceData: DataPoint[] = [];
for (let x = 0; x < 10; x++) {
  for (let y = 0; y < 10; y++) {
    const value =
      Math.sin(x / 2) * Math.cos(y / 2) * 50 + 50 + Math.random() * 10;
    gridPerformanceData.push({ x, y, value });
  }
}

// ============================================================================
// Color Scales
// ============================================================================

function blueRedColorScale(value: number): string {
  // Blue (cold) to Red (hot)
  const colors = [
    [59, 76, 192], // Blue
    [144, 178, 254], // Light Blue
    [220, 220, 220], // White
    [254, 178, 144], // Light Red
    [180, 4, 38], // Red
  ];

  const clamped = Math.max(0, Math.min(1, value));
  const scaled = clamped * (colors.length - 1);
  const i = Math.floor(scaled);
  const f = scaled - i;

  if (i >= colors.length - 1) {
    const c = colors[colors.length - 1];
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }

  const c1 = colors[i];
  const c2 = colors[i + 1];
  const r = Math.round(c1[0] + f * (c2[0] - c1[0]));
  const g = Math.round(c1[1] + f * (c2[1] - c1[1]));
  const b = Math.round(c1[2] + f * (c2[2] - c1[2]));

  return `rgb(${r}, ${g}, ${b})`;
}

function greenYellowRedScale(value: number): string {
  // Green (good) to Yellow to Red (bad)
  if (value < 0.5) {
    const f = value * 2;
    const r = Math.round(255 * f);
    const g = 255;
    return `rgb(${r}, ${g}, 0)`;
  } else {
    const f = (value - 0.5) * 2;
    const r = 255;
    const g = Math.round(255 * (1 - f));
    return `rgb(${r}, ${g}, 0)`;
  }
}

// ============================================================================
// Example Components
// ============================================================================

function BasicHeatmapChart() {
  return (
    <ComponentPreview
      title="Basic Heatmap"
      description="Simple heatmap showing server activity by day and hour"
      code={`import { HeatmapChart } from "@/components/plexusui/charts/heatmap-chart";

const data = [
  { x: "Mon", y: 0, value: 45 },
  { x: "Mon", y: 1, value: 35 },
  // ... more data
];

<HeatmapChart
  data={data}
  xAxis={{ label: "Day of Week" }}
  yAxis={{ label: "Hour" }}
  width={800}
  height={400}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[500px]">
          <HeatmapChart
            data={serverActivityData}
            xAxis={{ label: "Day of Week" }}
            yAxis={{ label: "Hour of Day" }}
            width={800}
            height={500}
            showTooltip
            cellGap={1}
          />
        </div>
      }
    />
  );
}

function CorrelationMatrix() {
  return (
    <ComponentPreview
      title="Correlation Matrix"
      description="Heatmap showing correlations between variables"
      code={`const variables = ["Temp", "Pressure", "Humidity", "Wind", "Visibility"];
const correlationData = [];

for (let i = 0; i < variables.length; i++) {
  for (let j = 0; j < variables.length; j++) {
    const value = i === j ? 1 : Math.random() * 0.8 + 0.1;
    correlationData.push({
      x: variables[i],
      y: variables[j],
      value,
    });
  }
}

<HeatmapChart
  data={correlationData}
  colorScale={blueRedColorScale}
  minValue={0}
  maxValue={1}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[500px]">
          <HeatmapChart
            data={correlationData}
            xAxis={{ label: "Variable" }}
            yAxis={{ label: "Variable" }}
            width={800}
            height={500}
            colorScale={blueRedColorScale}
            minValue={0}
            maxValue={1}
            showTooltip
            cellGap={2}
          />
        </div>
      }
    />
  );
}

function GridPerformanceHeatmap() {
  return (
    <ComponentPreview
      title="Grid Performance Heatmap"
      description="Numeric grid showing performance metrics with custom color scale"
      code={`const gridData = [];
for (let x = 0; x < 10; x++) {
  for (let y = 0; y < 10; y++) {
    const value = calculatePerformance(x, y);
    gridData.push({ x, y, value });
  }
}

function greenYellowRedScale(value: number): string {
  // Custom color scale: green (good) -> yellow -> red (bad)
  if (value < 0.5) {
    const f = value * 2;
    return \`rgb(\${Math.round(255 * f)}, 255, 0)\`;
  } else {
    const f = (value - 0.5) * 2;
    return \`rgb(255, \${Math.round(255 * (1 - f))}, 0)\`;
  }
}

<HeatmapChart
  data={gridData}
  colorScale={greenYellowRedScale}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[500px]">
          <HeatmapChart
            data={gridPerformanceData}
            xAxis={{ label: "Grid X" }}
            yAxis={{ label: "Grid Y" }}
            width={800}
            height={500}
            colorScale={greenYellowRedScale}
            showTooltip
            cellGap={1}
          />
        </div>
      }
    />
  );
}

function LargeScaleHeatmap() {
  const largeData: DataPoint[] = [];
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 30; y++) {
      const value = Math.sin(x / 5) * Math.cos(y / 3) * 50 + 50;
      largeData.push({ x, y, value });
    }
  }

  return (
    <ComponentPreview
      title="Large-Scale Heatmap"
      description="High-density heatmap with 1500 data points showing WebGPU performance"
      code={`const largeData = [];
for (let x = 0; x < 50; x++) {
  for (let y = 0; y < 30; y++) {
    const value = calculateValue(x, y);
    largeData.push({ x, y, value });
  }
}

<HeatmapChart
  data={largeData}
  width={800}
  height={500}
  preferWebGPU={true}
  cellGap={0}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[500px]">
          <HeatmapChart
            data={largeData}
            width={800}
            height={500}
            preferWebGPU={true}
            cellGap={0}
            showTooltip
          />
        </div>
      }
    />
  );
}

function PrimitiveHeatmapChart() {
  return (
    <ComponentPreview
      title="Primitive Components"
      description="Build custom heatmaps with primitive components"
      code={`import { HeatmapChart } from "@/components/plexusui/charts/heatmap-chart";

<HeatmapChart.Root
  data={data}
  width={800}
  height={400}
>
  <HeatmapChart.Canvas />
  <HeatmapChart.Axes />
  <HeatmapChart.Tooltip />
</HeatmapChart.Root>`}
      preview={
        <div className="w-full h-[500px]">
          <HeatmapChart.Root
            data={serverActivityData.slice(0, 168)} // One week
            width={800}
            height={500}
            preferWebGPU={true}
          >
            <HeatmapChart.Canvas />
            <HeatmapChart.Axes />
            <HeatmapChart.Tooltip />
          </HeatmapChart.Root>
        </div>
      }
    />
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function HeatmapChartExamples() {
  return (
    <div className="space-y-8">
      <BasicHeatmapChart />
      <CorrelationMatrix />
      <GridPerformanceHeatmap />
      <LargeScaleHeatmap />
      <PrimitiveHeatmapChart />
    </div>
  );
}
