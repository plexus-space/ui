"use client";

import { LineChart } from "@plexusui/components/charts/line-chart";

/**
 * Example: Pure WebGL Line Chart
 *
 * This example demonstrates the WebGL-powered line chart with:
 * - Custom shaders for thick line rendering (no SVG limitations)
 * - GPU-accelerated for 100k+ points at 60fps
 * - Support for multiple data series
 * - Automatic axis scaling
 * - Canvas 2D overlay for crisp text rendering
 * - WebGPU-ready architecture
 */

// Generate sample telemetry data
function generateData(points: number, offset: number = 0) {
  const data = [];
  for (let i = 0; i < points; i++) {
    const x = i / 10;
    const y = Math.sin(x + offset) * 50 + Math.random() * 10;
    data.push({ x, y });
  }
  return data;
}

export function LineChartDemoExamples() {
  // Create multiple series with different data
  const series = [
    {
      name: "Sensor A",
      data: generateData(200, 0),
      color: "#06b6d4", // cyan
      strokeWidth: 3,
    },
    {
      name: "Sensor B",
      data: generateData(200, Math.PI / 2),
      color: "#f59e0b", // amber
      strokeWidth: 3,
    },
    {
      name: "Sensor C",
      data: generateData(200, Math.PI),
      color: "#ec4899", // pink
      strokeWidth: 3,
    },
  ];

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Basic Line Chart</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Multi-series line chart with WebGL rendering
        </p>
        <LineChart
          series={series}
          xAxis={{
            label: "Time (s)",
            formatter: (value: number) => `${value.toFixed(2)}s`,
          }}
          yAxis={{
            label: "Voltage (mV)",
            formatter: (value: number) => `${value.toFixed(2)}mV`,
          }}
          width={900}
          height={500}
          showGrid
          showAxes
          showTooltip
          className="border border-zinc-300 dark:border-zinc-800 rounded-lg"
        />
      </div>

      <div>
        <LineChart
          series={[
            {
              name: "High-Frequency Signal",
              data: generateData(100000, 0),
              color: "#8b5cf6",
              strokeWidth: 2,
            },
          ]}
          xAxis={{
            label: "Samples",
            formatter: (value: number) => `${value.toFixed(2)}`,
          }}
          yAxis={{
            label: "Amplitude",
            formatter: (value: number) => `${value.toFixed(2)}mV`,
          }}
          width={900}
          height={400}
          showGrid
          showAxes
          className="border border-zinc-300 dark:border-zinc-800 rounded-lg"
        />
        <div className="mt-2 text-sm text-zinc-500">
          ⚡ Pure WebGL rendering - no SVG fallback needed
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Minimal Style</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Clean chart without grid or legend
        </p>
        <LineChart
          series={[
            {
              name: "Signal",
              data: generateData(500, 0),
              color: "#10b981",
              strokeWidth: 2.5,
            },
          ]}
          width={900}
          height={300}
          showGrid={false}
          showAxes
          className="rounded-lg shadow-sm"
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2">Multiple Series</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          WebGL handles multiple series with ease
        </p>
        <LineChart
          series={[
            {
              name: "Alpha",
              data: generateData(5000, 0),
              color: "#ef4444",
              strokeWidth: 2,
            },
            {
              name: "Beta",
              data: generateData(5000, Math.PI / 3),
              color: "#3b82f6",
              strokeWidth: 2,
            },
            {
              name: "Gamma",
              data: generateData(5000, Math.PI / 1.5),
              color: "#10b981",
              strokeWidth: 2,
            },
          ]}
          xAxis={{
            label: "Time",
          }}
          yAxis={{
            label: "Value",
          }}
          width={900}
          height={350}
          showGrid
          showAxes
          showTooltip
          className="border border-zinc-300 dark:border-zinc-800 rounded-lg"
        />
        <div className="mt-2 text-sm text-zinc-500">
          🎨 All rendered in a single WebGL draw call
        </div>
      </div>
    </div>
  );
}
