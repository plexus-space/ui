"use client";

import { LineChart } from "@plexusui/components/charts/line-chart";
import type { DataPoint } from "@plexusui/components/charts/line-chart";
import { ComponentPreview } from "@/components/component-preview";
import { useState, useEffect } from "react";
import { useColorScheme, useMultiColors } from "@/components/color-scheme-provider";
/**
 * Generates realistic EEG-like waveforms by combining multiple frequency bands:
 * - Delta (0.5-4 Hz): Deep sleep waves
 * - Theta (4-8 Hz): Drowsiness, meditation
 * - Alpha (8-13 Hz): Relaxed, eyes closed
 * - Beta (13-30 Hz): Active thinking, focus
 * - Gamma (30-100 Hz): Higher cognitive functions
 */
function generateEEGSample(time: number, channelOffset: number = 0): number {
  // Realistic EEG amplitude ranges: -100 to +100 μV
  const delta = Math.sin(time * 0.5 + channelOffset) * 15; // 0.5-4 Hz
  const theta = Math.sin(time * 1.2 + channelOffset * 0.7) * 12; // 4-8 Hz
  const alpha = Math.sin(time * 2.5 + channelOffset * 1.3) * 20; // 8-13 Hz - dominant when relaxed
  const beta = Math.sin(time * 5 + channelOffset * 2) * 8; // 13-30 Hz
  const gamma = Math.sin(time * 12 + channelOffset * 3) * 4; // 30-100 Hz

  // Add realistic noise (artifacts, muscle tension, etc.)
  const noise = (Math.random() - 0.5) * 5;

  return delta + theta + alpha + beta + gamma + noise;
}

function StreamingChart() {
  const colors = useMultiColors(3);

  // EEG sampling parameters
  const SAMPLING_RATE = 256; // Hz (typical EEG sampling rate for data collection)
  const WINDOW_DURATION = 4; // seconds of data to display
  const WINDOW_SIZE = SAMPLING_RATE * WINDOW_DURATION; // 1024 points total

  // Visual update rate (lower than sampling rate for smooth rendering without flicker)
  const DISPLAY_UPDATE_RATE = 30; // Hz - smooth 30fps updates
  const SAMPLES_PER_UPDATE = Math.floor(SAMPLING_RATE / DISPLAY_UPDATE_RATE); // ~8 samples per frame
  const UPDATE_INTERVAL = 1000 / DISPLAY_UPDATE_RATE; // ~33ms between visual updates

  const [isPaused, setIsPaused] = useState(false);

  // Initialize with realistic EEG data for 3 channels
  const [channel1, setChannel1] = useState<DataPoint[]>(() =>
    Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      x: i / SAMPLING_RATE,
      y: generateEEGSample((i / SAMPLING_RATE) * Math.PI * 2, 0),
    }))
  );

  const [channel2, setChannel2] = useState<DataPoint[]>(() =>
    Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      x: i / SAMPLING_RATE,
      y: generateEEGSample((i / SAMPLING_RATE) * Math.PI * 2, Math.PI / 3),
    }))
  );

  const [channel3, setChannel3] = useState<DataPoint[]>(() =>
    Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      x: i / SAMPLING_RATE,
      y: generateEEGSample((i / SAMPLING_RATE) * Math.PI * 2, Math.PI / 1.5),
    }))
  );

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // Add multiple samples per frame to maintain 256Hz sampling while displaying at 30fps
      setChannel1((prev) => {
        const newPoints: DataPoint[] = [];
        let lastTime = prev.length > 0 ? prev[prev.length - 1].x : 0;
        for (let i = 0; i < SAMPLES_PER_UPDATE; i++) {
          const newTime = lastTime + 1 / SAMPLING_RATE;
          const timeRadians = newTime * Math.PI * 2;
          newPoints.push({ x: newTime, y: generateEEGSample(timeRadians, 0) });
          lastTime = newTime; // Update for next iteration
        }
        return [...prev.slice(-(WINDOW_SIZE - SAMPLES_PER_UPDATE)), ...newPoints];
      });

      setChannel2((prev) => {
        const newPoints: DataPoint[] = [];
        let lastTime = prev.length > 0 ? prev[prev.length - 1].x : 0;
        for (let i = 0; i < SAMPLES_PER_UPDATE; i++) {
          const newTime = lastTime + 1 / SAMPLING_RATE;
          const timeRadians = newTime * Math.PI * 2;
          newPoints.push({
            x: newTime,
            y: generateEEGSample(timeRadians, Math.PI / 3),
          });
          lastTime = newTime; // Update for next iteration
        }
        return [...prev.slice(-(WINDOW_SIZE - SAMPLES_PER_UPDATE)), ...newPoints];
      });

      setChannel3((prev) => {
        const newPoints: DataPoint[] = [];
        let lastTime = prev.length > 0 ? prev[prev.length - 1].x : 0;
        for (let i = 0; i < SAMPLES_PER_UPDATE; i++) {
          const newTime = lastTime + 1 / SAMPLING_RATE;
          const timeRadians = newTime * Math.PI * 2;
          newPoints.push({
            x: newTime,
            y: generateEEGSample(timeRadians, Math.PI / 1.5),
          });
          lastTime = newTime; // Update for next iteration
        }
        return [...prev.slice(-(WINDOW_SIZE - SAMPLES_PER_UPDATE)), ...newPoints];
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, UPDATE_INTERVAL, WINDOW_SIZE, SAMPLES_PER_UPDATE]);

  // Calculate exact domain for streaming data (no padding)
  const xMin = channel1.length > 0 ? channel1[0].x : 0;
  const xMax = channel1.length > 0 ? channel1[channel1.length - 1].x : WINDOW_DURATION;

  // Fixed Y-axis domain for stable display (typical EEG range)
  const yMin = -80;
  const yMax = 80;

  // Format time values as timestamps
  const formatTimestamp = (seconds: number): string => {
    const totalSeconds = Math.floor(seconds);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}.${Math.floor(milliseconds / 100)}`;
  };

  return (
    <ComponentPreview
      title="Real-time EEG Monitoring"
      description={`Live electroencephalography (EEG) data at ${SAMPLING_RATE} Hz - Multi-channel brain activity visualization`}
      code={`// EEG-like wave generator combining multiple frequency bands
function generateEEGSample(time: number, channelOffset: number = 0): number {
  const delta = Math.sin(time * 0.5 + channelOffset) * 15;  // 0.5-4 Hz
  const theta = Math.sin(time * 1.2 + channelOffset * 0.7) * 12;  // 4-8 Hz
  const alpha = Math.sin(time * 2.5 + channelOffset * 1.3) * 20;  // 8-13 Hz
  const beta = Math.sin(time * 5 + channelOffset * 2) * 8;  // 13-30 Hz
  const gamma = Math.sin(time * 12 + channelOffset * 3) * 4;  // 30-100 Hz
  const noise = (Math.random() - 0.5) * 5;
  return delta + theta + alpha + beta + gamma + noise;
}

const SAMPLING_RATE = 256; // Hz
const WINDOW_SIZE = SAMPLING_RATE * 4; // 4 seconds of data

const [data, setData] = useState<DataPoint[]>(/* initial EEG data */);

<LineChart
  series={[
    { name: "Frontal (Fp1)", data: channel1, color: "#06b6d4" },
    { name: "Central (C3)", data: channel2, color: "#f59e0b" },
    { name: "Occipital (O1)", data: channel3, color: "#ec4899" },
  ]}
  xAxis={{
    label: "Time (seconds)",
    domain: [xMin, xMax],
    formatter: (v) => v.toFixed(2) + "s"
  }}
  yAxis={{
    label: "Amplitude (μV)",
    formatter: (v) => v.toFixed(1) + "μV"
  }}
  showGrid={true}
  width={800}
  height={500}
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                EEG Channels: Fp1 (Frontal), C3 (Central), O1 (Occipital)
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

          <div style={{ height: 400 }}>
            <LineChart.Root
              series={[
                {
                  name: "Fp1 (Frontal)",
                  data: channel1,
                  color: colors[0],
                  strokeWidth: 2,
                },
                {
                  name: "C3 (Central)",
                  data: channel2,
                  color: colors[1],
                  strokeWidth: 2,
                },
                {
                  name: "O1 (Occipital)",
                  data: channel3,
                  color: colors[2],
                  strokeWidth: 2,
                },
              ]}
              xAxis={{
                label: "Time (MM:SS.ms)",
                domain: [xMin, xMax],
                formatter: formatTimestamp,
              }}
              yAxis={{
                label: "Amplitude (μV)",
                domain: [yMin, yMax],
                formatter: (value: number) => `${value.toFixed(0)}`,
              }}
              width={800}
              height={400}
            >
              <LineChart.Canvas showGrid={true} />
              <LineChart.Axes />
              <LineChart.Tooltip />
            </LineChart.Root>
          </div>
        </div>
      }
    />
  );
}

function PrimitiveExample() {
  const { color } = useColorScheme();

  return (
    <ComponentPreview
      title="Primitive Components"
      description="Use primitive components for complete control over composition"
      code={`import { LineChart } from "@/components/plexusui/charts/line-chart";

const data = Array.from({ length: 100 }, (_, i) => ({
  x: i,
  y: Math.sin(i / 10) * 50 + 50,
}));

// Compose your own chart with primitives
<LineChart.Root
  series={[{ name: "Signal", data, color: "#8b5cf6" }]}
  width={800}
  height={400}
>
  <LineChart.Canvas showGrid />
  <LineChart.Axes />
  <LineChart.Tooltip />
</LineChart.Root>`}
      preview={
        <div className="w-full">
          <div className="h-[400px]">
            <LineChart.Root
              series={[
                {
                  name: "Custom Signal",
                  data: Array.from({ length: 100 }, (_, i) => ({
                    x: i,
                    y: Math.sin(i / 10) * 50 + 50,
                  })),
                  color: color,
                },
              ]}
              width={800}
              height={400}
              preferWebGPU={true}
            >
              <LineChart.Canvas showGrid />
              <LineChart.Axes />
              <LineChart.Tooltip />
            </LineChart.Root>
          </div>
        </div>
      }
    />
  );
}

function WebGPUPerformanceMonitor() {
  const colors = useMultiColors(6);
  const [isPaused, setIsPaused] = useState(false);

  // Performance tracking parameters
  const WINDOW_DURATION = 3; // seconds of performance history
  const UPDATE_RATE = 60; // Hz - update at 60fps
  const WINDOW_SIZE = UPDATE_RATE * WINDOW_DURATION; // 180 frames total

  // WebGPU pipeline stages with realistic baseline timings (ms)
  const stages = {
    vertex: { name: "Vertex", baseline: 0.8, variance: 0.3, spike: 0.8 },
    fragment: { name: "Fragment", baseline: 2.5, variance: 0.5, spike: 2.0 },
    compute: { name: "Compute", baseline: 1.8, variance: 0.4, spike: 3.0 },
    copy: { name: "Copy", baseline: 0.5, variance: 0.2, spike: 0.6 },
    render: { name: "Render", baseline: 1.2, variance: 0.3, spike: 1.5 },
    present: { name: "Present", baseline: 0.4, variance: 0.1, spike: 0.3 },
  };

  // Initialize with baseline performance data
  const [vertexData, setVertexData] = useState<DataPoint[]>(() =>
    Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      x: i / UPDATE_RATE,
      y: stages.vertex.baseline,
    }))
  );

  const [fragmentData, setFragmentData] = useState<DataPoint[]>(() =>
    Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      x: i / UPDATE_RATE,
      y: stages.fragment.baseline,
    }))
  );

  const [computeData, setComputeData] = useState<DataPoint[]>(() =>
    Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      x: i / UPDATE_RATE,
      y: stages.compute.baseline,
    }))
  );

  const [copyData, setCopyData] = useState<DataPoint[]>(() =>
    Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      x: i / UPDATE_RATE,
      y: stages.copy.baseline,
    }))
  );

  const [renderData, setRenderData] = useState<DataPoint[]>(() =>
    Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      x: i / UPDATE_RATE,
      y: stages.render.baseline,
    }))
  );

  const [presentData, setPresentData] = useState<DataPoint[]>(() =>
    Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      x: i / UPDATE_RATE,
      y: stages.present.baseline,
    }))
  );

  useEffect(() => {
    if (isPaused) return;

    let animationFrame: number;

    const animate = () => {
      // Helper function to generate realistic GPU timing
      const generateTiming = (stage: typeof stages.vertex, prevValue: number) => {
        // Smooth drift around baseline
        const drift = (Math.random() - 0.5) * stage.variance;

        // Occasional performance spike (heavy workload, cache miss, etc.)
        const spike = Math.random() < 0.03 ? Math.random() * stage.spike : 0;

        // Smooth interpolation towards baseline (prevents runaway values)
        const toBaseline = (stage.baseline - prevValue) * 0.1;

        const newValue = prevValue + drift + spike + toBaseline;

        // Clamp to realistic range
        return Math.max(0.1, Math.min(stage.baseline * 4, newValue));
      };

      // Update each pipeline stage
      setVertexData((prev) => {
        const lastTime = prev[prev.length - 1].x;
        const lastValue = prev[prev.length - 1].y;
        const newTime = lastTime + 1 / UPDATE_RATE;
        const newValue = generateTiming(stages.vertex, lastValue);

        return [...prev.slice(-(WINDOW_SIZE - 1)), { x: newTime, y: newValue }];
      });

      setFragmentData((prev) => {
        const lastTime = prev[prev.length - 1].x;
        const lastValue = prev[prev.length - 1].y;
        const newTime = lastTime + 1 / UPDATE_RATE;
        const newValue = generateTiming(stages.fragment, lastValue);

        return [...prev.slice(-(WINDOW_SIZE - 1)), { x: newTime, y: newValue }];
      });

      setComputeData((prev) => {
        const lastTime = prev[prev.length - 1].x;
        const lastValue = prev[prev.length - 1].y;
        const newTime = lastTime + 1 / UPDATE_RATE;
        const newValue = generateTiming(stages.compute, lastValue);

        return [...prev.slice(-(WINDOW_SIZE - 1)), { x: newTime, y: newValue }];
      });

      setCopyData((prev) => {
        const lastTime = prev[prev.length - 1].x;
        const lastValue = prev[prev.length - 1].y;
        const newTime = lastTime + 1 / UPDATE_RATE;
        const newValue = generateTiming(stages.copy, lastValue);

        return [...prev.slice(-(WINDOW_SIZE - 1)), { x: newTime, y: newValue }];
      });

      setRenderData((prev) => {
        const lastTime = prev[prev.length - 1].x;
        const lastValue = prev[prev.length - 1].y;
        const newTime = lastTime + 1 / UPDATE_RATE;
        const newValue = generateTiming(stages.render, lastValue);

        return [...prev.slice(-(WINDOW_SIZE - 1)), { x: newTime, y: newValue }];
      });

      setPresentData((prev) => {
        const lastTime = prev[prev.length - 1].x;
        const lastValue = prev[prev.length - 1].y;
        const newTime = lastTime + 1 / UPDATE_RATE;
        const newValue = generateTiming(stages.present, lastValue);

        return [...prev.slice(-(WINDOW_SIZE - 1)), { x: newTime, y: newValue }];
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isPaused, WINDOW_SIZE]);

  // Calculate domain
  const xMin = vertexData[0]?.x || 0;
  const xMax = vertexData[vertexData.length - 1]?.x || WINDOW_DURATION;

  return (
    <ComponentPreview
      title="Real-Time WebGPU Performance Monitor"
      description="Live GPU pipeline stage timings with 3-second rolling window - Perfect for aerospace rendering optimization"
      code={`import { LineChart } from "@/components/plexusui/charts/line-chart";
import { useState, useEffect } from "react";

// WebGPU pipeline stages with realistic characteristics
const stages = {
  vertex: { baseline: 0.8, variance: 0.3, spike: 0.8 },
  fragment: { baseline: 2.5, variance: 0.5, spike: 2.0 },
  compute: { baseline: 1.8, variance: 0.4, spike: 3.0 },
  // ... other stages
};

// Generate realistic GPU timing with drift and spikes
const generateTiming = (stage, prevValue) => {
  const drift = (Math.random() - 0.5) * stage.variance;
  const spike = Math.random() < 0.03 ? Math.random() * stage.spike : 0;
  const toBaseline = (stage.baseline - prevValue) * 0.1;

  return Math.max(0.1, Math.min(
    stage.baseline * 4,
    prevValue + drift + spike + toBaseline
  ));
};

// Stream at 60fps with rolling 3-second window
useEffect(() => {
  const animate = () => {
    setVertexData(prev => [...prev.slice(-179), {
      x: lastTime + 1/60,
      y: generateTiming(stages.vertex, lastValue)
    }]);
    // ... update other stages
    requestAnimationFrame(animate);
  };

  const frame = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(frame);
}, []);

<LineChart
  series={[
    { name: "Vertex", data: vertexData, color: "#06b6d4" },
    { name: "Fragment", data: fragmentData, color: "#f59e0b" },
    // ... other stages
  ]}
  yAxis={{ label: "Time (ms)", domain: [0, 12] }}
  preferWebGPU={true}
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">WebGPU Performance Monitor</div>
              <div className="text-xs text-zinc-500">
                Update Rate: {UPDATE_RATE} fps | Window: {WINDOW_DURATION}s ({WINDOW_SIZE} frames)
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

          <div className="relative">
            <div style={{ height: 400 }}>
              <LineChart.Root
                series={[
                  {
                    name: "Vertex",
                    data: vertexData,
                    color: colors[0],
                    strokeWidth: 2,
                  },
                  {
                    name: "Fragment",
                    data: fragmentData,
                    color: colors[1],
                    strokeWidth: 2,
                  },
                  {
                    name: "Compute",
                    data: computeData,
                    color: colors[2],
                    strokeWidth: 2,
                  },
                  {
                    name: "Copy",
                    data: copyData,
                    color: colors[3],
                    strokeWidth: 2,
                  },
                  {
                    name: "Render",
                    data: renderData,
                    color: colors[4],
                    strokeWidth: 2,
                  },
                  {
                    name: "Present",
                    data: presentData,
                    color: colors[5],
                    strokeWidth: 2,
                  },
                ]}
                xAxis={{
                  label: "Time (seconds)",
                  domain: [xMin, xMax],
                  formatter: (v: number) => `${v.toFixed(1)}s`,
                }}
                yAxis={{
                  label: "GPU Time (ms)",
                  domain: [0, 12],
                  formatter: (v: number) => v.toFixed(1),
                }}
                width={800}
                height={400}
                preferWebGPU={true}
              >
                <LineChart.Canvas showGrid={true} />
                <LineChart.Axes />
                <LineChart.Tooltip />
              </LineChart.Root>
            </div>
          </div>
        </div>
      }
    />
  );
}

export function LineChartExamples() {
  return (
    <div className="space-y-8">
      <StreamingChart />
      <WebGPUPerformanceMonitor />
      <PrimitiveExample />
    </div>
  );
}
