"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { components } from "../../constants/components";

import { LineChart } from "@/../components/line-chart";
import { ScatterPlot } from "@/../components/scatter-plot";
import { PolarPlot } from "@/../components/polar-plot";
import { Heatmap } from "@/../components/heatmap";
import { Histogram } from "@/../components/histogram";
import { GanttChart } from "@/../components/gantt-chart";
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
          <LineChart
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
            showGrid={true}
            showLegend={false}
            renderer="svg"
          />
        }
        code={`<LineChart
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
  showGrid={true}
/>`}
      />

      {/* Damped Oscillation */}
      <ComponentPreview
        title="Damped Harmonic Oscillator"
        description="Exponential decay with oscillation (γ = 0.1, ω = 2 rad/s). Common in mechanical systems, RLC circuits, and vibration damping."
        preview={
          <LineChart
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
            showGrid={true}
            showLegend={false}
            renderer="svg"
          />
        }
        code={`<LineChart
  series={[{
    name: "Displacement",
    data: dampedOscillation,
    color: "#a855f7",
  }]}
  xAxis={{ label: "Time (s)" }}
  yAxis={{ label: "Amplitude" }}
  showGrid={true}
/>`}
      />

      {/* Signal Processing */}
      <ComponentPreview
        title="Signal Processing: Noise Reduction"
        description="Raw signal with noise vs filtered output. Demonstrates digital filtering and noise reduction techniques."
        preview={
          <LineChart
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
            showGrid={true}
            showLegend={true}
            renderer="svg"
          />
        }
        code={`<LineChart
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
  showGrid={true}
/>`}
      />

      {/* Orbital Velocity */}
      <ComponentPreview
        title="Orbital Velocity vs Altitude"
        description="Earth orbital mechanics using v = √(μ/r). Shows how orbital velocity decreases with altitude."
        preview={
          <LineChart
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
            showGrid={true}
            showLegend={false}
            renderer="svg"
          />
        }
        code={`<LineChart
  series={[{
    name: "Velocity",
    data: orbitalVelocity,
    color: "#3b82f6",
  }]}
  xAxis={{ label: "Altitude (km)" }}
  yAxis={{ label: "Orbital Velocity (km/s)" }}
  showGrid={true}
/>`}
      />

      {/* Real-Time Streaming */}
      <ComponentPreview
        title="Real-Time Telemetry Streaming"
        description="Live data streaming with a sliding window. Updates at 10Hz. Perfect for telemetry displays and real-time monitoring."
        preview={
          <div>
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
              width={850}
              height={350}
              showGrid={true}
              animate={false}
            />
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

<LineChart
  series={[{ name: "Live Telemetry", data }]}
  xAxis={{ label: "Time" }}
  yAxis={{ label: "Value" }}
  animate={false}
/>`}
      />

      {/* High-Volume Data */}
      <ComponentPreview
        title="High-Volume Data (50,000 Points)"
        description="Rendering 50,000 data points with automatic decimation (LTTB) and Canvas rendering for smooth 60fps performance."
        preview={
          <div className="space-y-2">
            <LineChart
              series={[
                { name: "Sensor Data", data: highVolumeData, color: "#8b5cf6" },
              ]}
              xAxis={{ label: "Time (s)" }}
              yAxis={{ label: "Signal" }}
              width={850}
              height={300}
              showGrid={true}
              showLegend={false}
              renderer="canvas"
              maxPoints={2000}
            />
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
              <LineChart
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
                showLegend={false}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                Scientific
              </p>
              <LineChart
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
                showLegend={false}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                Dashboard
              </p>
              <LineChart
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
                showLegend={false}
              />
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
          />
        }
        code={`<GanttChart
  tasks={[
    {
      id: "p1",
      name: "ISS Pass",
      start: new Date(2024, 0, 1, 8, 30),
      end: new Date(2024, 0, 1, 8, 45),
      status: "completed",
    },
    // ... more passes
  ]}
  timezone="UTC"
  timeWindowHours={12}
  startTime={new Date(2024, 0, 1, 8, 0)}
  onTaskClick={(task) => console.log(task)}
/>`}
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
          />
        }
        code={`<GanttChart
  tasks={multiSatPasses}
  timezone="UTC"
  timeWindowHours={8}
  variant="compact"
/>`}
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
          />
        }
        code={`<GanttChart
  tasks={opsSchedule}
  timezone="UTC"
  timeWindowHours={24}
  variant="detailed"
/>`}
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
              {componentId === "gantt-chart" && (
                <>
                  <tr>
                    <td className="p-3 font-mono text-xs">tasks</td>
                    <td className="p-3 font-mono text-xs">GanttTask[]</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      required
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Array of tasks to display on the timeline
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">groupBy</td>
                    <td className="p-3 font-mono text-xs">
                      "resource" | "none"
                    </td>
                    <td className="p-3 font-mono text-xs">"resource"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Group tasks by resource/category
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">timeWindow</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">43200000</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Time window in milliseconds (default: 12 hours)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">startTime</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">Date.now()</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Start time for the chart in milliseconds
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
                    <td className="p-3 font-mono text-xs">showNowLine</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Show current time indicator
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showControls</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Show timeline navigation controls
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">responsive</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Enable responsive width (fills container)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">loading</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Show loading state
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">emptyMessage</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 font-mono text-xs">
                      "No tasks scheduled"
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Message to display when no tasks
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">
                      onTimeWindowChange
                    </td>
                    <td className="p-3 font-mono text-xs">
                      (hours: number) =&gt; void
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Callback when time window changes
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">onStartTimeChange</td>
                    <td className="p-3 font-mono text-xs">
                      (time: number) =&gt; void
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Callback when start time changes
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
