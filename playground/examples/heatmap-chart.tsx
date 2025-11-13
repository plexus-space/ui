"use client";

import { HeatmapChart } from "@plexusui/components/charts/heatmap-chart";
import type { DataPoint } from "@plexusui/components/charts/heatmap-chart";
import { ComponentPreview } from "@/components/component-preview";
import { useState, useEffect } from "react";

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
// Example Components
// ============================================================================

function RealTimeSystemMonitor() {
  const [isPaused, setIsPaused] = useState(false);

  // System monitoring parameters
  const CPU_CORES = 16; // Number of CPU cores to monitor
  const HISTORY_SECONDS = 30; // 30 seconds of history
  const UPDATE_RATE = 10; // Hz - update 10 times per second
  const WINDOW_SIZE = HISTORY_SECONDS * UPDATE_RATE; // 300 time slices

  // Initialize with baseline CPU usage data
  const [cpuData, setCpuData] = useState<DataPoint[]>(() => {
    const data: DataPoint[] = [];
    for (let t = 0; t < WINDOW_SIZE; t++) {
      for (let core = 0; core < CPU_CORES; core++) {
        // Start with idle CPUs (10-20% usage)
        const baseUsage = 10 + Math.random() * 10;
        data.push({
          x: t / UPDATE_RATE,
          y: core,
          value: baseUsage,
        });
      }
    }
    return data;
  });

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCpuData((prev) => {
        const newTimeSlice: DataPoint[] = [];
        const lastTime =
          prev.length > 0
            ? (prev[prev.length - 1].x as number)
            : HISTORY_SECONDS;
        const newTime = lastTime + 1 / UPDATE_RATE;

        for (let core = 0; core < CPU_CORES; core++) {
          // Get previous value for this core
          const prevCoreData = prev.filter((p) => p.y === core);
          const prevValue =
            prevCoreData.length > 0
              ? prevCoreData[prevCoreData.length - 1].value
              : 20;

          // Simulate realistic CPU usage patterns
          let newValue = prevValue;

          // Gradual drift
          newValue += (Math.random() - 0.5) * 15;

          // Occasional workload spike (simulating task execution)
          if (Math.random() < 0.05) {
            newValue += Math.random() * 50;
          }

          // Pull towards baseline idle (20%)
          newValue += (20 - prevValue) * 0.1;

          // Some cores are busier than others (asymmetric workload)
          if (core < 4) {
            // First 4 cores handle more work
            newValue += 10;
          }

          // Clamp to 0-100% range
          newValue = Math.max(0, Math.min(100, newValue));

          newTimeSlice.push({
            x: newTime,
            y: core,
            value: newValue,
          });
        }

        // Remove old data outside the time window
        const filtered = prev.filter(
          (p) => (p.x as number) > newTime - HISTORY_SECONDS
        );

        return [...filtered, ...newTimeSlice];
      });
    }, 1000 / UPDATE_RATE);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <ComponentPreview
      title="Real-Time System Monitor"
      description={`Live CPU core usage tracking at ${UPDATE_RATE} Hz - ${HISTORY_SECONDS}s rolling window across ${CPU_CORES} cores`}
      code={`import { HeatmapChart } from "@/components/plexusui/charts/heatmap-chart";
import { useState, useEffect } from "react";

const CPU_CORES = 16;
const HISTORY_SECONDS = 30;
const UPDATE_RATE = 10; // Hz

const [cpuData, setCpuData] = useState<DataPoint[]>([]);

// Update CPU usage data in real-time
useEffect(() => {
  const interval = setInterval(() => {
    setCpuData(prev => {
      const newTimeSlice: DataPoint[] = [];
      const newTime = lastTime + 1 / UPDATE_RATE;

      for (let core = 0; core < CPU_CORES; core++) {
        const prevValue = getPrevCoreValue(prev, core);
        let newValue = prevValue;

        // Simulate realistic CPU usage
        newValue += (Math.random() - 0.5) * 15;
        if (Math.random() < 0.05) newValue += Math.random() * 50;
        newValue += (20 - prevValue) * 0.1;
        newValue = Math.max(0, Math.min(100, newValue));

        newTimeSlice.push({ x: newTime, y: core, value: newValue });
      }

      return [...prev.filter(p => p.x > newTime - HISTORY_SECONDS), ...newTimeSlice];
    });
  }, 1000 / UPDATE_RATE);

  return () => clearInterval(interval);
}, []);

<HeatmapChart
  data={cpuData}
  xAxis={{ label: "Time (seconds)" }}
  yAxis={{ label: "CPU Core" }}
  colorScale={{
    min: 0,
    max: 100,
    colors: ["#10b981", "#fbbf24", "#ef4444"]
  }}
  width={800}
  height={400}
  preferWebGPU={true}
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                CPU Core Usage Monitor - {CPU_CORES} Cores
              </div>
              <div className="text-xs text-zinc-500">
                Update Rate: {UPDATE_RATE} Hz | Window: {HISTORY_SECONDS}s |
                Data Points: {cpuData.length}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </div>

          <div className="w-full h-[500px]">
            <HeatmapChart
              data={cpuData}
              xAxis={{
                label: "Time (seconds)",
                formatter: (v: number | string) => {
                  const num = typeof v === "number" ? v : parseFloat(String(v));
                  return `${num.toFixed(1)}s`;
                },
              }}
              yAxis={{
                label: "CPU Core",
                formatter: (v: number | string) => {
                  const num = typeof v === "number" ? v : parseFloat(String(v));
                  return `Core ${Math.round(num)}`;
                },
              }}
              colorScale={(value: number) => {
                // Green -> Yellow -> Red color scale based on CPU usage
                if (value < 0.3) {
                  // Green to yellow-green
                  const r = Math.round(16 + (value / 0.3) * 220);
                  return `rgb(${r}, 185, 129)`;
                } else if (value < 0.7) {
                  // Yellow-green to yellow
                  const factor = (value - 0.3) / 0.4;
                  const r = Math.round(236 + factor * 15);
                  const g = Math.round(185 - factor * 100);
                  return `rgb(${r}, ${g}, 36)`;
                } else {
                  // Yellow to red
                  const factor = (value - 0.7) / 0.3;
                  const r = 239;
                  const g = Math.round(135 - factor * 67);
                  const b = Math.round(36 + factor * 32);
                  return `rgb(${r}, ${g}, ${b})`;
                }
              }}
              minValue={0}
              maxValue={100}
              width={800}
              height={500}
              preferWebGPU={true}
              cellGap={1}
              showTooltip
              showLegend
            />
          </div>
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

function WebGPUMemoryMonitor() {
  const [isPaused, setIsPaused] = useState(false);

  // GPU memory parameters
  const MEMORY_REGIONS = 32; // Memory regions to track
  const MEMORY_BLOCKS = 64; // Blocks per region
  const BLOCK_SIZE_MB = 8; // Each block is 8MB

  // Initialize with baseline memory usage
  const [memoryData, setMemoryData] = useState<DataPoint[]>(() => {
    const data: DataPoint[] = [];
    for (let region = 0; region < MEMORY_REGIONS; region++) {
      for (let block = 0; block < MEMORY_BLOCKS; block++) {
        // Start with low memory usage (10-30%)
        const baseUsage = 10 + Math.random() * 20;
        data.push({
          x: block,
          y: region,
          value: baseUsage,
        });
      }
    }
    return data;
  });

  useEffect(() => {
    if (isPaused) return;

    let animationFrame: number;

    const animate = () => {
      setMemoryData((prev) => {
        return prev.map((point) => {
          const region = point.y as number;
          const block = point.x as number;
          let newValue = point.value;

          // Gradual memory usage changes
          newValue += (Math.random() - 0.5) * 10;

          // Simulate memory allocation patterns
          // Lower regions (0-7) are system memory - more stable
          if (region < 8) {
            newValue += (40 - newValue) * 0.15; // Pull towards 40%
            newValue += (Math.random() - 0.5) * 5; // Less variance
          }
          // Middle regions (8-23) are texture/buffer memory - more dynamic
          else if (region < 24) {
            // Occasional large allocations (loading textures)
            if (Math.random() < 0.02) {
              newValue += Math.random() * 40;
            }
            // Occasional deallocations
            if (Math.random() < 0.01 && newValue > 50) {
              newValue -= Math.random() * 30;
            }
          }
          // Upper regions (24-31) are compute shader memory
          else {
            // Bursty patterns for compute workloads
            if (Math.random() < 0.03) {
              newValue = 80 + Math.random() * 20; // Sudden spike
            } else {
              newValue += (20 - newValue) * 0.2; // Pull towards low baseline
            }
          }

          // Memory pressure simulation - some blocks fill up
          if (block % 8 === 0 && Math.random() < 0.01) {
            newValue = 90 + Math.random() * 10; // Nearly full
          }

          // Clamp to 0-100% range
          return {
            ...point,
            value: Math.max(0, Math.min(100, newValue)),
          };
        });
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isPaused]);

  const totalMemoryGB = (MEMORY_REGIONS * MEMORY_BLOCKS * BLOCK_SIZE_MB) / 1024;
  const avgUsage =
    memoryData.reduce((sum, p) => sum + p.value, 0) / memoryData.length;
  const usedMemoryGB = (totalMemoryGB * avgUsage) / 100;

  return (
    <ComponentPreview
      title="Real-Time WebGPU Memory Monitor"
      description={`Live GPU memory allocation tracking - ${totalMemoryGB.toFixed(
        1
      )}GB VRAM across ${MEMORY_REGIONS} regions`}
      code={`import { HeatmapChart } from "@/components/plexusui/charts/heatmap-chart";
import { useState, useEffect } from "react";

const MEMORY_REGIONS = 32;
const MEMORY_BLOCKS = 64;

const [memoryData, setMemoryData] = useState<DataPoint[]>([]);

// Simulate GPU memory allocation patterns
useEffect(() => {
  const animate = () => {
    setMemoryData(prev => prev.map(point => {
      const region = point.y as number;
      let newValue = point.value;

      // System memory (stable)
      if (region < 8) {
        newValue += (40 - newValue) * 0.15;
      }
      // Texture/buffer memory (dynamic)
      else if (region < 24) {
        if (Math.random() < 0.02) newValue += Math.random() * 40;
        if (Math.random() < 0.01 && newValue > 50) newValue -= Math.random() * 30;
      }
      // Compute shader memory (bursty)
      else {
        if (Math.random() < 0.03) {
          newValue = 80 + Math.random() * 20;
        } else {
          newValue += (20 - newValue) * 0.2;
        }
      }

      return { ...point, value: Math.max(0, Math.min(100, newValue)) };
    }));

    requestAnimationFrame(animate);
  };

  const frame = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(frame);
}, []);

<HeatmapChart
  data={memoryData}
  xAxis={{ label: "Memory Block" }}
  yAxis={{ label: "Memory Region" }}
  width={800}
  height={500}
  preferWebGPU={true}
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                WebGPU Memory Allocation Map - {MEMORY_REGIONS} Regions ×{" "}
                {MEMORY_BLOCKS} Blocks
              </div>
              <div className="text-xs text-zinc-500">
                Total VRAM: {totalMemoryGB.toFixed(1)}GB | Used:{" "}
                {usedMemoryGB.toFixed(2)}GB ({avgUsage.toFixed(1)}%) | Block
                Size: {BLOCK_SIZE_MB}MB
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="px-4 py-2 rounded-md font-medium transition-colors bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
          </div>

          <div className="w-full h-[600px]">
            <HeatmapChart
              data={memoryData}
              xAxis={{
                label: "Memory Block (8MB each)",
              }}
              yAxis={{
                label: "Memory Region",
              }}
              width={800}
              height={600}
              preferWebGPU={true}
              cellGap={0.5}
              showTooltip
              showLegend
            />
          </div>
        </div>
      }
    />
  );
}

function PrimitiveHeatmapChart() {
  return (
    <ComponentPreview
      title="Primitive Components"
      description="Build custom heatmaps with primitive components for full control"
      code={`import { HeatmapChart } from "@/components/plexusui/charts/heatmap-chart";

<HeatmapChart.Root
  data={data}
  width={800}
  height={400}
  xAxis={{ label: "Day" }}
  yAxis={{ label: "Hour" }}
>
  <HeatmapChart.Canvas />
  <HeatmapChart.Grid />
  <HeatmapChart.Axes />
  <HeatmapChart.Tooltip />
  <HeatmapChart.Legend title="Activity" />
</HeatmapChart.Root>`}
      preview={
        <div className="w-full h-[500px]">
          <HeatmapChart.Root
            data={serverActivityData.slice(0, 168)} // One week
            width={800}
            height={500}
            xAxis={{ label: "Day of Week" }}
            yAxis={{ label: "Hour of Day" }}
            preferWebGPU={true}
          >
            <HeatmapChart.Canvas />
            <HeatmapChart.Grid />
            <HeatmapChart.Axes />
            <HeatmapChart.Tooltip />
            <HeatmapChart.Legend title="Activity Level" />
          </HeatmapChart.Root>
        </div>
      }
    />
  );
}

function ResponsiveHeatmap() {
  return (
    <ComponentPreview
      title="Responsive Heatmap"
      description="Heatmap with responsive sizing and custom margins"
      code={`import { HeatmapChart } from "@/components/plexusui/charts/heatmap-chart";

<div style={{ width: "100%", height: "500px" }}>
  <HeatmapChart
    data={correlationData}
    width="100%"
    height="100%"
    minWidth={400}
    minHeight={300}
    margin={{ top: 40, right: 40, bottom: 70, left: 80 }}
    showGrid
    showAxes
    showTooltip
    showLegend
    preferWebGPU={true}
  />
</div>`}
      preview={
        <div className="w-full" style={{ height: "500px" }}>
          <HeatmapChart
            data={correlationData}
            width="100%"
            height="100%"
            minWidth={400}
            minHeight={300}
            xAxis={{ label: "Variables" }}
            yAxis={{ label: "Variables" }}
            margin={{ top: 40, right: 40, bottom: 70, left: 80 }}
            showGrid
            showAxes
            showTooltip
            showLegend
            preferWebGPU={true}
          />
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
      <RealTimeSystemMonitor />
      <WebGPUMemoryMonitor />
      <LargeScaleHeatmap />
      <ResponsiveHeatmap />
      <PrimitiveHeatmapChart />
    </div>
  );
}
