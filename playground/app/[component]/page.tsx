"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { components } from "../../constants/components";

// Import components dynamically
import { LineChart } from "@/../components/line-chart";
import Link from "next/link";
import { Footer } from "@/components/footer";

// ============================================================================
// Component Examples
// ============================================================================

const LineChartExamples = () => {
  const [streamingData, setStreamingData] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: i,
      y: Math.sin(i / 5) * 20 + 50,
    }))
  );

  // Simulate real-time streaming
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamingData((prev) => {
        const next = [...prev];
        const lastX = next[next.length - 1].x;
        next.push({
          x: lastX + 1,
          y: Math.sin((lastX + 1) / 5) * 20 + 50 + Math.random() * 5,
        });
        return next.slice(-100);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12">
      {/* Basic Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Basic Line Chart</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          A simple line chart with a single series.
        </p>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-950 overflow-auto">
          <LineChart
            series={[
              {
                name: "Temperature",
                data: Array.from({ length: 100 }, (_, i) => ({
                  x: i,
                  y: Math.sin(i / 10) * 15 + 25,
                })),
                color: "#3b82f6",
              },
            ]}
            xAxis={{ label: "Time (s)" }}
            yAxis={{ label: "Temperature (°C)" }}
            width={900}
            height={420}
            showGrid={true}
          />
        </div>
        <pre className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-x-auto text-sm">
          <code>{`<LineChart
  series={[
    {
      name: "Temperature",
      data: Array.from({ length: 100 }, (_, i) => ({
        x: i,
        y: Math.sin(i / 10) * 15 + 25,
      })),
    },
  ]}
  xAxis={{ label: "Time (s)" }}
  yAxis={{ label: "Temperature (°C)" }}
  showGrid={true}
/>`}</code>
        </pre>
      </section>

      {/* Multi-Series Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Multi-Series</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Multiple data series with different styles. Hover to see tooltips.
        </p>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-950 overflow-auto">
          <LineChart
            series={[
              {
                name: "Altitude",
                data: Array.from({ length: 100 }, (_, i) => ({
                  x: i,
                  y: i * 0.8 + Math.sin(i / 8) * 10,
                })),
                filled: true,
                color: "#3b82f6",
              },
              {
                name: "Target",
                data: Array.from({ length: 100 }, (_, i) => ({
                  x: i,
                  y: i * 0.8,
                })),
                dashed: true,
                strokeWidth: 2,
                color: "#ef4444",
              },
              {
                name: "Safety Limit",
                data: Array.from({ length: 100 }, (_, i) => ({
                  x: i,
                  y: 90,
                })),
                strokeWidth: 1,
                color: "#10b981",
              },
            ]}
            xAxis={{ label: "Time (s)" }}
            yAxis={{ label: "Altitude (km)" }}
            width={900}
            height={420}
            showGrid={true}
          />
        </div>
        <pre className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-x-auto text-sm">
          <code>{`<LineChart
  series={[
    {
      name: "Altitude",
      data: [...],
      filled: true,
    },
    {
      name: "Target",
      data: [...],
      dashed: true,
    },
  ]}
  xAxis={{ label: "Time (s)" }}
  yAxis={{ label: "Altitude (km)" }}
  showGrid={true}
/>`}</code>
        </pre>
      </section>

      {/* Large Dataset with Decimation */}
      <section>
        <h3 className="text-lg font-semibold mb-4">
          Large Dataset (10,000 Points)
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          10,000 data points with automatic decimation for smooth performance.
          Uses LTTB algorithm to preserve visual shape.
        </p>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-950 overflow-auto">
          <LineChart
            series={[
              {
                name: "Sensor Data",
                data: Array.from({ length: 10000 }, (_, i) => ({
                  x: i,
                  y:
                    Math.sin(i / 100) * 20 +
                    Math.sin(i / 10) * 5 +
                    Math.random() * 2 +
                    50,
                })),
                color: "#8b5cf6",
              },
            ]}
            xAxis={{ label: "Sample" }}
            yAxis={{ label: "Value" }}
            width={900}
            height={420}
            showGrid={true}
            maxPoints={1000}
            renderer="canvas"
          />
        </div>
        <pre className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-x-auto text-sm">
          <code>{`<LineChart
  series={[
    {
      name: "Sensor Data",
      data: largeDataset, // 10,000 points
    },
  ]}
  maxPoints={1000}
  renderer="canvas"
/>`}</code>
        </pre>
      </section>

      {/* Real-Time Streaming */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Real-Time Streaming</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Live data streaming with a sliding window. Perfect for telemetry
          displays.
        </p>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-950 overflow-auto">
          <LineChart
            series={[
              {
                name: "Live Telemetry",
                data: streamingData,
                color: "#10b981",
              },
            ]}
            xAxis={{ label: "Time" }}
            yAxis={{ label: "Value" }}
            width={900}
            height={420}
            showGrid={true}
            animate={false}
          />
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live • Updating at 10Hz</span>
        </div>
      </section>

      {/* Time Series Example */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Time Series (ISS Orbit)</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Time-based X-axis with timezone support and formatted timestamps.
        </p>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-950 overflow-auto">
          <LineChart
            series={[
              {
                name: "Orbital Velocity",
                data: Array.from({ length: 200 }, (_, i) => ({
                  x: Date.now() + i * 60000,
                  y:
                    7.66 +
                    Math.sin(i / 25) * 0.12 +
                    Math.cos(i / 60) * 0.08 +
                    Math.random() * 0.02,
                })),
                color: "#3b82f6",
              },
            ]}
            xAxis={{
              label: "Time (UTC)",
              type: "time",
              timezone: "UTC",
            }}
            yAxis={{
              label: "Velocity (km/s)",
              formatter: (v: number) => v.toFixed(3),
            }}
            width={900}
            height={420}
            showGrid={true}
            magneticCrosshair={true}
          />
        </div>
        <pre className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-x-auto text-sm">
          <code>{`<LineChart
  series={[...]}
  xAxis={{
    label: "Time (UTC)",
    type: "time",
    timezone: "UTC",
  }}
  yAxis={{
    label: "Velocity (km/s)",
    formatter: (v) => v.toFixed(3),
  }}
  magneticCrosshair={true}
/>`}</code>
        </pre>
      </section>

      {/* Multiple Orbits */}
      <section>
        <h3 className="text-lg font-semibold mb-4">
          Multi-Series (Spacecraft Orbits)
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Multiple spacecraft orbits with filled areas.
        </p>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-950 overflow-auto">
          <LineChart
            series={[
              {
                name: "ISS Orbit",
                data: Array.from({ length: 100 }, (_, i) => ({
                  x: i,
                  y: 408 + Math.sin(i / 8) * 12 + Math.random() * 2,
                })),
                filled: true,
                color: "#3b82f6",
              },
              {
                name: "Starlink Orbit",
                data: Array.from({ length: 100 }, (_, i) => ({
                  x: i,
                  y: 550 + Math.sin(i / 10) * 8 + Math.random() * 3,
                })),
                filled: true,
                color: "#8b5cf6",
              },
              {
                name: "Hubble Orbit",
                data: Array.from({ length: 100 }, (_, i) => ({
                  x: i,
                  y: 545 + Math.sin(i / 12) * 6 + Math.random() * 2,
                })),
                color: "#10b981",
              },
            ]}
            xAxis={{ label: "Time (min)" }}
            yAxis={{ label: "Altitude (km)" }}
            width={900}
            height={420}
            showGrid={true}
          />
        </div>
      </section>
    </div>
  );
};

// ============================================================================
// Component Registry
// ============================================================================

const componentExamples: Record<string, React.ComponentType> = {
  "line-chart": LineChartExamples,
};

// ============================================================================
// Main Page Component
// ============================================================================

export default function ComponentPage() {
  const params = useParams();
  const componentId = params.component as string;

  const component = useMemo(
    () => components.find((c) => c.id === componentId),
    [componentId]
  );

  const ExampleComponent = componentExamples[componentId];

  if (!component) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Component not found</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            The component "{componentId}" does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{component.name}</h1>
        {component.description && (
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-3xl">
            {component.description}
          </p>
        )}
      </div>

      {/* Installation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Installation</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Copy and paste the following code into your project.
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-4">
              <pre className="text-sm text-emerald-600 dark:text-emerald-400">
                npx @plexusui/cli add {componentId}
              </pre>
            </div>
          </div>
          <div>
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Manual Installation
              </summary>
              <div className="pl-4 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-2">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  1. Copy the component code from{" "}
                  <code className="text-xs bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded">
                    components/{componentId}.tsx
                  </code>
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  2. Install dependencies:
                </p>
                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-3">
                  <pre className="text-xs">npm install react@latest</pre>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  3. Copy any required primitive components
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Examples */}
      {ExampleComponent && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Examples</h2>
          <ExampleComponent />
        </section>
      )}

      {/* Props Documentation */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">API Reference</h2>
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="text-left p-3 font-semibold">Prop</th>
                <th className="text-left p-3 font-semibold">Type</th>
                <th className="text-left p-3 font-semibold">Default</th>
                <th className="text-left p-3 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {componentId === "line-chart" && (
                <>
                  <tr>
                    <td className="p-3 font-mono text-xs">series</td>
                    <td className="p-3 font-mono text-xs">Series[]</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      required
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Array of data series to plot
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">width</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">800</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Chart width in pixels
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">height</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">400</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Chart height in pixels
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showGrid</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Show grid lines
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showLegend</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Show legend
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">renderer</td>
                    <td className="p-3 font-mono text-xs">
                      "svg" | "canvas" | "auto"
                    </td>
                    <td className="p-3 font-mono text-xs">"auto"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Rendering mode (canvas faster for large datasets)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">maxPoints</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">2000</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Max points before decimation (LTTB algorithm)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">magneticCrosshair</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Snap tooltip to nearest point
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Footer />
    </div>
  );
}
