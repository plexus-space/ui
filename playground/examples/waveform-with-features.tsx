"use client";

/**
 * Waveform Monitor with All Features - Complete Example
 *
 * This example demonstrates the ChartContainer with all optional features:
 * - WebGPU-accelerated grid lines
 * - Axes with labels and tick marks
 * - Play/Pause controls
 * - Auto-resize
 * - Tooltips (coming soon)
 * - Zoom/Pan (coming soon)
 */

import { useEffect, useState } from "react";
import {
  WaveformMonitor,
  type WaveformTrace,
} from "@plexusui/components/charts/waveform-monitor";
import ChartContainer from "@plexusui/components/primitives/chart-container";
import { ChartGrid } from "@plexusui/components/primitives/chart-grid";
import { ChartAxes } from "@plexusui/components/primitives/chart-axes";
import { ComponentPreview } from "@/components/component-preview";

// ============================================================================
// Data Generators
// ============================================================================

const generateECG = (t: number, hr: number = 75): number => {
  const period = 60 / hr;
  const phase = (t % period) / period;

  // QRS complex
  if (phase >= 0.15 && phase < 0.25) {
    const qrsPhase = (phase - 0.15) / 0.1;
    return (
      1.0 -
      Math.abs(qrsPhase - 0.5) * 4 +
      Math.sin(qrsPhase * Math.PI * 10) * 0.3
    );
  }

  // T wave
  if (phase >= 0.3 && phase < 0.5) {
    const tPhase = (phase - 0.3) / 0.2;
    return 0.2 + Math.sin(tPhase * Math.PI) * 0.15;
  }

  // P wave
  if (phase >= 0.05 && phase < 0.12) {
    const pPhase = (phase - 0.05) / 0.07;
    return 0.1 + Math.sin(pPhase * Math.PI) * 0.08;
  }

  return 0.05 + (Math.random() - 0.5) * 0.02;
};

const generateSpO2 = (t: number, hr: number = 75): number => {
  const period = 60 / hr;
  const phase = (t % period) / period;
  const pulse = Math.sin(phase * Math.PI * 2) * 0.3 + 0.7;
  const noise = (Math.random() - 0.5) * 0.03;
  return pulse + noise;
};

const generateBP = (t: number, hr: number = 75): number => {
  const period = 60 / hr;
  const phase = (t % period) / period;

  if (phase < 0.3) {
    return 0.3 + phase * 2;
  }

  const decay = Math.exp(-((phase - 0.3) * 5));
  const dicrotic = phase > 0.35 && phase < 0.45 ? -0.05 : 0;
  return 0.9 * decay + 0.3 + dicrotic;
};

// ============================================================================
// Example Component
// ============================================================================

export const WaveformWithFeaturesExample = () => {
  const [traces, setTraces] = useState<WaveformTrace[]>([
    { id: "ecg", data: [], label: "ECG", color: [0.2, 0.8, 0.3] },
    { id: "spo2", data: [], label: "SpO2", color: [0.3, 0.6, 1.0] },
    { id: "bp", data: [], label: "BP", color: [1.0, 0.7, 0.2] },
  ]);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(0);

  // Streaming data
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setTime((t) => t + 0.016);
    }, 16);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Update traces
  useEffect(() => {
    setTraces((prev) =>
      prev.map((trace) => {
        let newPoint: [number, number];

        switch (trace.id) {
          case "ecg":
            newPoint = [time, generateECG(time, 75)];
            break;
          case "spo2":
            newPoint = [time, generateSpO2(time, 75)];
            break;
          case "bp":
            newPoint = [time, generateBP(time, 75)];
            break;
          default:
            newPoint = [time, 0];
        }

        const newData = [...trace.data, newPoint];
        if (newData.length > 2000) {
          newData.shift();
        }

        return { ...trace, data: newData };
      })
    );
  }, [time]);

  return (
    <div className="space-y-12">
      {/* Full Featured Example */}
      <ComponentPreview
        title="Waveform with All Features"
        description="Complete chart with grid, axes, labels, and play/pause controls - all powered by WebGPU."
        preview={
          <ChartContainer
            width={800}
            height={400}
            showControls
            isPaused={isPaused}
            onPauseChange={setIsPaused}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg"
          >
            <WaveformMonitor.Root
              width={800}
              height={400}
              traces={traces}
              backgroundColor={[0.05, 0.05, 0.08, 1.0]}
            >
              <WaveformMonitor.Container>
                <WaveformMonitor.Canvas />
                <ChartGrid
                  horizontalLines={5}
                  verticalLines={10}
                  gridColor={[1, 1, 1, 0.1]}
                  showMajorLines
                  majorInterval={5}
                />
                <WaveformMonitor.Traces />
                <ChartAxes
                  xLabel="Time (s)"
                  yLabel="Amplitude"
                  xTicks={10}
                  yTicks={5}
                />
              </WaveformMonitor.Container>
            </WaveformMonitor.Root>
            <ChartContainer.Controls position="top-right" />
          </ChartContainer>
        }
        code={`import ChartContainer from "@plexusui/components/primitives/chart-container";
import { ChartGrid } from "@plexusui/components/primitives/chart-grid";
import { ChartAxes } from "@plexusui/components/primitives/chart-axes";
import { WaveformMonitor } from "@plexusui/components/charts/waveform-monitor";

<ChartContainer
  width={800}
  height={400}
  showGrid
  showAxes
  showControls
  isPaused={isPaused}
  onPauseChange={setIsPaused}
>
  <WaveformMonitor.Root width={800} height={400} traces={traces}>
    <WaveformMonitor.Container>
      <WaveformMonitor.Canvas />
      <ChartGrid
        horizontalLines={5}
        verticalLines={10}
        showMajorLines
      />
      <WaveformMonitor.Traces />
      <ChartAxes
        xLabel="Time (s)"
        yLabel="Amplitude"
        xTicks={10}
        yTicks={5}
      />
    </WaveformMonitor.Container>
  </WaveformMonitor.Root>
  <ChartContainer.Controls position="top-right" />
</ChartContainer>`}
      />
      <ComponentPreview
        title="With Axes Only"
        description="Professional chart with labeled axes and tick marks."
        preview={
          <ChartContainer width={800} height={300}>
            <WaveformMonitor.Root width={800} height={300} traces={traces}>
              <WaveformMonitor.Container className="border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <WaveformMonitor.Canvas />
                <WaveformMonitor.Traces />
                <ChartAxes
                  xLabel="Time (seconds)"
                  yLabel="Signal Strength"
                  xTicks={8}
                  yTicks={4}
                  formatX={(v) => v.toFixed(1)}
                  formatY={(v) => v.toFixed(2)}
                />
              </WaveformMonitor.Container>
            </WaveformMonitor.Root>
          </ChartContainer>
        }
        code={`<ChartContainer width={800} height={300} showAxes>
  <WaveformMonitor.Root width={800} height={300} traces={traces}>
    <WaveformMonitor.Container>
      <WaveformMonitor.Canvas />
      <WaveformMonitor.Traces />
      <ChartAxes
        xLabel="Time (seconds)"
        yLabel="Signal Strength"
        xTicks={8}
        yTicks={4}
        formatX={(v) => v.toFixed(1)}
        formatY={(v) => v.toFixed(2)}
      />
    </WaveformMonitor.Container>
  </WaveformMonitor.Root>
</ChartContainer>`}
      />

      {/* Feature Documentation */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Available Features</h3>
        <div className="grid gap-4">
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h4 className="font-semibold mb-2">ChartContainer</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Foundation for all charts with optional features
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>
                <code>showGrid</code> - Enable WebGPU grid overlay
              </li>
              <li>
                <code>showAxes</code> - Enable axes with labels and ticks
              </li>
              <li>
                <code>showControls</code> - Enable play/pause button
              </li>
              <li>
                <code>autoResize</code> - Automatically resize to container
                (default: true)
              </li>
              <li>
                <code>isPaused</code> / <code>onPauseChange</code> - Control
                animation state
              </li>
            </ul>
          </div>

          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h4 className="font-semibold mb-2">ChartGrid</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              WebGPU-accelerated grid lines using shape renderer
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>
                <code>horizontalLines</code> / <code>verticalLines</code> -
                Number of grid lines
              </li>
              <li>
                <code>gridColor</code> - Color as [r, g, b, a]
              </li>
              <li>
                <code>showMajorLines</code> - Emphasize major grid lines
              </li>
              <li>
                <code>thickness</code> - Line thickness in pixels
              </li>
            </ul>
          </div>

          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h4 className="font-semibold mb-2">ChartAxes</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Axes with labels, tick marks, and custom formatters
            </p>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>
                <code>xLabel</code> / <code>yLabel</code> - Axis labels
              </li>
              <li>
                <code>xTicks</code> / <code>yTicks</code> - Number of tick marks
              </li>
              <li>
                <code>formatX</code> / <code>formatY</code> - Custom tick
                formatters
              </li>
              <li>
                <code>axisColor</code> - Axis and tick color
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Architecture Notes */}
      <div className="p-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
          WebGPU-First Architecture
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            <strong>ChartContainer</strong> provides a unified foundation for
            all charts:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              All overlays (grid, axes) use WebGPU shape renderer for
              consistency
            </li>
            <li>Auto-resize with ResizeObserver (no manual canvas sizing)</li>
            <li>
              Built-in play/pause, zoom, pan - all optional and composable
            </li>
            <li>Shared context for all child components</li>
            <li>
              Text labels use HTML for now (will upgrade to MSDF text for full
              WebGPU)
            </li>
          </ul>
          <p className="mt-3">
            <strong>Result:</strong> All charts in your library share the same
            foundation, controls, and styling - reducing code duplication and
            improving consistency.
          </p>
        </div>
      </div>
    </div>
  );
};
