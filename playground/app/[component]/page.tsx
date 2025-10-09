"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { components } from "../../constants/components";

import { LineChart } from "@plexusui/components/line-chart";
import { ScatterPlot } from "@plexusui/components/scatter-plot";
import { PolarPlot } from "@plexusui/components/polar-plot";
import { Heatmap } from "@plexusui/components/heatmap";
import { Histogram } from "@plexusui/components/histogram";
import { GanttChart } from "@plexusui/components/gantt-chart";
import { Earth } from "@plexusui/components/earth";
import { Mars } from "@plexusui/components/mars";
import { Mercury } from "@plexusui/components/mercury";
import { Venus } from "@plexusui/components/venus";
import { Moon } from "@plexusui/components/moon";
import { Jupiter } from "@plexusui/components/jupiter";
import { Saturn } from "@plexusui/components/saturn";
import { Uranus } from "@plexusui/components/uranus";
import { Neptune } from "@plexusui/components/neptune";
import { Footer } from "@/components/footer";
import { ComponentPreview } from "@/components/component-preview";
import { CopyButton } from "@/components/copy-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// Component Examples
// ============================================================================

const LineChartExamples = () => {
  const fftData = Array.from({ length: 128 }, (_, i) => {
    const freq = (i / 128) * 50;
    const peak1 = 80 * Math.exp(-Math.pow((freq - 5) / 1, 2));
    const peak2 = 40 * Math.exp(-Math.pow((freq - 10) / 1.5, 2));
    const peak3 = 20 * Math.exp(-Math.pow((freq - 15) / 2, 2));
    return { x: freq, y: peak1 + peak2 + peak3 + Math.random() * 2 };
  });

  // Damped Oscillation
  const dampedOscillation = Array.from({ length: 200 }, (_, i) => {
    const t = i / 10;
    const omega = 2;
    const gamma = 0.1;
    return { x: t, y: Math.exp(-gamma * t) * Math.cos(omega * t) * 50 + 50 };
  });

  // Noisy Signal
  const noisySignal = Array.from({ length: 100 }, (_, i) => {
    const t = i / 10;
    return { x: t, y: 30 * Math.sin(t) + 50 + (Math.random() - 0.5) * 10 };
  });

  const filteredSignal = Array.from({ length: 100 }, (_, i) => {
    const t = i / 10;
    return { x: t, y: 30 * Math.sin(t) + 50 };
  });

  // Orbital Velocity
  const orbitalVelocity = Array.from({ length: 100 }, (_, i) => {
    const altitude = i * 5;
    const earthRadius = 6371;
    const mu = 398600;
    const r = earthRadius + altitude;
    return { x: altitude, y: Math.sqrt(mu / r) };
  });

  // High-volume data (50,000 points)
  const highVolumeData = useMemo(
    () =>
      Array.from({ length: 50000 }, (_, i) => ({
        x: i / 100,
        y:
          Math.sin(i / 100) * 30 +
          Math.sin(i / 10) * 10 +
          Math.random() * 5 +
          50,
      })),
    []
  );

  // Streaming data
  const [streamingData, setStreamingData] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: i,
      y: Math.sin(i / 5) * 20 + 50,
    }))
  );

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
      {/* FFT Spectrum */}
      <ComponentPreview
        title="FFT Magnitude Spectrum"
        description="Frequency domain analysis showing harmonic peaks at 5Hz, 10Hz, and 15Hz. Common in signal processing and vibration analysis."
        preview={
          <LineChart.Root
            series={[
              {
                name: "Magnitude",
                data: fftData,
                color: "#06b6d4",
                strokeWidth: 2,
                filled: true,
              },
            ]}
            xAxis={{ label: "Frequency (Hz)" }}
            yAxis={{ label: "Magnitude (dB)" }}
            width={850}
            height={350}
          >
            <LineChart.Container>
              <LineChart.Viewport>
                <LineChart.Grid />
                <LineChart.Axes />
                <LineChart.Lines />
                <LineChart.Interaction />
                <LineChart.Tooltip />
              </LineChart.Viewport>
            </LineChart.Container>
          </LineChart.Root>
        }
        code={`<LineChart.Root
  series={[
    {
      name: "Magnitude",
      data: fftData,
      color: "#06b6d4",
      filled: true,
    },
  ]}
  xAxis={{ label: "Frequency (Hz)" }}
  yAxis={{ label: "Magnitude (dB)" }}
  width={850}
  height={350}
>
  <LineChart.Container>
    <LineChart.Viewport>
      <LineChart.Grid />
      <LineChart.Axes />
      <LineChart.Lines />
      <LineChart.Interaction />
      <LineChart.Tooltip />
    </LineChart.Viewport>
  </LineChart.Container>
</LineChart.Root>`}
      />

      {/* Damped Oscillation */}
      <ComponentPreview
        title="Damped Harmonic Oscillator"
        description="Exponential decay with oscillation (γ = 0.1, ω = 2 rad/s). Common in mechanical systems, RLC circuits, and vibration damping."
        preview={
          <LineChart.Root
            series={[
              {
                name: "Displacement",
                data: dampedOscillation,
                color: "#a855f7",
                strokeWidth: 2.5,
              },
            ]}
            xAxis={{ label: "Time (s)" }}
            yAxis={{ label: "Amplitude" }}
            width={850}
            height={350}
          >
            <LineChart.Container>
              <LineChart.Viewport>
                <LineChart.Grid />
                <LineChart.Axes />
                <LineChart.Lines />
                <LineChart.Interaction />
                <LineChart.Tooltip />
              </LineChart.Viewport>
            </LineChart.Container>
          </LineChart.Root>
        }
        code={`<LineChart.Root
  series={[{
    name: "Displacement",
    data: dampedOscillation,
    color: "#a855f7",
  }]}
  xAxis={{ label: "Time (s)" }}
  yAxis={{ label: "Amplitude" }}
  width={850}
  height={350}
>
  <LineChart.Container>
    <LineChart.Viewport>
      <LineChart.Grid />
      <LineChart.Axes />
      <LineChart.Lines />
      <LineChart.Interaction />
      <LineChart.Tooltip />
    </LineChart.Viewport>
  </LineChart.Container>
</LineChart.Root>`}
      />

      {/* Signal Processing */}
      <ComponentPreview
        title="Signal Processing: Noise Reduction"
        description="Raw signal with noise vs filtered output. Demonstrates digital filtering and noise reduction techniques."
        preview={
          <LineChart.Root
            series={[
              {
                name: "Noisy Signal",
                data: noisySignal,
                color: "#71717a",
                strokeWidth: 1.5,
              },
              {
                name: "Filtered Signal",
                data: filteredSignal,
                color: "#10b981",
                strokeWidth: 2.5,
              },
            ]}
            xAxis={{ label: "Time (s)" }}
            yAxis={{ label: "Voltage (V)" }}
            width={850}
            height={350}
          >
            <LineChart.Container>
              <LineChart.Viewport>
                <LineChart.Grid />
                <LineChart.Axes />
                <LineChart.Lines />
                <LineChart.Interaction />
                <LineChart.Tooltip />
                <LineChart.Legend />
              </LineChart.Viewport>
            </LineChart.Container>
          </LineChart.Root>
        }
        code={`<LineChart.Root
  series={[
    {
      name: "Noisy Signal",
      data: noisySignal,
      color: "#71717a",
    },
    {
      name: "Filtered Signal",
      data: filteredSignal,
      color: "#10b981",
    },
  ]}
  xAxis={{ label: "Time (s)" }}
  yAxis={{ label: "Voltage (V)" }}
  width={850}
  height={350}
>
  <LineChart.Container>
    <LineChart.Viewport>
      <LineChart.Grid />
      <LineChart.Axes />
      <LineChart.Lines />
      <LineChart.Interaction />
      <LineChart.Tooltip />
      <LineChart.Legend />
    </LineChart.Viewport>
  </LineChart.Container>
</LineChart.Root>`}
      />

      {/* Orbital Velocity */}
      <ComponentPreview
        title="Orbital Velocity vs Altitude"
        description="Earth orbital mechanics using v = √(μ/r). Shows how orbital velocity decreases with altitude."
        preview={
          <LineChart.Root
            series={[
              {
                name: "Velocity",
                data: orbitalVelocity,
                color: "#3b82f6",
                strokeWidth: 2.5,
              },
            ]}
            xAxis={{ label: "Altitude (km)" }}
            yAxis={{ label: "Orbital Velocity (km/s)" }}
            width={850}
            height={350}
          >
            <LineChart.Container>
              <LineChart.Viewport>
                <LineChart.Grid />
                <LineChart.Axes />
                <LineChart.Lines />
                <LineChart.Interaction />
                <LineChart.Tooltip />
              </LineChart.Viewport>
            </LineChart.Container>
          </LineChart.Root>
        }
        code={`<LineChart.Root
  series={[{
    name: "Velocity",
    data: orbitalVelocity,
    color: "#3b82f6",
  }]}
  xAxis={{ label: "Altitude (km)" }}
  yAxis={{ label: "Orbital Velocity (km/s)" }}
  width={850}
  height={350}
>
  <LineChart.Container>
    <LineChart.Viewport>
      <LineChart.Grid />
      <LineChart.Axes />
      <LineChart.Lines />
      <LineChart.Interaction />
      <LineChart.Tooltip />
    </LineChart.Viewport>
  </LineChart.Container>
</LineChart.Root>`}
      />

      {/* Real-Time Streaming */}
      <ComponentPreview
        title="Real-Time Telemetry Streaming"
        description="Live data streaming with a sliding window. Updates at 10Hz. Perfect for telemetry displays and real-time monitoring."
        preview={
          <div>
            <LineChart.Root
              series={[
                {
                  name: "Live Telemetry",
                  data: streamingData,
                  color: "#10b981",
                },
              ]}
              xAxis={{ label: "Time" }}
              yAxis={{ label: "Value" }}
              width={850}
              height={350}
              animate={false}
            >
              <LineChart.Container>
                <LineChart.Viewport>
                  <LineChart.Grid />
                  <LineChart.Axes />
                  <LineChart.Lines />
                  <LineChart.Interaction />
                  <LineChart.Tooltip />
                </LineChart.Viewport>
              </LineChart.Container>
            </LineChart.Root>
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live • Updating at 10Hz</span>
            </div>
          </div>
        }
        code={`const [data, setData] = useState(initialData);

useEffect(() => {
  const interval = setInterval(() => {
    setData(prev => [...prev, newPoint].slice(-100));
  }, 100);
  return () => clearInterval(interval);
}, []);

<LineChart.Root
  series={[{ name: "Live Telemetry", data }]}
  xAxis={{ label: "Time" }}
  yAxis={{ label: "Value" }}
  width={850}
  height={350}
  animate={false}
>
  <LineChart.Container>
    <LineChart.Viewport>
      <LineChart.Grid />
      <LineChart.Axes />
      <LineChart.Lines />
      <LineChart.Interaction />
      <LineChart.Tooltip />
    </LineChart.Viewport>
  </LineChart.Container>
</LineChart.Root>`}
      />

      {/* High-Volume Data */}
      <ComponentPreview
        title="High-Volume Data (50,000 Points)"
        description="Rendering 50,000 data points with automatic decimation (LTTB) and Canvas rendering for smooth 60fps performance."
        preview={
          <div className="space-y-2">
            <LineChart.Root
              series={[
                { name: "Sensor Data", data: highVolumeData, color: "#8b5cf6" },
              ]}
              xAxis={{ label: "Time (s)" }}
              yAxis={{ label: "Signal" }}
              width={850}
              height={300}
              maxPoints={2000}
            >
              <LineChart.Container>
                <LineChart.Viewport>
                  <LineChart.Grid />
                  <LineChart.Axes />
                  <LineChart.Lines />
                  <LineChart.Interaction />
                  <LineChart.Tooltip />
                </LineChart.Viewport>
              </LineChart.Container>
            </LineChart.Root>
            <p className="text-xs text-zinc-500">
              • Original: 50,000 points • Decimated: 2,000 points • Renderer:
              Canvas • FPS: 60
            </p>
          </div>
        }
        code={`<LineChart
  series={[{
    name: "Sensor Data",
    data: highVolumeData, // 50,000 points
  }]}
  renderer="canvas"
  maxPoints={2000}
  decimation="lttb"
/>`}
      />

      {/* Variants */}
      <ComponentPreview
        title="Chart Variants"
        description="Different visual styles for various use cases: minimal, scientific, and dashboard variants."
        preview={
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                Minimal
              </p>
              <LineChart.Root
                series={[
                  {
                    name: "Data",
                    data: dampedOscillation.slice(0, 100),
                    color: "#64748b",
                  },
                ]}
                width={850}
                height={200}
                variant="minimal"
              >
                <LineChart.Container>
                  <LineChart.Viewport>
                    <LineChart.Axes />
                    <LineChart.Lines />
                  </LineChart.Viewport>
                </LineChart.Container>
              </LineChart.Root>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                Scientific
              </p>
              <LineChart.Root
                series={[
                  {
                    name: "Data",
                    data: dampedOscillation.slice(0, 100),
                    color: "#3b82f6",
                  },
                ]}
                width={850}
                height={200}
                variant="scientific"
              >
                <LineChart.Container>
                  <LineChart.Viewport>
                    <LineChart.Grid />
                    <LineChart.Axes />
                    <LineChart.Points radius={3} />
                    <LineChart.Interaction />
                    <LineChart.Tooltip />
                  </LineChart.Viewport>
                </LineChart.Container>
              </LineChart.Root>
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                Dashboard
              </p>
              <LineChart.Root
                series={[
                  {
                    name: "Data",
                    data: dampedOscillation.slice(0, 100),
                    color: "#10b981",
                  },
                ]}
                width={850}
                height={200}
                variant="dashboard"
              >
                <LineChart.Container>
                  <LineChart.Viewport>
                    <LineChart.Grid />
                    <LineChart.Axes />
                    <LineChart.Lines />
                    <LineChart.Interaction />
                    <LineChart.Tooltip />
                  </LineChart.Viewport>
                </LineChart.Container>
              </LineChart.Root>
            </div>
          </div>
        }
        code={`// Minimal variant
<LineChart
  series={[...]}
  variant="minimal"
/>

// Scientific variant (shows data points)
<LineChart
  series={[...]}
  variant="scientific"
/>

// Dashboard variant (thick lines)
<LineChart
  series={[...]}
  variant="dashboard"
/>`}
      />
    </div>
  );
};

const ScatterPlotExamples = () => {
  // Orbital velocity vs altitude (correlation)
  const orbitalData = Array.from({ length: 50 }, (_, i) => {
    const altitude = i * 10;
    const earthRadius = 6371;
    const mu = 398600;
    const r = earthRadius + altitude;
    const velocity = Math.sqrt(mu / r);
    return { x: altitude, y: velocity };
  });

  // Random scatter with trendline
  const correlatedData = Array.from({ length: 100 }, (_, i) => ({
    x: i,
    y: i * 0.5 + Math.random() * 20,
  }));

  // Bubble chart (3D data)
  const bubbleData = Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 50 + 10,
  }));

  // Multi-series scatter
  const series1 = Array.from({ length: 40 }, () => ({
    x: Math.random() * 50 + 10,
    y: Math.random() * 50 + 10,
  }));

  const series2 = Array.from({ length: 40 }, () => ({
    x: Math.random() * 50 + 40,
    y: Math.random() * 50 + 40,
  }));

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Orbital Mechanics: Velocity vs Altitude"
        description="Scatter plot showing the inverse relationship between orbital velocity and altitude using the vis-viva equation."
        preview={
          <ScatterPlot
            series={[
              {
                name: "Orbital Velocity",
                data: orbitalData,
                color: "#3b82f6",
                symbol: "circle",
                size: 6,
                trendline: true,
              },
            ]}
            xAxis={{ label: "Altitude (km)" }}
            yAxis={{ label: "Velocity (km/s)" }}
            width={850}
            height={400}
            showGrid={true}
            showLegend={false}
          />
        }
        code={`<ScatterPlot
  series={[{
    name: "Orbital Velocity",
    data: orbitalData,
    color: "#3b82f6",
    trendline: true,
  }]}
  xAxis={{ label: "Altitude (km)" }}
  yAxis={{ label: "Velocity (km/s)" }}
/>`}
      />

      <ComponentPreview
        title="Bubble Chart"
        description="Three-dimensional data visualization where marker size represents a third variable. Perfect for multi-parameter analysis."
        preview={
          <ScatterPlot
            series={[
              {
                name: "Satellites",
                data: bubbleData,
                color: "#8b5cf6",
                symbol: "circle",
                sizeScale: [4, 20],
                opacity: 0.6,
              },
            ]}
            xAxis={{ label: "Apogee (km)" }}
            yAxis={{ label: "Perigee (km)" }}
            width={850}
            height={400}
            showGrid={true}
            showLegend={false}
          />
        }
        code={`<ScatterPlot
  series={[{
    name: "Satellites",
    data: bubbleData,
    sizeScale: [4, 20], // Min/max bubble size
    opacity: 0.6,
  }]}
  xAxis={{ label: "Apogee (km)" }}
  yAxis={{ label: "Perigee (km)" }}
/>`}
      />

      <ComponentPreview
        title="Multi-Series Clustering"
        description="Visualize data clusters with different marker shapes and colors for distinct groups."
        preview={
          <ScatterPlot
            series={[
              {
                name: "Cluster A",
                data: series1,
                color: "#10b981",
                symbol: "circle",
              },
              {
                name: "Cluster B",
                data: series2,
                color: "#f59e0b",
                symbol: "diamond",
              },
            ]}
            xAxis={{ label: "Feature 1" }}
            yAxis={{ label: "Feature 2" }}
            width={850}
            height={400}
            showGrid={true}
            showLegend={true}
            toggleableSeries={true}
          />
        }
        code={`<ScatterPlot
  series={[
    { name: "Cluster A", data: series1, symbol: "circle" },
    { name: "Cluster B", data: series2, symbol: "diamond" },
  ]}
  toggleableSeries={true}
/>`}
      />
    </div>
  );
};

const PolarPlotExamples = () => {
  // Antenna radiation pattern
  const radiationPattern = Array.from({ length: 36 }, (_, i) => {
    const theta = (i / 36) * 2 * Math.PI;
    const r = 0.5 + 0.5 * Math.abs(Math.cos(2 * theta));
    return { theta, r };
  });

  // Radar chart for spacecraft subsystems
  const subsystemHealth = [
    { theta: 0, r: 0.9, label: "Power" },
    { theta: Math.PI / 3, r: 0.7, label: "Propulsion" },
    { theta: (2 * Math.PI) / 3, r: 0.85, label: "Thermal" },
    { theta: Math.PI, r: 0.95, label: "Comm" },
    { theta: (4 * Math.PI) / 3, r: 0.6, label: "ADCS" },
    { theta: (5 * Math.PI) / 3, r: 0.8, label: "CDH" },
  ];

  // Wind rose (directional data)
  const windData = Array.from({ length: 16 }, (_, i) => {
    const theta = (i / 16) * 2 * Math.PI;
    const r = Math.random() * 0.5 + 0.3;
    return { theta, r };
  });

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Antenna Radiation Pattern"
        description="Polar plot showing the directional gain pattern of an antenna. Essential for RF analysis and link budget calculations."
        preview={
          <PolarPlot
            series={[
              {
                name: "Gain Pattern",
                data: radiationPattern,
                color: "#06b6d4",
                filled: true,
                closed: true,
              },
            ]}
            axis={{
              label: "Gain (dB)",
              angleLabels: [
                "0°",
                "45°",
                "90°",
                "135°",
                "180°",
                "225°",
                "270°",
                "315°",
              ],
              rings: 5,
            }}
            width={600}
            height={600}
            showLegend={false}
            variant="polar"
          />
        }
        code={`<PolarPlot
  series={[{
    name: "Gain Pattern",
    data: radiationPattern,
    filled: true,
    closed: true,
  }]}
  axis={{
    angleLabels: ["0°", "45°", "90°", ...],
    rings: 5,
  }}
  variant="polar"
/>`}
      />

      <ComponentPreview
        title="Spacecraft Subsystem Health Radar"
        description="Radar chart displaying multiple subsystem health metrics. Perfect for multi-dimensional comparisons at a glance."
        preview={
          <PolarPlot
            series={[
              {
                name: "Health Status",
                data: subsystemHealth,
                color: "#10b981",
                filled: true,
                closed: true,
                strokeWidth: 3,
              },
            ]}
            axis={{
              label: "Health Score",
              angleLabels: [
                "Power",
                "Propulsion",
                "Thermal",
                "Comm",
                "ADCS",
                "CDH",
              ],
              rings: 4,
              angleCount: 6,
            }}
            width={600}
            height={600}
            showLegend={false}
            variant="radar"
          />
        }
        code={`<PolarPlot
  series={[{
    name: "Health Status",
    data: subsystemHealth,
    filled: true,
  }]}
  variant="radar"
/>`}
      />

      <ComponentPreview
        title="Rose Diagram"
        description="Rose diagram for directional data like wind direction or orbital phase distribution."
        preview={
          <PolarPlot
            series={[
              {
                name: "Wind Distribution",
                data: windData,
                color: "#a855f7",
                filled: true,
                closed: true,
              },
            ]}
            axis={{
              label: "Frequency",
              rings: 4,
              angleCount: 16,
            }}
            width={600}
            height={600}
            showLegend={false}
            variant="rose"
          />
        }
        code={`<PolarPlot
  series={[{
    name: "Wind Distribution",
    data: windData,
    filled: true,
  }]}
  variant="rose"
/>`}
      />
    </div>
  );
};

const HeatmapExamples = () => {
  // Correlation matrix

  // Terrain elevation
  const terrainData = Array.from({ length: 20 }, (_, y) =>
    Array.from({ length: 20 }, (_, x) => {
      const dx = x - 10;
      const dy = y - 10;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return 100 * Math.exp(-(dist * dist) / 50) + Math.random() * 10;
    })
  );

  // Time-series heatmap (ground station contacts)
  const contactHeatmap = Array.from({ length: 24 }, (_, hour) =>
    Array.from({ length: 7 }, (_, day) => Math.floor(Math.random() * 10))
  );

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Terrain Elevation Map"
        description="2D elevation heatmap using the viridis colormap for terrain visualization."
        preview={
          <Heatmap
            data={terrainData}
            xAxisLabel="East-West (km)"
            yAxisLabel="North-South (km)"
            colormap="viridis"
            width={850}
            height={600}
            showColorbar={true}
            showGrid={false}
          />
        }
        code={`<Heatmap
  data={terrainData}
  colormap="viridis"
  showColorbar={true}
/>`}
      />

      <ComponentPreview
        title="Ground Station Contact Schedule"
        description="Time-series heatmap showing satellite contact opportunities across days and hours."
        preview={
          <Heatmap
            data={contactHeatmap}
            xLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
            yLabels={Array.from({ length: 24 }, (_, i) => `${i}:00`)}
            xAxisLabel="Day of Week"
            yAxisLabel="Hour (UTC)"
            colormap="plasma"
            width={850}
            height={600}
            showColorbar={true}
            showValues={true}
          />
        }
        code={`<Heatmap
  data={contactHeatmap}
  xLabels={["Sun", "Mon", "Tue", ...]}
  yLabels={["0:00", "1:00", ...]}
  colormap="plasma"
  showValues={true}
/>`}
      />

      <ComponentPreview
        title="Honeycomb Heatmap"
        description="Hexagonal cell layout for a modern, space-efficient visualization. Perfect for compact data displays."
        preview={
          <Heatmap
            data={terrainData.slice(0, 12).map((row) => row.slice(0, 12))}
            colormap="inferno"
            width={850}
            height={600}
            showColorbar={true}
            cellShape="hexagon"
            cellGap={0.1}
            showGrid={false}
          />
        }
        code={`<Heatmap
  data={terrainData}
  colormap="inferno"
  cellShape="hexagon"
  cellGap={0.1}
  showGrid={false}
/>`}
      />
    </div>
  );
};

const HistogramExamples = () => {
  // Normal distribution
  const normalData = Array.from(
    { length: 1000 },
    () =>
      (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 50 +
      100
  );

  // Bimodal distribution
  const bimodalData = [
    ...Array.from({ length: 500 }, () => Math.random() * 30 + 20),
    ...Array.from({ length: 500 }, () => Math.random() * 30 + 70),
  ];

  // Orbital period distribution
  const orbitalPeriods = [
    ...Array.from({ length: 300 }, () => Math.random() * 10 + 90),
    ...Array.from({ length: 200 }, () => Math.random() * 20 + 400),
    ...Array.from({ length: 100 }, () => Math.random() * 100 + 1400),
  ];

  // Multi-series comparison
  const leo = Array.from({ length: 400 }, () => Math.random() * 20 + 90);
  const meo = Array.from({ length: 300 }, () => Math.random() * 100 + 400);

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Normal Distribution"
        description="Classic bell curve histogram showing a normal distribution. Demonstrates automatic binning using Sturges' formula."
        preview={
          <Histogram
            series={[
              {
                name: "Measurements",
                data: normalData,
                color: "#3b82f6",
                bins: 30,
              },
            ]}
            xAxis={{ label: "Value" }}
            yAxis={{ label: "Frequency" }}
            width={850}
            height={400}
            showLegend={false}
            layout="overlapping"
          />
        }
        code={`<Histogram
  series={[{
    name: "Measurements",
    data: normalData,
    bins: 30,
  }]}
  xAxis={{ label: "Value" }}
  yAxis={{ label: "Frequency" }}
/>`}
      />

      <ComponentPreview
        title="Bimodal Distribution"
        description="Histogram revealing two distinct peaks in the data distribution. Important for identifying data clusters."
        preview={
          <Histogram
            series={[
              {
                name: "Dataset",
                data: bimodalData,
                color: "#10b981",
                bins: 25,
              },
            ]}
            xAxis={{ label: "Value" }}
            width={850}
            height={400}
            showLegend={false}
          />
        }
        code={`<Histogram
  series={[{
    name: "Dataset",
    data: bimodalData,
    bins: 25,
  }]}
/>`}
      />

      <ComponentPreview
        title="Orbital Period Distribution"
        description="Satellite orbital period histogram showing LEO, MEO, and GEO populations. Logarithmic distribution common in space datasets."
        preview={
          <Histogram
            series={[
              {
                name: "Orbital Periods",
                data: orbitalPeriods,
                color: "#8b5cf6",
                bins: 20,
              },
            ]}
            xAxis={{ label: "Orbital Period (minutes)" }}
            yAxis={{ label: "Number of Satellites" }}
            width={850}
            height={400}
            showLegend={false}
          />
        }
        code={`<Histogram
  series={[{
    name: "Orbital Periods",
    data: orbitalPeriods,
    bins: 20,
  }]}
  xAxis={{ label: "Orbital Period (minutes)" }}
/>`}
      />

      <ComponentPreview
        title="Grouped Comparison"
        description="Compare multiple distributions side-by-side with grouped layout. LEO vs MEO orbital periods."
        preview={
          <Histogram
            series={[
              {
                name: "LEO",
                data: leo,
                color: "#3b82f6",
                bins: 15,
              },
              {
                name: "MEO",
                data: meo,
                color: "#ef4444",
                bins: 15,
              },
            ]}
            xAxis={{ label: "Orbital Period (minutes)" }}
            yAxis={{ label: "Count" }}
            width={850}
            height={400}
            showLegend={true}
            layout="grouped"
            toggleableSeries={true}
          />
        }
        code={`<Histogram
  series={[
    { name: "LEO", data: leo, bins: 15 },
    { name: "MEO", data: meo, bins: 15 },
  ]}
  layout="grouped"
  toggleableSeries={true}
/>`}
      />
    </div>
  );
};

const GanttChartExamples = () => {
  const [timezone, setTimezone] = useState("UTC");
  const [timeWindowHours, setTimeWindowHours] = useState(12);

  const now = new Date();
  const baseTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    8,
    0,
    0
  );

  // Ground station pass schedule
  const groundStationPasses = [
    {
      id: "p1",
      name: "ISS Pass",
      start: new Date(baseTime.getTime() + 30 * 60000), // 08:30
      end: new Date(baseTime.getTime() + 45 * 60000), // 08:45
      status: "completed" as const,
      description: "Low elevation pass",
    },
    {
      id: "p2",
      name: "NOAA-18 Downlink",
      start: new Date(baseTime.getTime() + 140 * 60000), // 10:20
      end: new Date(baseTime.getTime() + 152 * 60000), // 10:32
      status: "in-progress" as const,
      description: "Weather data acquisition",
    },
    {
      id: "p3",
      name: "Starlink Command",
      start: new Date(baseTime.getTime() + 255 * 60000), // 12:15
      end: new Date(baseTime.getTime() + 268 * 60000), // 12:28
      status: "planned" as const,
      description: "Telemetry uplink",
    },
    {
      id: "p4",
      name: "Landsat 9 TLM",
      start: new Date(baseTime.getTime() + 395 * 60000), // 14:35
      end: new Date(baseTime.getTime() + 410 * 60000), // 14:50
      status: "planned" as const,
      description: "Earth observation data",
    },
  ];

  // Multi-satellite tracking
  const multiSatPasses = [
    {
      id: "m1",
      name: "GOES-16",
      start: new Date(baseTime.getTime() + 0),
      end: new Date(baseTime.getTime() + 25 * 60000),
      status: "in-progress" as const,
    },
    {
      id: "m2",
      name: "Sentinel-2",
      start: new Date(baseTime.getTime() + 90 * 60000),
      end: new Date(baseTime.getTime() + 105 * 60000),
      status: "planned" as const,
    },
    {
      id: "m3",
      name: "Terra",
      start: new Date(baseTime.getTime() + 180 * 60000),
      end: new Date(baseTime.getTime() + 195 * 60000),
      status: "planned" as const,
    },
    {
      id: "m4",
      name: "Aqua",
      start: new Date(baseTime.getTime() + 285 * 60000),
      end: new Date(baseTime.getTime() + 298 * 60000),
      status: "planned" as const,
    },
    {
      id: "m5",
      name: "MetOp-C",
      start: new Date(baseTime.getTime() + 420 * 60000),
      end: new Date(baseTime.getTime() + 433 * 60000),
      status: "planned" as const,
    },
  ];

  // 24-hour operations
  const opsSchedule = [
    {
      id: "o1",
      name: "Deep Space Network",
      start: new Date(baseTime.getTime()),
      end: new Date(baseTime.getTime() + 240 * 60000),
      status: "in-progress" as const,
      description: "Voyager 1 contact",
    },
    {
      id: "o2",
      name: "GPS Constellation",
      start: new Date(baseTime.getTime() + 300 * 60000),
      end: new Date(baseTime.getTime() + 480 * 60000),
      status: "planned" as const,
      description: "Navigation updates",
    },
    {
      id: "o3",
      name: "Hubble Telemetry",
      start: new Date(baseTime.getTime() + 540 * 60000),
      end: new Date(baseTime.getTime() + 720 * 60000),
      status: "planned" as const,
      description: "Science data downlink",
    },
  ];

  return (
    <div className="space-y-12">
      {/* Controls */}
      <div className="flex items-center gap-4 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Timezone:
          </label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">America/New_York</SelectItem>
              <SelectItem value="America/Los_Angeles">
                America/Los_Angeles
              </SelectItem>
              <SelectItem value="America/Chicago">America/Chicago</SelectItem>
              <SelectItem value="Europe/London">Europe/London</SelectItem>
              <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
              <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
              <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Time Window:
          </label>
          <Select
            value={timeWindowHours.toString()}
            onValueChange={(v) => setTimeWindowHours(Number(v))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4 hours</SelectItem>
              <SelectItem value="8">8 hours</SelectItem>
              <SelectItem value="12">12 hours</SelectItem>
              <SelectItem value="24">24 hours</SelectItem>
              <SelectItem value="48">48 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ComponentPreview
        title="Ground Station Pass Schedule"
        description="Satellite contact windows with precise timing for ground station operations. Shows pass duration in minutes with 15-minute grid intervals. Use the controls above to change timezone and time window."
        preview={
          <div className="space-y-4">
            <GanttChart
              tasks={groundStationPasses}
              timezone={timezone}
              width={1000}
              rowHeight={50}
              timeWindowHours={timeWindowHours}
              startTime={baseTime}
              interactive={true}
              variant="default"
              onTaskClick={(task) => console.log("Clicked:", task.name)}
            >
              <GanttChart.Controls />
              <GanttChart.Container>
                <GanttChart.Viewport>
                  <GanttChart.Grid />
                  <GanttChart.Header />
                  <GanttChart.Tasks />
                  <GanttChart.CurrentTime />
                </GanttChart.Viewport>
                <GanttChart.LeftPanel />
              </GanttChart.Container>
            </GanttChart>
          </div>
        }
        code={`<GanttChart
  tasks={groundStationPasses}
  timezone="UTC"
  timeWindowHours={12}
  startTime={baseTime}
  interactive
  onTaskClick={(task) => console.log(task)}
>
  <GanttChart.Controls />
  <GanttChart.Container>
    <GanttChart.Viewport>
      <GanttChart.Grid />
      <GanttChart.Header />
      <GanttChart.Tasks />
      <GanttChart.CurrentTime />
    </GanttChart.Viewport>
    <GanttChart.LeftPanel />
  </GanttChart.Container>
</GanttChart>`}
      />

      <ComponentPreview
        title="Multi-Satellite Tracking"
        description="Compact view for tracking multiple satellites simultaneously. Ideal for operations centers monitoring several assets. Timezone and time window controlled by settings above."
        preview={
          <GanttChart
            tasks={multiSatPasses}
            timezone={timezone}
            width={1000}
            rowHeight={42}
            timeWindowHours={timeWindowHours}
            startTime={baseTime}
            interactive={true}
            variant="compact"
          >
            <GanttChart.Container>
              <GanttChart.Viewport>
                <GanttChart.Grid />
                <GanttChart.Header />
                <GanttChart.Tasks />
                <GanttChart.CurrentTime />
              </GanttChart.Viewport>
              <GanttChart.LeftPanel />
            </GanttChart.Container>
          </GanttChart>
        }
        code={`<GanttChart
  tasks={multiSatPasses}
  timezone="UTC"
  timeWindowHours={8}
  variant="compact"
>
  <GanttChart.Container>
    <GanttChart.Viewport>
      <GanttChart.Grid />
      <GanttChart.Header />
      <GanttChart.Tasks />
      <GanttChart.CurrentTime />
    </GanttChart.Viewport>
    <GanttChart.LeftPanel />
  </GanttChart.Container>
</GanttChart>`}
      />

      <ComponentPreview
        title="Operations View"
        description="Full operations schedule with detailed descriptions. Perfect for mission control planning and coordination. Timezone and time window controlled by settings above."
        preview={
          <GanttChart
            tasks={opsSchedule}
            timezone={timezone}
            width={1000}
            rowHeight={55}
            timeWindowHours={timeWindowHours}
            startTime={baseTime}
            interactive={true}
            variant="detailed"
          >
            <GanttChart.Container>
              <GanttChart.Viewport>
                <GanttChart.Grid />
                <GanttChart.Header />
                <GanttChart.Tasks />
                <GanttChart.CurrentTime />
              </GanttChart.Viewport>
              <GanttChart.LeftPanel />
            </GanttChart.Container>
          </GanttChart>
        }
        code={`<GanttChart
  tasks={opsSchedule}
  timezone="UTC"
  timeWindowHours={24}
  variant="detailed"
>
  <GanttChart.Container>
    <GanttChart.Viewport>
      <GanttChart.Grid />
      <GanttChart.Header />
      <GanttChart.Tasks />
      <GanttChart.CurrentTime />
    </GanttChart.Viewport>
    <GanttChart.LeftPanel />
  </GanttChart.Container>
</GanttChart>`}
      />
    </div>
  );
};

const EarthExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Simple"
        description="Clean Earth view without atmospheric effects or clouds. Perfect for geographic focus and data overlay applications."
        preview={
          <div className="w-full h-[600px]">
            <Earth dayMapUrl="/day.jpg" enableRotation={false} brightness={1.2}>
              <Earth.Canvas height="600px">
                <Earth.Controls
                  minDistance={10}
                  maxDistance={50}
                  enableRotate={true}
                />
                <Earth.Globe />
              </Earth.Canvas>
            </Earth>
          </div>
        }
        code={`<Earth
  dayMapUrl="/day.jpg"
  enableRotation={false}
  brightness={1.2}
>
  <Earth.Canvas height="600px">
    <Earth.Controls />
    <Earth.Globe />
  </Earth.Canvas>
</Earth>`}
      />
    </div>
  );
};

const MarsExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Mars"
        description="The Red Planet with accurate surface textures showing Olympus Mons, Valles Marineris, and polar ice caps."
        preview={
          <div className="w-full h-[600px]">
            <Mars
              textureUrl="/flat-mars.jpg"
              enableRotation={false}
              brightness={1.2}
            >
              <Mars.Canvas height="600px">
                <Mars.Controls />
                <Mars.Globe />
              </Mars.Canvas>
            </Mars>
          </div>
        }
        code={`<Mars
  textureUrl="/flat-mars.jpg"
  enableRotation={false}
  brightness={1.2}
>
  <Mars.Canvas height="600px">
    <Mars.Controls />
    <Mars.Globe />
  </Mars.Canvas>
</Mars>`}
      />
    </div>
  );
};

const MercuryExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Mercury"
        description="The smallest terrestrial planet with detailed cratered surface mapping from MESSENGER mission data."
        preview={
          <div className="w-full h-[600px]">
            <Mercury
              textureUrl="/flat-mercury.png"
              enableRotation={false}
              brightness={1.2}
            >
              <Mercury.Canvas height="600px">
                <Mercury.Controls />
                <Mercury.Globe />
              </Mercury.Canvas>
            </Mercury>
          </div>
        }
        code={`<Mercury
  textureUrl="/flat-mercury.png"
  enableRotation={false}
  brightness={1.2}
>
  <Mercury.Canvas height="600px">
    <Mercury.Controls />
    <Mercury.Globe />
  </Mercury.Canvas>
</Mercury>`}
      />
    </div>
  );
};

const VenusExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Venus"
        description="The cloud-shrouded planet showing the thick atmospheric patterns observed by orbital missions."
        preview={
          <div className="w-full h-[600px]">
            <Venus
              textureUrl="/flat-venus.jpg"
              enableRotation={false}
              brightness={1.2}
            >
              <Venus.Canvas height="600px">
                <Venus.Controls />
                <Venus.Globe />
              </Venus.Canvas>
            </Venus>
          </div>
        }
        code={`<Venus
  textureUrl="/flat-venus.jpg"
  enableRotation={false}
  brightness={1.2}
>
  <Venus.Canvas height="600px">
    <Venus.Controls />
    <Venus.Globe />
  </Venus.Canvas>
</Venus>`}
      />
    </div>
  );
};

const MoonExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Moon"
        description="Earth's Moon with detailed surface features including maria, highlands, and major craters."
        preview={
          <div className="w-full h-[600px]">
            <Moon
              textureUrl="/moon.jpg"
              enableRotation={false}
              brightness={1.2}
            >
              <Moon.Canvas height="600px">
                <Moon.Controls />
                <Moon.Globe />
              </Moon.Canvas>
            </Moon>
          </div>
        }
        code={`<Moon
  textureUrl="/moon.jpg"
  enableRotation={false}
  brightness={1.2}
>
  <Moon.Canvas height="600px">
    <Moon.Controls />
    <Moon.Globe />
  </Moon.Canvas>
</Moon>`}
      />
    </div>
  );
};

const JupiterExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Jupiter"
        description="The gas giant featuring the Great Red Spot and complex band structures in its atmosphere."
        preview={
          <div className="w-full h-[600px]">
            <Jupiter
              textureUrl="/flat-jupiter.jpg"
              enableRotation={false}
              brightness={1.1}
            >
              <Jupiter.Canvas height="600px">
                <Jupiter.Controls />
                <Jupiter.Globe />
              </Jupiter.Canvas>
            </Jupiter>
          </div>
        }
        code={`<Jupiter
  textureUrl="/flat-jupiter.jpg"
  enableRotation={false}
  brightness={1.1}
>
  <Jupiter.Canvas height="600px">
    <Jupiter.Controls />
    <Jupiter.Globe />
  </Jupiter.Canvas>
</Jupiter>`}
      />
    </div>
  );
};

const SaturnExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Saturn"
        description="The ringed planet with its distinctive atmospheric bands and hexagonal polar storm."
        preview={
          <div className="w-full h-[600px]">
            <Saturn
              textureUrl="/saturnmap.jpg"
              enableRotation={false}
              brightness={1.2}
              showRings={true}
            >
              <Saturn.Canvas height="600px">
                <Saturn.Controls />
                <Saturn.Globe />
                <Saturn.Rings />
              </Saturn.Canvas>
            </Saturn>
          </div>
        }
        code={`<Saturn
  textureUrl="/saturnmap.jpg"
  enableRotation={false}
  brightness={1.2}
  showRings={true}
>
  <Saturn.Canvas height="600px">
    <Saturn.Controls />
    <Saturn.Globe />
    <Saturn.Rings />
  </Saturn.Canvas>
</Saturn>`}
      />
    </div>
  );
};

const UranusExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Uranus"
        description="The ice giant with its unique blue-green coloration from atmospheric methane."
        preview={
          <div className="w-full h-[600px]">
            <Uranus
              textureUrl="/flat-uranus.jpg"
              enableRotation={false}
              brightness={1.2}
            >
              <Uranus.Canvas height="600px">
                <Uranus.Controls />
                <Uranus.Globe />
              </Uranus.Canvas>
            </Uranus>
          </div>
        }
        code={`<Uranus
  textureUrl="/flat-uranus.jpg"
  enableRotation={false}
  brightness={1.2}
>
  <Uranus.Canvas height="600px">
    <Uranus.Controls />
    <Uranus.Globe />
  </Uranus.Canvas>
</Uranus>`}
      />
    </div>
  );
};

const NeptuneExamples = () => {
  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Neptune"
        description="The distant ice giant with its deep blue atmosphere and dynamic weather systems."
        preview={
          <div className="w-full h-[600px]">
            <Neptune
              textureUrl="/flat-neptune.jpg"
              enableRotation={false}
              brightness={1.3}
            >
              <Neptune.Canvas height="600px">
                <Neptune.Controls />
                <Neptune.Globe />
              </Neptune.Canvas>
            </Neptune>
          </div>
        }
        code={`<Neptune
  textureUrl="/flat-neptune.jpg"
  enableRotation={false}
  brightness={1.3}
>
  <Neptune.Canvas height="600px">
    <Neptune.Controls />
    <Neptune.Globe />
  </Neptune.Canvas>
</Neptune>`}
      />
    </div>
  );
};

// ============================================================================
// Component Registry
// ============================================================================

const componentExamples: Record<string, React.ComponentType> = {
  "line-chart": LineChartExamples,
  "scatter-plot": ScatterPlotExamples,
  "polar-plot": PolarPlotExamples,
  heatmap: HeatmapExamples,
  histogram: HistogramExamples,
  "gantt-chart": GanttChartExamples,
  earth: EarthExamples,
  mars: MarsExamples,
  mercury: MercuryExamples,
  venus: VenusExamples,
  moon: MoonExamples,
  jupiter: JupiterExamples,
  saturn: SaturnExamples,
  uranus: UranusExamples,
  neptune: NeptuneExamples,
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
            <p className="text-sm text-zinc-600  dark:text-zinc-400 mb-2">
              Copy and paste the following code into your project.
            </p>
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md p-2">
              <div className="flex items-center justify-between gap-2">
                <pre className="text-sm font-geist-mono text-emerald-600 dark:text-emerald-400">
                  npx @plexusui/cli add {componentId}
                </pre>
                <CopyButton
                  hideText
                  copyText={`npx @plexusui/cli add ${componentId}`}
                />
              </div>
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

      {ExampleComponent ? (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Examples</h2>
          <ExampleComponent />
        </section>
      ) : null}
      {component.textures && component.textures.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Texture Maps</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Download the required texture maps for this component.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {component.textures.map((texture: string) => {
              const textureName = texture.split("/").pop() || texture;
              return (
                <a
                  key={texture}
                  href={texture}
                  download={textureName}
                  className="group relative aspect-square border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                >
                  <img
                    src={texture}
                    alt={textureName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <svg
                        className="w-8 h-8 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span className="text-xs font-medium">{textureName}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      )}

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">API Reference</h2>

        {componentId === "earth" && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
              Primitive Components
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Earth uses composable primitives following shadcn architecture:
            </p>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Earth.Root
                </code>{" "}
                - Context provider (default export)
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Earth.Canvas
                </code>{" "}
                - Three.js canvas wrapper
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Earth.Controls
                </code>{" "}
                - Orbit controls for interaction
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Earth.Globe
                </code>{" "}
                - Main Earth sphere
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Earth.Atmosphere
                </code>{" "}
                - Atmospheric glow effect
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Earth.Clouds
                </code>{" "}
                - Cloud layer
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Earth.Axis
                </code>{" "}
                - Debug axis helper
              </li>
            </ul>
          </div>
        )}

        {componentId === "gantt-chart" && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
              Primitive Components
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              GanttChart uses composable primitives following shadcn
              architecture:
            </p>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  GanttChart.Root
                </code>{" "}
                - Context provider (default export)
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  GanttChart.Container
                </code>{" "}
                - Main wrapper with border
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  GanttChart.Viewport
                </code>{" "}
                - Scrollable SVG area
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  GanttChart.Grid
                </code>{" "}
                - Timeline grid lines
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  GanttChart.Header
                </code>{" "}
                - Timeline header with hour markers
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  GanttChart.Tasks
                </code>{" "}
                - All task bars
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  GanttChart.CurrentTime
                </code>{" "}
                - Live time indicator
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  GanttChart.LeftPanel
                </code>{" "}
                - Sticky task names panel
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  GanttChart.Empty
                </code>{" "}
                - Empty state component
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  GanttChart.Controls
                </code>{" "}
                - Pan left/right, zoom, reset controls
              </li>
            </ul>
          </div>
        )}

        {componentId === "line-chart" && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
              Primitive Components
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              LineChart uses composable primitives following shadcn
              architecture:
            </p>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Root
                </code>{" "}
                - Context provider with data processing (default export)
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Container
                </code>{" "}
                - Main wrapper with border and sizing
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Viewport
                </code>{" "}
                - SVG canvas for rendering
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Grid
                </code>{" "}
                - Background grid lines (X/Y)
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Axes
                </code>{" "}
                - X/Y axes with ticks and labels
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Lines
                </code>{" "}
                - Data line paths with optional fill
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Points
                </code>{" "}
                - Individual data point markers
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Tooltip
                </code>{" "}
                - Interactive hover tooltip with crosshair
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Interaction
                </code>{" "}
                - Mouse event handling layer
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Legend
                </code>{" "}
                - Series legend with optional toggle
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Empty
                </code>{" "}
                - Empty state component
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  LineChart.Loading
                </code>{" "}
                - Loading state component
              </li>
            </ul>
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">
                Composable Architecture
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Mix and match primitives to create custom chart layouts. For
                example, omit{" "}
                <code className="bg-blue-200 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">
                  LineChart.Grid
                </code>{" "}
                for a minimal sparkline, or add{" "}
                <code className="bg-blue-200 dark:bg-blue-800 px-1 py-0.5 rounded text-xs">
                  LineChart.Points
                </code>{" "}
                for scientific plots.
              </p>
            </div>
          </div>
        )}

        {(componentId === "mars" ||
          componentId === "mercury" ||
          componentId === "venus" ||
          componentId === "moon" ||
          componentId === "jupiter" ||
          componentId === "uranus" ||
          componentId === "neptune") && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
              Primitive Components
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              {componentId.charAt(0).toUpperCase() + componentId.slice(1)} uses
              composable primitives following shadcn architecture:
            </p>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  {componentId.charAt(0).toUpperCase() + componentId.slice(1)}
                  .Root
                </code>{" "}
                - Context provider (default export)
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  {componentId.charAt(0).toUpperCase() + componentId.slice(1)}
                  .Canvas
                </code>{" "}
                - Three.js canvas wrapper
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  {componentId.charAt(0).toUpperCase() + componentId.slice(1)}
                  .Controls
                </code>{" "}
                - Orbit controls for interaction
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  {componentId.charAt(0).toUpperCase() + componentId.slice(1)}
                  .Globe
                </code>{" "}
                - Main {componentId} sphere
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  {componentId.charAt(0).toUpperCase() + componentId.slice(1)}
                  .Axis
                </code>{" "}
                - Debug axis helper
              </li>
            </ul>
          </div>
        )}

        {componentId === "saturn" && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
              Primitive Components
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
              Saturn uses composable primitives following shadcn architecture:
            </p>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Saturn.Root
                </code>{" "}
                - Context provider (default export)
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Saturn.Canvas
                </code>{" "}
                - Three.js canvas wrapper
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Saturn.Controls
                </code>{" "}
                - Orbit controls for interaction
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Saturn.Globe
                </code>{" "}
                - Main Saturn sphere
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Saturn.Rings
                </code>{" "}
                - Saturn's ring system
              </li>
              <li>
                <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                  Saturn.Axis
                </code>{" "}
                - Debug axis helper
              </li>
            </ul>
          </div>
        )}

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
              {componentId === "earth" && (
                <>
                  <tr>
                    <td className="p-3 font-mono text-xs">dayMapUrl</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      URL to day surface texture map
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">nightMapUrl</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      URL to night lights emissive texture map
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">cloudsMapUrl</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      URL to cloud layer texture map
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">normalMapUrl</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      URL to normal/bump map for surface detail
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">specularMapUrl</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      URL to specular map for ocean reflectivity
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">radius</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">EARTH_RADIUS</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Earth radius in scene units (default: 6.371)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">enableRotation</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Enable automatic rotation based on time
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">timeScale</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">1</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Rotation speed multiplier (2 = 2x faster)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">brightness</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">1.0</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Overall scene brightness multiplier
                    </td>
                  </tr>
                </>
              )}
              {componentId === "gantt-chart" && (
                <>
                  <tr>
                    <td className="p-3 font-mono text-xs">tasks</td>
                    <td className="p-3 font-mono text-xs">Task[]</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      required
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Array of tasks with id, name, start, end, status, color,
                      description
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">timezone</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 font-mono text-xs">"UTC"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      IANA timezone (e.g., "America/New_York", "Europe/London")
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">width</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">1200</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Chart width in pixels
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">rowHeight</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">48</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Height of each task row in pixels
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">timeWindowHours</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">12</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Visible time window in hours
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">startTime</td>
                    <td className="p-3 font-mono text-xs">Date | number</td>
                    <td className="p-3 font-mono text-xs">new Date()</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Chart start time (scrollable range extends 30 days)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">interactive</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Enable hover tooltips and task interactions
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">onTaskClick</td>
                    <td className="p-3 font-mono text-xs">
                      (task: Task) =&gt; void
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Callback when task is clicked
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">variant</td>
                    <td className="p-3 font-mono text-xs">
                      "default" | "compact" | "detailed"
                    </td>
                    <td className="p-3 font-mono text-xs">"default"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Visual density: compact (160px), default (200px), detailed
                      (240px)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">className</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Additional CSS classes for the root element
                    </td>
                  </tr>
                </>
              )}
              {componentId === "heatmap" && (
                <>
                  <tr>
                    <td className="p-3 font-mono text-xs">data</td>
                    <td className="p-3 font-mono text-xs">
                      number[][] | HeatmapCell[]
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      required
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      2D data grid or flat array of cells with x, y, value
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">xLabels</td>
                    <td className="p-3 font-mono text-xs">string[]</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      X-axis categorical labels
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">yLabels</td>
                    <td className="p-3 font-mono text-xs">string[]</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Y-axis categorical labels
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">colormap</td>
                    <td className="p-3 font-mono text-xs">ColormapName</td>
                    <td className="p-3 font-mono text-xs">"viridis"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Scientific colormap (viridis, plasma, coolwarm, etc.)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">cellShape</td>
                    <td className="p-3 font-mono text-xs">
                      "square" | "hexagon"
                    </td>
                    <td className="p-3 font-mono text-xs">"square"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Cell shape: square grid or honeycomb hexagons
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">cellGap</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">0.05</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Cell gap/padding (0-1, as fraction of cell size)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">domain</td>
                    <td className="p-3 font-mono text-xs">
                      [number, number] | "auto"
                    </td>
                    <td className="p-3 font-mono text-xs">"auto"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Value domain [min, max] or auto-calculate
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showColorbar</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Show color scale legend
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showValues</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Show cell values as text
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showGrid</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Show grid lines between cells
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
                    <td className="p-3 font-mono text-xs">600</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Chart height in pixels
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">responsive</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Enable responsive container
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">animate</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Enable entrance animations
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">valueFormatter</td>
                    <td className="p-3 font-mono text-xs">
                      (value: number) =&gt; string
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Custom value formatting function
                    </td>
                  </tr>
                </>
              )}
              {(componentId === "mars" ||
                componentId === "mercury" ||
                componentId === "venus" ||
                componentId === "moon" ||
                componentId === "jupiter" ||
                componentId === "uranus" ||
                componentId === "neptune") && (
                <>
                  <tr>
                    <td className="p-3 font-mono text-xs">textureUrl</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      URL to surface texture map
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">radius</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">
                      {componentId.toUpperCase()}_RADIUS
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Planet radius in scene units
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">enableRotation</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Enable automatic rotation based on time
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">timeScale</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">1</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Rotation speed multiplier (2 = 2x faster)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">brightness</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">1.2</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Overall scene brightness multiplier
                    </td>
                  </tr>
                </>
              )}
              {componentId === "saturn" && (
                <>
                  <tr>
                    <td className="p-3 font-mono text-xs">textureUrl</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      URL to surface texture map
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">ringTextureUrl</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      URL to ring texture map
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">radius</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">SATURN_RADIUS</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Saturn radius in scene units
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">enableRotation</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Enable automatic rotation based on time
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">timeScale</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">1</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Rotation speed multiplier (2 = 2x faster)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">brightness</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">1.2</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Overall scene brightness multiplier
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showRings</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Display Saturn's ring system
                    </td>
                  </tr>
                </>
              )}
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
