"use client";

import { LineChart } from "@plexusui/components/charts/line-chart";
import type { DataPoint } from "@plexusui/components/charts/line-chart";
import { ComponentPreview } from "@/components/component-preview";
import { useState, useEffect } from "react";

// ============================================================================
// Example Data
// ============================================================================

const telemetryData: DataPoint[] = Array.from({ length: 200 }, (_, i) => ({
  x: i,
  y: Math.sin(i / 20) * 50 + Math.random() * 10 + 50,
}));
// ============================================================================
// Example Components
// ============================================================================

export function TelemetryChart() {
  // Use explicit domain for telemetry data (edge-to-edge)
  const xMin = telemetryData[0].x;
  const xMax = telemetryData[telemetryData.length - 1].x;

  return (
    <ComponentPreview
      title="Telemetry Data"
      description="High-frequency sensor data visualization"
      code={`const telemetryData = Array.from({ length: 200 }, (_, i) => ({
  x: i,
  y: Math.sin(i / 20) * 50 + Math.random() * 10 + 50,
}));

<LineChart
  series={[{
    name: "Sensor",
    data: telemetryData,
    color: "#f59e0b",
  }]}
  xAxis={{ domain: [telemetryData[0].x, telemetryData[telemetryData.length - 1].x] }}
  showGrid={true}
  width={800}
  height={400}
/>`}
      preview={
        <div className="w-full">
          <div className="h-[400px]">
            <LineChart.Root
              series={[
                {
                  name: "Sensor",
                  data: telemetryData,
                  color: "#f59e0b",
                },
              ]}
              xAxis={{ domain: [xMin, xMax] }}
              width={800}
              height={400}
            >
              <LineChart.Canvas showGrid={true} />
              <LineChart.Axes />
              <LineChart.Tooltip />
            </LineChart.Root>
          </div>

          {/* Legend positioned below the chart */}
          <div className="flex justify-center mt-2">
            <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-[#f59e0b]" />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    Sensor
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

// ============================================================================
// Main Export
// ============================================================================

// ============================================================================
// EEG Wave Generator
// ============================================================================

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
        for (let i = 0; i < SAMPLES_PER_UPDATE; i++) {
          const lastTime = prev.length > 0 ? prev[prev.length - 1].x : 0;
          const newTime = lastTime + 1 / SAMPLING_RATE;
          const timeRadians = newTime * Math.PI * 2;
          newPoints.push({ x: newTime, y: generateEEGSample(timeRadians, 0) });
        }
        return [
          ...prev.slice(-(WINDOW_SIZE - SAMPLES_PER_UPDATE)),
          ...newPoints,
        ];
      });

      setChannel2((prev) => {
        const newPoints: DataPoint[] = [];
        for (let i = 0; i < SAMPLES_PER_UPDATE; i++) {
          const lastTime = prev.length > 0 ? prev[prev.length - 1].x : 0;
          const newTime = lastTime + 1 / SAMPLING_RATE;
          const timeRadians = newTime * Math.PI * 2;
          newPoints.push({
            x: newTime,
            y: generateEEGSample(timeRadians, Math.PI / 3),
          });
        }
        return [
          ...prev.slice(-(WINDOW_SIZE - SAMPLES_PER_UPDATE)),
          ...newPoints,
        ];
      });

      setChannel3((prev) => {
        const newPoints: DataPoint[] = [];
        for (let i = 0; i < SAMPLES_PER_UPDATE; i++) {
          const lastTime = prev.length > 0 ? prev[prev.length - 1].x : 0;
          const newTime = lastTime + 1 / SAMPLING_RATE;
          const timeRadians = newTime * Math.PI * 2;
          newPoints.push({
            x: newTime,
            y: generateEEGSample(timeRadians, Math.PI / 1.5),
          });
        }
        return [
          ...prev.slice(-(WINDOW_SIZE - SAMPLES_PER_UPDATE)),
          ...newPoints,
        ];
      });
    }, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, UPDATE_INTERVAL, WINDOW_SIZE, SAMPLES_PER_UPDATE]);

  // Calculate exact domain for streaming data (no padding)
  const xMin = channel1.length > 0 ? channel1[0].x : 0;
  const xMax =
    channel1.length > 0 ? channel1[channel1.length - 1].x : WINDOW_DURATION;

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

const [isPaused, setIsPaused] = useState(false);
const [data, setData] = useState<DataPoint[]>(/* initial EEG data */);

useEffect(() => {
  if (isPaused) return;

  const interval = setInterval(() => {
    setData(prev => {
      const lastTime = prev[prev.length - 1].x;
      const newTime = lastTime + 1 / SAMPLING_RATE;
      const newSample = generateEEGSample(newTime * Math.PI * 2, 0);
      return [...prev.slice(-(WINDOW_SIZE - 1)), { x: newTime, y: newSample }];
    });
  }, 1000 / SAMPLING_RATE); // ~4ms updates

  return () => clearInterval(interval);
}, [isPaused]);

<button onClick={() => setIsPaused(!isPaused)}>
  {isPaused ? "▶ Resume" : "⏸ Pause"}
</button>

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
              <div className="text-xs text-zinc-500">
                Sampling Rate: {SAMPLING_RATE} Hz | Window: {WINDOW_DURATION}s (
                {WINDOW_SIZE} samples) |
                {isPaused ? " ⏸ Paused" : " ▶ Recording"}
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

          <LineChart.Root
            series={[
              {
                name: "Fp1 (Frontal)",
                data: channel1,
                color: "#06b6d4",
                strokeWidth: 1.5,
              },
              {
                name: "C3 (Central)",
                data: channel2,
                color: "#f59e0b",
                strokeWidth: 1.5,
              },
              {
                name: "O1 (Occipital)",
                data: channel3,
                color: "#ec4899",
                strokeWidth: 1.5,
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
            height={500}
          >
            <LineChart.Canvas showGrid={true} />
            <LineChart.Axes />
            <LineChart.Tooltip />
          </LineChart.Root>

          {/* Legend positioned below the chart */}
          <div className="flex justify-center mt-2 mb-4">
            <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-[#06b6d4]" />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    Fp1 (Frontal)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-[#f59e0b]" />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    C3 (Central)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-[#ec4899]" />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    O1 (Occipital)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 space-y-1">
            <div>
              <span className="font-semibold">Brain Wave Bands:</span> Delta
              (0.5-4Hz, deep sleep), Theta (4-8Hz, meditation), Alpha (8-13Hz,
              relaxed), Beta (13-30Hz, active), Gamma (30-100Hz, cognition)
            </div>
            <div>
              <span className="font-semibold">Clinical Applications:</span>{" "}
              Epilepsy diagnosis, sleep studies, brain-computer interfaces,
              cognitive research, anesthesia monitoring
            </div>
          </div>
        </div>
      }
    />
  );
}

function PrimitiveExample() {
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
  <LineChart.Legend />
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
                  color: "#8b5cf6",
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

          {/* Legend positioned below the chart */}
          <div className="flex justify-center mt-2">
            <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-0.5 bg-[#8b5cf6]" />
                  <span className="text-zinc-700 dark:text-zinc-300">
                    Custom Signal
                  </span>
                </div>
              </div>
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
      <TelemetryChart />
      <StreamingChart />
      <PrimitiveExample />
    </div>
  );
}
