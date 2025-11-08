"use client";

/**
 * Waveform Monitor - Composable API Example
 *
 * This example demonstrates the composable primitive API
 * for advanced customization and control.
 */

import { useEffect, useState } from "react";
import {
  WaveformMonitor,
  type WaveformTrace,
} from "@plexusui/components/charts/waveform-monitor";
import { ComponentPreview } from "@/components/component-preview";

// ============================================================================
// Custom Overlay Components
// ============================================================================

/**
 * Custom marker overlay - demonstrates how to add UI on top of canvas
 */
function WaveformMarkers({
  markers,
}: {
  markers: Array<{ x: number; label: string }>;
}) {
  return (
    <>
      {markers.map((marker, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${marker.x}%`,
            top: 0,
            bottom: 0,
            borderLeft: "2px dashed rgba(255, 100, 100, 0.5)",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 4,
              background: "rgba(0, 0, 0, 0.8)",
              color: "white",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            {marker.label}
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Custom legend overlay
 */
function WaveformLegend({ traces }: { traces: WaveformTrace[] }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        right: 8,
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: 8,
        borderRadius: 6,
        fontSize: 11,
        pointerEvents: "auto",
      }}
    >
      {traces.map((trace) => (
        <div
          key={trace.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 12,
              height: 2,
              background: trace.color
                ? `rgb(${trace.color[0] * 255}, ${trace.color[1] * 255}, ${
                    trace.color[2] * 255
                  })`
                : "white",
            }}
          />
          <span>{trace.label || trace.id}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Example Data
// ============================================================================

function generateSineWave(
  points: number,
  frequency: number,
  amplitude: number,
  phase: number = 0
): WaveformTrace["data"] {
  const data: Array<[number, number]> = [];
  for (let i = 0; i < points; i++) {
    const x = (i / points) * 10;
    const y = amplitude * Math.sin(2 * Math.PI * frequency * x + phase);
    data.push([x, y]);
  }
  return data;
}

export const WaveformComposableExample = () => {
  const [time, setTime] = useState(0);

  // Animate the waveforms
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 0.05);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const traces: WaveformTrace[] = [
    {
      id: "sine1",
      label: "Signal A",
      data: generateSineWave(1000, 0.5, 0.8, time),
      color: [0.2, 0.8, 0.3],
    },
    {
      id: "sine2",
      label: "Signal B",
      data: generateSineWave(1000, 0.7, 0.6, time + Math.PI / 4),
      color: [0.3, 0.6, 0.9],
    },
    {
      id: "sine3",
      label: "Signal C",
      data: generateSineWave(1000, 0.3, 0.4, time + Math.PI / 2),
      color: [0.9, 0.4, 0.4],
    },
  ];

  const markers = [
    { x: 25, label: "T1" },
    { x: 50, label: "T2" },
    { x: 75, label: "T3" },
  ];

  return (
    <div className="space-y-12">
      {/* Simple API Example */}
      <ComponentPreview
        title="Simple API (Recommended)"
        description="The simplest way to use WaveformMonitor - just pass traces and it works."
        preview={
          <WaveformMonitor
            width={800}
            height={300}
            traces={traces}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg"
          />
        }
        code={`<WaveformMonitor
  width={800}
  height={300}
  traces={[
    {
      id: "sine1",
      label: "Signal A",
      data: data1,
      color: [0.2, 0.8, 0.3],
    },
    {
      id: "sine2",
      label: "Signal B",
      data: data2,
      color: [0.3, 0.6, 0.9],
    },
  ]}
  className="border rounded-lg"
/>`}
      />

      {/* Composable API Example */}
      <ComponentPreview
        title="Composable API (Advanced)"
        description="Use primitives for full control - add custom overlays, markers, legends, or any UI elements on top of the canvas."
        preview={
          <WaveformMonitor.Root width={800} height={300} traces={traces}>
            <WaveformMonitor.Container className="border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <WaveformMonitor.Canvas />
              <WaveformMonitor.Traces />
              <WaveformMonitor.Overlay>
                <WaveformMarkers markers={markers} />
                <WaveformLegend traces={traces} />
              </WaveformMonitor.Overlay>
            </WaveformMonitor.Container>
          </WaveformMonitor.Root>
        }
        code={`// Custom marker component
function WaveformMarkers({ markers }) {
  return (
    <>
      {markers.map((marker, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: \`\${marker.x}%\`,
            borderLeft: "2px dashed rgba(255, 100, 100, 0.5)",
          }}
        >
          <div className="marker-label">{marker.label}</div>
        </div>
      ))}
    </>
  );
}

// Composable usage
<WaveformMonitor.Root width={800} height={300} traces={traces}>
  <WaveformMonitor.Container className="border rounded-lg">
    <WaveformMonitor.Canvas />
    <WaveformMonitor.Traces />
    <WaveformMonitor.Overlay>
      <WaveformMarkers markers={markers} />
      <WaveformLegend traces={traces} />
    </WaveformMonitor.Overlay>
  </WaveformMonitor.Container>
</WaveformMonitor.Root>`}
      />

      {/* Custom Styled Example */}
      <ComponentPreview
        title="Custom Styling"
        description="Override default styles using primitives. This example shows a custom background and container style."
        preview={
          <WaveformMonitor.Root
            width={800}
            height={200}
            traces={traces}
            backgroundColor={[0.1, 0.1, 0.15, 1.0]}
            margin={{ top: 20, right: 20, bottom: 20, left: 50 }}
          >
            <WaveformMonitor.Container
              className="rounded-xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20,20,30,1) 0%, rgba(30,30,40,1) 100%)",
                border: "2px solid rgba(100,100,150,0.3)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              <WaveformMonitor.Canvas />
              <WaveformMonitor.Traces />
            </WaveformMonitor.Container>
          </WaveformMonitor.Root>
        }
        code={`<WaveformMonitor.Root
  width={800}
  height={200}
  traces={traces}
  backgroundColor={[0.1, 0.1, 0.15, 1.0]}
  margin={{ top: 20, right: 20, bottom: 20, left: 50 }}
>
  <WaveformMonitor.Container
    className="rounded-xl overflow-hidden"
    style={{
      background: "linear-gradient(135deg, rgba(20,20,30,1) 0%, rgba(30,30,40,1) 100%)",
      border: "2px solid rgba(100,100,150,0.3)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}
  >
    <WaveformMonitor.Canvas />
    <WaveformMonitor.Traces />
  </WaveformMonitor.Container>
</WaveformMonitor.Root>`}
      />

      {/* API Reference */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Available Primitives</h3>
        <div className="grid gap-4">
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h4 className="font-semibold mb-2">WaveformMonitor.Root</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Provides context for all child components. Contains width, height,
              traces, domains, margins, and callbacks.
            </p>
          </div>
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h4 className="font-semibold mb-2">WaveformMonitor.Container</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Wrapper div with relative positioning. Add className and style
              props for custom styling.
            </p>
          </div>
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h4 className="font-semibold mb-2">WaveformMonitor.Canvas</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              The canvas element where traces are rendered using WebGPU.
              Automatically sized to match Root dimensions.
            </p>
          </div>
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h4 className="font-semibold mb-2">WaveformMonitor.Traces</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Renders the waveform traces using UnifiedWaveformRenderer. Uses
              WebGPU acceleration for datasets &gt;5k points.
            </p>
          </div>
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h4 className="font-semibold mb-2">WaveformMonitor.Overlay</h4>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Absolutely positioned overlay for custom UI elements. Perfect for
              markers, annotations, legends, controls, etc. Has pointerEvents:
              none by default (override in children).
            </p>
          </div>
        </div>
      </div>

      {/* Usage Patterns */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">When to Use Each API</h3>
        <div className="grid gap-4">
          <div className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 rounded-lg">
            <h4 className="font-semibold mb-2 text-green-900 dark:text-green-100">
              ✅ Simple API - Use when:
            </h4>
            <ul className="text-sm text-green-800 dark:text-green-200 list-disc list-inside space-y-1">
              <li>You just need to display waveforms</li>
              <li>Default styling is sufficient</li>
              <li>No custom overlays needed</li>
              <li>Getting started or prototyping</li>
            </ul>
          </div>
          <div className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              🎨 Composable API - Use when:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 list-disc list-inside space-y-1">
              <li>Adding custom markers or annotations</li>
              <li>Building custom legends or controls</li>
              <li>Overlaying additional UI elements</li>
              <li>Full control over styling and layout</li>
              <li>Advanced use cases and customization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
