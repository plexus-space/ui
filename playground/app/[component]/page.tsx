"use client";

import { useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { components } from "../../constants/components";
import { useColorScheme } from "@/components/color-scheme-provider";
import { SpectrogramDataPoint } from "@plexusui/components/spectrogram";

import { LineChart } from "@plexusui/components/line-chart";
import { PolarPlot } from "@plexusui/components/polar-plot";
import { Heatmap } from "@plexusui/components/heatmap";
import { GanttChart } from "@plexusui/components/gantt-chart";
import { ScatterPlot } from "@plexusui/components/scatter-plot";
import { BarChart } from "@plexusui/components/bar-chart";
import { Histogram } from "@plexusui/components/histogram";
import { BoxPlot } from "@plexusui/components/box-plot";
import { ViolinPlot } from "@plexusui/components/violin-plot";
import { Spectrogram } from "@plexusui/components/spectrogram";
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
// Seeded Random (for consistent SSR/client rendering)
// ============================================================================

// Simple seeded random number generator for deterministic pseudo-random values
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

// ============================================================================
// Component Examples
// ============================================================================

const LineChartExamples = () => {
  const { color } = useColorScheme();

  const fftData = useMemo(() => {
    const random = seededRandom(12345);
    return Array.from({ length: 128 }, (_, i) => {
      const freq = (i / 128) * 50;
      const peak1 = 80 * Math.exp(-Math.pow((freq - 5) / 1, 2));
      const peak2 = 40 * Math.exp(-Math.pow((freq - 10) / 1.5, 2));
      const peak3 = 20 * Math.exp(-Math.pow((freq - 15) / 2, 2));
      return { x: freq, y: peak1 + peak2 + peak3 + random() * 2 };
    });
  }, []);

  // Damped Oscillation
  const dampedOscillation = useMemo(
    () =>
      Array.from({ length: 200 }, (_, i) => {
        const t = i / 10;
        const omega = 2;
        const gamma = 0.1;
        return {
          x: t,
          y: Math.exp(-gamma * t) * Math.cos(omega * t) * 50 + 50,
        };
      }),
    []
  );

  // Noisy Signal
  const noisySignal = useMemo(() => {
    const random = seededRandom(54321);
    return Array.from({ length: 100 }, (_, i) => {
      const t = i / 10;
      return { x: t, y: 30 * Math.sin(t) + 50 + (random() - 0.5) * 10 };
    });
  }, []);

  const filteredSignal = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => {
        const t = i / 10;
        return { x: t, y: 30 * Math.sin(t) + 50 };
      }),
    []
  );

  // Orbital Velocity
  const orbitalVelocity = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => {
        const altitude = i * 5;
        const earthRadius = 6371;
        const mu = 398600;
        const r = earthRadius + altitude;
        return { x: altitude, y: Math.sqrt(mu / r) };
      }),
    []
  );

  // High-volume data (50,000 points)
  const highVolumeData = useMemo(() => {
    const random = seededRandom(99999);
    return Array.from({ length: 50000 }, (_, i) => ({
      x: i / 100,
      y: Math.sin(i / 100) * 30 + Math.sin(i / 10) * 10 + random() * 5 + 50,
    }));
  }, []);

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
          <div className="w-full">
            <LineChart.Root
              series={[
                {
                  name: "Magnitude",
                  data: fftData,
                  color: color,
                  strokeWidth: 2,
                  filled: true,
                },
              ]}
              xAxis={{ label: "Frequency (Hz)" }}
              yAxis={{ label: "Magnitude (dB)" }}
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
          <div className="w-full">
            <LineChart.Root
              series={[
                {
                  name: "Displacement",
                  data: dampedOscillation,
                  color: color,
                  strokeWidth: 2.5,
                },
              ]}
              xAxis={{ label: "Time (s)" }}
              yAxis={{ label: "Amplitude" }}
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
        description="Raw signal with noise vs filtered output. Demonstrates digital filtering and noise reduction techniques. Uses unified tooltip to compare both signals at the same x-coordinate."
        preview={
          <div className="w-full">
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
                  color: color,
                  strokeWidth: 2.5,
                },
              ]}
              xAxis={{ label: "Time (s)" }}
              yAxis={{ label: "Voltage (V)" }}
              unifiedTooltip={true}
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
          </div>
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
  unifiedTooltip={true}
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
          <div className="w-full">
            <LineChart.Root
              series={[
                {
                  name: "Velocity",
                  data: orbitalVelocity,
                  color: color,
                  strokeWidth: 2.5,
                },
              ]}
              xAxis={{ label: "Altitude (km)" }}
              yAxis={{ label: "Orbital Velocity (km/s)" }}
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
          <div className="w-full">
            <LineChart.Root
              series={[
                {
                  name: "Live Telemetry",
                  data: streamingData,
                  color: color,
                },
              ]}
              xAxis={{ label: "Time" }}
              yAxis={{ label: "Value" }}
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
          <div className="w-full space-y-2">
            <LineChart.Root
              series={[
                { name: "Sensor Data", data: highVolumeData, color: color },
              ]}
              xAxis={{ label: "Time (s)" }}
              yAxis={{ label: "Signal" }}
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
    </div>
  );
};

const PolarPlotExamples = () => {
  const { color } = useColorScheme();

  // Antenna radiation pattern
  const radiationPattern = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const theta = (i / 36) * 2 * Math.PI;
        const r = 0.5 + 0.5 * Math.abs(Math.cos(2 * theta));
        return { theta, r };
      }),
    []
  );

  // Radar chart for spacecraft subsystems
  const subsystemHealth = useMemo(
    () => [
      { theta: 0, r: 0.9, label: "Power" },
      { theta: Math.PI / 3, r: 0.7, label: "Propulsion" },
      { theta: (2 * Math.PI) / 3, r: 0.85, label: "Thermal" },
      { theta: Math.PI, r: 0.95, label: "Comm" },
      { theta: (4 * Math.PI) / 3, r: 0.6, label: "ADCS" },
      { theta: (5 * Math.PI) / 3, r: 0.8, label: "CDH" },
    ],
    []
  );

  // Wind rose (directional data)
  const windData = useMemo(() => {
    const random = seededRandom(11111);
    return Array.from({ length: 16 }, (_, i) => {
      const theta = (i / 16) * 2 * Math.PI;
      const r = random() * 0.5 + 0.3;
      return { theta, r };
    });
  }, []);

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Antenna Radiation Pattern"
        description="Polar plot showing the directional gain pattern of an antenna."
        preview={
          <div className="flex justify-center w-full">
            <div
              className="w-full max-w-[600px]"
              style={{ aspectRatio: "1/1" }}
            >
              <PolarPlot.Root
                series={[
                  {
                    name: "Gain Pattern",
                    data: radiationPattern,
                    color: color,
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
                showLegend={false}
                variant="polar"
                responsive={true}
              >
                <PolarPlot.Container>
                  <PolarPlot.Viewport>
                    <PolarPlot.Grid />
                    <PolarPlot.Lines />
                    <PolarPlot.Tooltip />
                  </PolarPlot.Viewport>
                </PolarPlot.Container>
              </PolarPlot.Root>
            </div>
          </div>
        }
        code={`<PolarPlot.Root
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
>
  <PolarPlot.Container>
    <PolarPlot.Viewport>
      <PolarPlot.Grid />
      <PolarPlot.Lines />
      <PolarPlot.Tooltip />
    </PolarPlot.Viewport>
  </PolarPlot.Container>
</PolarPlot.Root>`}
      />

      <ComponentPreview
        title="Spacecraft Subsystem Health Radar"
        description="Radar chart displaying multiple subsystem health metrics. Perfect for multi-dimensional comparisons at a glance."
        preview={
          <div className="flex justify-center w-full">
            <div
              className="w-full max-w-[600px]"
              style={{ aspectRatio: "1/1" }}
            >
              <PolarPlot.Root
                series={[
                  {
                    name: "Health Status",
                    data: subsystemHealth,
                    color: color,
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
                showLegend={false}
                variant="radar"
                responsive={true}
              >
                <PolarPlot.Container>
                  <PolarPlot.Viewport>
                    <PolarPlot.Grid />
                    <PolarPlot.Lines />
                    <PolarPlot.Tooltip />
                  </PolarPlot.Viewport>
                </PolarPlot.Container>
              </PolarPlot.Root>
            </div>
          </div>
        }
        code={`<PolarPlot.Root
  series={[{
    name: "Health Status",
    data: subsystemHealth,
    filled: true,
  }]}
  variant="radar"
>
  <PolarPlot.Container>
    <PolarPlot.Viewport>
      <PolarPlot.Grid />
      <PolarPlot.Lines />
      <PolarPlot.Tooltip />
    </PolarPlot.Viewport>
  </PolarPlot.Container>
</PolarPlot.Root>`}
      />

      <ComponentPreview
        title="Rose Diagram"
        description="Rose diagram for directional data like wind direction or orbital phase distribution."
        preview={
          <div className="flex justify-center w-full">
            <div
              className="w-full max-w-[600px]"
              style={{ aspectRatio: "1/1" }}
            >
              <PolarPlot.Root
                series={[
                  {
                    name: "Wind Distribution",
                    data: windData,
                    color: color,
                    filled: true,
                    closed: true,
                  },
                ]}
                axis={{
                  label: "Frequency",
                  rings: 4,
                  angleCount: 16,
                }}
                showLegend={false}
                variant="rose"
                responsive={true}
              >
                <PolarPlot.Container>
                  <PolarPlot.Viewport>
                    <PolarPlot.Grid />
                    <PolarPlot.Lines />
                    <PolarPlot.Tooltip />
                  </PolarPlot.Viewport>
                </PolarPlot.Container>
              </PolarPlot.Root>
            </div>
          </div>
        }
        code={`<PolarPlot.Root
  series={[{
    name: "Wind Distribution",
    data: windData,
    filled: true,
  }]}
  variant="rose"
>
  <PolarPlot.Container>
    <PolarPlot.Viewport>
      <PolarPlot.Grid />
      <PolarPlot.Lines />
      <PolarPlot.Tooltip />
    </PolarPlot.Viewport>
  </PolarPlot.Container>
</PolarPlot.Root>`}
      />
    </div>
  );
};

const HeatmapExamples = () => {
  // High-volume honeycomb data (optimized for SVG rendering)
  const honeycombData = useMemo(() => {
    const random = seededRandom(44444);
    const width = 80;
    const height = 60;

    // Generate flat array for optimal performance
    return Array.from({ length: width * height }, (_, i) => {
      const x = i % width;
      const y = Math.floor(i / width);

      // Create interesting pattern with multiple wave functions
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // Combine radial and angular patterns
      const radialPattern = 100 * Math.exp(-(dist * dist) / 400);
      const wavePattern = 50 * Math.sin(dist / 3) * Math.cos(angle * 3);
      const noise = random() * 20;

      return {
        x,
        y,
        value: radialPattern + wavePattern + noise,
      };
    });
  }, []);

  // Time-series heatmap (ground station contacts)
  const contactHeatmap = useMemo(() => {
    const random = seededRandom(33333);
    return Array.from({ length: 24 }, (_, hour) =>
      Array.from({ length: 7 }, (_, day) => Math.floor(random() * 10))
    );
  }, []);

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Ground Station Contact Schedule"
        description="Time-series heatmap showing satellite contact opportunities across days and hours."
        preview={
          <div className="flex justify-center w-full">
            <div className="w-full max-w-[850px]">
              <Heatmap.Root
                data={contactHeatmap}
                xLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
                yLabels={Array.from({ length: 24 }, (_, i) => `${i}:00`)}
                xAxisLabel="Day of Week"
                yAxisLabel="Hour (UTC)"
                colormap="blues"
                animate={false}
                showColorbar={true}
                showValues={false}
                responsive={true}
              >
                <Heatmap.Container>
                  <Heatmap.Viewport>
                    <Heatmap.Cells />
                    <Heatmap.Axes />

                    <Heatmap.Tooltip />
                  </Heatmap.Viewport>
                </Heatmap.Container>
              </Heatmap.Root>
            </div>
          </div>
        }
        code={`<Heatmap.Root
  data={contactHeatmap}
  xLabels={["Sun", "Mon", "Tue", ...]}
  yLabels={["0:00", "1:00", ...]}
  colormap="plasma"
  showValues={true}
>
  <Heatmap.Container>
    <Heatmap.Viewport>
      <Heatmap.Cells />
      <Heatmap.Axes />
      <Heatmap.Tooltip />
    </Heatmap.Viewport>
  </Heatmap.Container>
</Heatmap.Root>`}
      />

      <ComponentPreview
        title="Honeycomb Heatmap"
        description="Hexagonal cell layout with smooth interactions. Optimized with disabled animations for instant rendering."
        preview={
          <div className="flex justify-center w-full">
            <div className="w-full max-w-[850px]">
              <Heatmap.Root
                data={honeycombData}
                colormap="inferno"
                showColorbar={true}
                cellShape="hexagon"
                cellGap={0.08}
                showGrid={false}
                animate={false}
                responsive={true}
              >
                <Heatmap.Container>
                  <Heatmap.Viewport>
                    <Heatmap.Cells />
                    <Heatmap.Axes />
                    <Heatmap.Tooltip />
                  </Heatmap.Viewport>
                </Heatmap.Container>
              </Heatmap.Root>
            </div>
          </div>
        }
        code={`// Generate honeycomb data with interesting pattern
const honeycombData = useMemo(() => {
  const width = 80;
  const height = 60;

  return Array.from({ length: width * height }, (_, i) => {
    const x = i % width;
    const y = Math.floor(i / width);

    // Create interesting pattern
    const centerX = width / 2;
    const centerY = height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const radialPattern = 100 * Math.exp(-(dist * dist) / 400);
    const wavePattern = 50 * Math.sin(dist / 3) * Math.cos(angle * 3);

    return { x, y, value: radialPattern + wavePattern };
  });
}, []);

<Heatmap.Root
  data={honeycombData}
  colormap="inferno"
  cellShape="hexagon"
  cellGap={0.08}
  showGrid={false}
  animate={false} // Disable for performance
  responsive={true}
>
  <Heatmap.Container>
    <Heatmap.Viewport>
      <Heatmap.Cells />
      <Heatmap.Axes />
      <Heatmap.Tooltip />
    </Heatmap.Viewport>
  </Heatmap.Container>
</Heatmap.Root>`}
      />
    </div>
  );
};

const GanttChartExamples = () => {
  const { color } = useColorScheme();
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
      name: "Sentinel-1A",
      start: new Date(baseTime.getTime() - 120 * 60000), // 06:00
      end: new Date(baseTime.getTime() - 108 * 60000), // 06:12
      status: "completed" as const,
      description: "SAR data downlink",
      color: color,
    },
    {
      id: "p2",
      name: "ISS Pass",
      start: new Date(baseTime.getTime() - 60 * 60000), // 07:00
      end: new Date(baseTime.getTime() - 45 * 60000), // 07:15
      status: "completed" as const,
      description: "Low elevation pass",
      color: color,
    },
    {
      id: "p3",
      name: "NOAA-19",
      start: new Date(baseTime.getTime() - 15 * 60000), // 07:45
      end: new Date(baseTime.getTime() - 3 * 60000), // 07:57
      status: "completed" as const,
      description: "Weather imagery",
      color: color,
    },
    {
      id: "p4",
      name: "NOAA-18 Downlink",
      start: new Date(baseTime.getTime() + 20 * 60000), // 08:20
      end: new Date(baseTime.getTime() + 32 * 60000), // 08:32
      status: "in-progress" as const,
      description: "Weather data acquisition",
      color: color,
    },
    {
      id: "p5",
      name: "TerraSAR-X",
      start: new Date(baseTime.getTime() + 95 * 60000), // 09:35
      end: new Date(baseTime.getTime() + 108 * 60000), // 09:48
      status: "planned" as const,
      description: "Radar imaging pass",
      color: color,
    },
    {
      id: "p6",
      name: "Starlink Command",
      start: new Date(baseTime.getTime() + 175 * 60000), // 10:55
      end: new Date(baseTime.getTime() + 188 * 60000), // 11:08
      status: "planned" as const,
      description: "Telemetry uplink",
      color: color,
    },
    {
      id: "p7",
      name: "Aqua",
      start: new Date(baseTime.getTime() + 255 * 60000), // 12:15
      end: new Date(baseTime.getTime() + 270 * 60000), // 12:30
      status: "planned" as const,
      description: "MODIS data collection",
      color: color,
    },
    {
      id: "p8",
      name: "Landsat 9 TLM",
      start: new Date(baseTime.getTime() + 335 * 60000), // 13:35
      end: new Date(baseTime.getTime() + 350 * 60000), // 13:50
      status: "planned" as const,
      description: "Earth observation data",
      color: color,
    },
    {
      id: "p9",
      name: "MetOp-B",
      start: new Date(baseTime.getTime() + 425 * 60000), // 15:05
      end: new Date(baseTime.getTime() + 437 * 60000), // 15:17
      status: "planned" as const,
      description: "Meteorological data",
      color: color,
    },
    {
      id: "p10",
      name: "Sentinel-3B",
      start: new Date(baseTime.getTime() + 510 * 60000), // 16:30
      end: new Date(baseTime.getTime() + 523 * 60000), // 16:43
      status: "planned" as const,
      description: "Ocean monitoring",
      color: color,
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
              rowHeight={50}
              timeWindowHours={timeWindowHours}
              startTime={baseTime}
              interactive={true}
              onTaskClick={(task) => console.log("Clicked:", task.name)}
              variant="compact"
            >
              <div className="flex justify-end p-4 w-full">
                <GanttChart.Controls />
              </div>
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
        code={`<div className="space-y-4">
  <GanttChart
    tasks={groundStationPasses}
    timezone={timezone}
    rowHeight={50}
    timeWindowHours={timeWindowHours}
    startTime={baseTime}
    interactive={true}
    onTaskClick={(task) => console.log("Clicked:", task.name)}
    variant="compact"
  >
    <div className="flex justify-end p-4 w-full">
      <GanttChart.Controls />
    </div>
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
</div>`}
      />
    </div>
  );
};

const ScatterPlotExamples = () => {
  const { color } = useColorScheme();

  // Correlation dataset
  const correlationData = useMemo(() => {
    const random = seededRandom(42);
    return Array.from({ length: 100 }, (_, i) => {
      const x = random() * 100;
      const noise = (random() - 0.5) * 20;
      return { x, y: 0.8 * x + 20 + noise };
    });
  }, []);

  // Clustered data (3 clusters)
  const clusteredData = useMemo(() => {
    const random = seededRandom(123);
    const clusters = [
      { cx: 30, cy: 30, color: color },
      { cx: 70, cy: 50, color: "#ef4444" },
      { cx: 50, cy: 80, color: "#f59e0b" },
    ];

    return clusters.map((cluster, clusterIdx) => ({
      name: `Cluster ${clusterIdx + 1}`,
      data: Array.from({ length: 50 }, () => ({
        x: cluster.cx + (random() - 0.5) * 20,
        y: cluster.cy + (random() - 0.5) * 20,
      })),
      color: cluster.color,
      radius: 4,
      opacity: 0.7,
    }));
  }, [color]);

  // Experimental data with labels
  const experimentalData = useMemo(() => {
    const random = seededRandom(999);
    return Array.from({ length: 30 }, (_, i) => ({
      x: i * 3,
      y: 50 + Math.sin(i / 3) * 20 + (random() - 0.5) * 10,
      label: `Point ${i + 1}`,
    }));
  }, []);

  // Altitude vs Velocity (orbital mechanics)
  const orbitalData = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => {
      const altitude = i * 10 + 200; // km
      const earthRadius = 6371;
      const mu = 398600; // km³/s²
      const r = earthRadius + altitude;
      const velocity = Math.sqrt(mu / r);
      return { x: altitude, y: velocity };
    });
  }, []);

  // Temperature vs Pressure (thermodynamics)
  const thermoData = useMemo(() => {
    const random = seededRandom(777);
    return Array.from({ length: 40 }, (_, i) => {
      const temp = 273 + i * 5; // Kelvin
      const pressure = (temp / 273) * 101.325 + (random() - 0.5) * 10; // kPa
      return { x: temp, y: pressure };
    });
  }, []);

  // High-volume sensor data (50,000 points)
  const highVolumeSensorData = useMemo(() => {
    const random = seededRandom(777777);
    return Array.from({ length: 50000 }, (_, i) => {
      const cluster = Math.floor(i / 16667);
      const centerX = cluster * 33 + 17 + (random() - 0.5) * 25;
      const centerY = 50 + Math.sin(cluster * 2) * 20 + (random() - 0.5) * 20;
      return { x: centerX, y: centerY };
    });
  }, []);

  return (
    <div className="space-y-12">
      {/* Basic Scatter Plot with Correlation */}
      <ComponentPreview
        title="Linear Correlation with Regression"
        description="Scatter plot showing strong positive correlation (R² ≈ 0.85). The regression line helps identify trends and outliers in experimental data."
        preview={
          <div className="w-full">
            <ScatterPlot.Root
              series={[
                {
                  name: "Data Points",
                  data: correlationData,
                  color: color,
                  radius: 5,
                  opacity: 0.7,
                },
              ]}
              xAxis={{ label: "Independent Variable" }}
              yAxis={{ label: "Dependent Variable" }}
              showRegression={true}
            >
              <ScatterPlot.Container>
                <ScatterPlot.Viewport>
                  <ScatterPlot.Grid />
                  <ScatterPlot.Axes />
                  <ScatterPlot.Regression />
                  <ScatterPlot.Points />
                  <ScatterPlot.Interaction />
                  <ScatterPlot.Tooltip />
                </ScatterPlot.Viewport>
              </ScatterPlot.Container>
            </ScatterPlot.Root>
          </div>
        }
        code={`<ScatterPlot.Root
  series={[
    {
      name: "Data Points",
      data: correlationData,
      color: "#06b6d4",
      radius: 5,
      opacity: 0.7,
    },
  ]}
  xAxis={{ label: "Independent Variable" }}
  yAxis={{ label: "Dependent Variable" }}
  showRegression={true}
  width={850}
  height={400}
>
  <ScatterPlot.Container>
    <ScatterPlot.Viewport>
      <ScatterPlot.Grid />
      <ScatterPlot.Axes />
      <ScatterPlot.Regression />
      <ScatterPlot.Points />
      <ScatterPlot.Interaction />
      <ScatterPlot.Tooltip />
    </ScatterPlot.Viewport>
  </ScatterPlot.Container>
</ScatterPlot.Root>`}
      />

      {/* Multi-series Clustering */}
      <ComponentPreview
        title="Multi-cluster Point Cloud"
        description="Visualizing multiple clusters in 2D space. Common in machine learning classification, particle tracking, and spatial analysis. Uses responsive HTML legend for better UX."
        preview={
          <div className="w-full">
            <ScatterPlot.Root
              series={clusteredData}
              xAxis={{ label: "Feature 1" }}
              yAxis={{ label: "Feature 2" }}
            >
              <ScatterPlot.LegendHTML interactive={true} />
              <ScatterPlot.Container>
                <ScatterPlot.Viewport>
                  <ScatterPlot.Grid />
                  <ScatterPlot.Axes />
                  <ScatterPlot.Points />
                  <ScatterPlot.Interaction />
                  <ScatterPlot.Tooltip />
                </ScatterPlot.Viewport>
              </ScatterPlot.Container>
            </ScatterPlot.Root>
          </div>
        }
        code={`<ScatterPlot.Root
  series={clusteredData}
  xAxis={{ label: "Feature 1" }}
  yAxis={{ label: "Feature 2" }}
>
  <ScatterPlot.LegendHTML interactive={true} />
  <ScatterPlot.Container>
    <ScatterPlot.Viewport>
      <ScatterPlot.Grid />
      <ScatterPlot.Axes />
      <ScatterPlot.Points />
      <ScatterPlot.Interaction />
      <ScatterPlot.Tooltip />
    </ScatterPlot.Viewport>
  </ScatterPlot.Container>
</ScatterPlot.Root>`}
      />

      {/* Orbital Mechanics */}
      <ComponentPreview
        title="Orbital Velocity vs Altitude"
        description="Relationship between circular orbital velocity and altitude above Earth. Shows inverse square root relationship from orbital mechanics."
        preview={
          <div className="w-full">
            <ScatterPlot.Root
              series={[
                {
                  name: "Circular Orbit",
                  data: orbitalData,
                  color: color,
                  radius: 4,
                  opacity: 0.8,
                },
              ]}
              xAxis={{ label: "Altitude (km)" }}
              yAxis={{ label: "Velocity (km/s)" }}
              showRegression={false}
            >
              <ScatterPlot.Container>
                <ScatterPlot.Viewport>
                  <ScatterPlot.Grid />
                  <ScatterPlot.Axes />
                  <ScatterPlot.Points />
                  <ScatterPlot.Interaction />
                  <ScatterPlot.Tooltip />
                </ScatterPlot.Viewport>
              </ScatterPlot.Container>
            </ScatterPlot.Root>
          </div>
        }
        code={`<ScatterPlot.Root
  series={[
    {
      name: "Circular Orbit",
      data: orbitalData,
      color: "#06b6d4",
      radius: 4,
    },
  ]}
  xAxis={{ label: "Altitude (km)" }}
  yAxis={{ label: "Velocity (km/s)" }}
  width={850}
  height={400}
>
  <ScatterPlot.Container>
    <ScatterPlot.Viewport>
      <ScatterPlot.Grid />
      <ScatterPlot.Axes />
      <ScatterPlot.Points />
      <ScatterPlot.Interaction />
      <ScatterPlot.Tooltip />
    </ScatterPlot.Viewport>
  </ScatterPlot.Container>
</ScatterPlot.Root>`}
      />

      {/* Thermodynamics */}
      <ComponentPreview
        title="Temperature-Pressure Relationship"
        description="Gas behavior following ideal gas law (P ∝ T). Linear relationship with experimental scatter demonstrates real-world measurement noise."
        preview={
          <div className="w-full">
            <ScatterPlot.Root
              series={[
                {
                  name: "Measurements",
                  data: thermoData,
                  color: color,
                  radius: 5,
                  opacity: 0.7,
                },
              ]}
              xAxis={{ label: "Temperature (K)" }}
              yAxis={{ label: "Pressure (kPa)" }}
              showRegression={true}
            >
              <ScatterPlot.Container>
                <ScatterPlot.Viewport>
                  <ScatterPlot.Grid />
                  <ScatterPlot.Axes />
                  <ScatterPlot.Regression />
                  <ScatterPlot.Points />
                  <ScatterPlot.Interaction />
                  <ScatterPlot.Tooltip />
                </ScatterPlot.Viewport>
              </ScatterPlot.Container>
            </ScatterPlot.Root>
          </div>
        }
        code={`<ScatterPlot.Root
  series={[
    {
      name: "Measurements",
      data: thermoData,
      color: "#06b6d4",
      radius: 5,
      opacity: 0.7,
    },
  ]}
  xAxis={{ label: "Temperature (K)" }}
  yAxis={{ label: "Pressure (kPa)" }}
  showRegression={true}
  width={850}
  height={400}
>
  <ScatterPlot.Container>
    <ScatterPlot.Viewport>
      <ScatterPlot.Grid />
      <ScatterPlot.Axes />
      <ScatterPlot.Regression />
      <ScatterPlot.Points />
      <ScatterPlot.Interaction />
      <ScatterPlot.Tooltip />
    </ScatterPlot.Viewport>
  </ScatterPlot.Container>
</ScatterPlot.Root>`}
      />

      {/* High-Volume Data with Automatic Sampling */}
      <ComponentPreview
        title="High-Volume Data Performance (50,000 Points)"
        description="Demonstrates density-aware sampling for large datasets. 50,000 raw data points are intelligently sampled down to 5,000 using spatial grid analysis. Dense clusters are reduced while outliers and sparse regions are preserved, maintaining accurate visual distribution. Hover still works seamlessly."
        preview={
          <div className="w-full">
            <ScatterPlot.Root
              series={[
                {
                  name: "Sensor Measurements",
                  data: highVolumeSensorData,
                  color: color,
                  radius: 3,
                  opacity: 0.6,
                },
              ]}
              xAxis={{ label: "Parameter X" }}
              yAxis={{ label: "Parameter Y" }}
              maxPoints={5000}
            >
              <ScatterPlot.Container>
                <ScatterPlot.Viewport>
                  <ScatterPlot.Grid />
                  <ScatterPlot.Axes />
                  <ScatterPlot.Points />
                  <ScatterPlot.Interaction />
                  <ScatterPlot.Tooltip />
                </ScatterPlot.Viewport>
              </ScatterPlot.Container>
            </ScatterPlot.Root>
          </div>
        }
        code={`// Generate 50,000 data points
const sensorData = Array.from({ length: 50000 }, (_, i) => {
  const cluster = Math.floor(i / 16667);
  const centerX = (cluster * 33 + 17) + (Math.random() - 0.5) * 25;
  const centerY = 50 + Math.sin(cluster * 2) * 20 + (Math.random() - 0.5) * 20;
  return { x: centerX, y: centerY };
});

<ScatterPlot.Root
  series={[
    {
      name: "Sensor Measurements",
      data: sensorData, // 50,000 points
      color: "#06b6d4",
      radius: 3,
      opacity: 0.6,
    },
  ]}
  xAxis={{ label: "Parameter X" }}
  yAxis={{ label: "Parameter Y" }}
  maxPoints={5000} // Density-aware sampling to 5,000 points
  width={850}
  height={400}
>
  <ScatterPlot.Container>
    <ScatterPlot.Viewport>
      <ScatterPlot.Grid />
      <ScatterPlot.Axes />
      <ScatterPlot.Points />
      <ScatterPlot.Interaction />
      <ScatterPlot.Tooltip />
    </ScatterPlot.Viewport>
  </ScatterPlot.Container>
</ScatterPlot.Root>`}
      />
    </div>
  );
};

const BarChartExamples = () => {
  const { color } = useColorScheme();

  // Monthly sales data
  const salesData = useMemo(() => {
    return [
      { category: "Jan", value: 45 },
      { category: "Feb", value: 52 },
      { category: "Mar", value: 61 },
      { category: "Apr", value: 58 },
      { category: "May", value: 67 },
      { category: "Jun", value: 73 },
    ];
  }, []);

  // Multi-series revenue data for grouped bars
  const revenueData = useMemo(() => {
    return [
      {
        name: "Product A",
        data: [
          { category: "Q1", value: 120 },
          { category: "Q2", value: 135 },
          { category: "Q3", value: 148 },
          { category: "Q4", value: 162 },
        ],
        color: color,
      },
      {
        name: "Product B",
        data: [
          { category: "Q1", value: 95 },
          { category: "Q2", value: 108 },
          { category: "Q3", value: 121 },
          { category: "Q4", value: 134 },
        ],
        color: "#ef4444",
      },
      {
        name: "Product C",
        data: [
          { category: "Q1", value: 78 },
          { category: "Q2", value: 85 },
          { category: "Q3", value: 92 },
          { category: "Q4", value: 101 },
        ],
        color: "#f59e0b",
      },
    ];
  }, [color]);

  // Stacked data - mission phases
  const missionData = useMemo(() => {
    return [
      {
        name: "Planning",
        data: [
          { category: "Phase 1", value: 120 },
          { category: "Phase 2", value: 80 },
          { category: "Phase 3", value: 60 },
          { category: "Phase 4", value: 40 },
        ],
        color: color,
      },
      {
        name: "Execution",
        data: [
          { category: "Phase 1", value: 80 },
          { category: "Phase 2", value: 140 },
          { category: "Phase 3", value: 160 },
          { category: "Phase 4", value: 120 },
        ],
        color: "#10b981",
      },
      {
        name: "Analysis",
        data: [
          { category: "Phase 1", value: 40 },
          { category: "Phase 2", value: 60 },
          { category: "Phase 3", value: 80 },
          { category: "Phase 4", value: 140 },
        ],
        color: "#3b82f6",
      },
    ];
  }, [color]);

  // Horizontal bar data - satellite performance
  const satelliteData = useMemo(() => {
    return [
      {
        name: "Satellites",
        data: [
          { category: "GOES-16", value: 98.5 },
          { category: "NOAA-20", value: 96.2 },
          { category: "Landsat 9", value: 99.1 },
          { category: "Sentinel-2", value: 94.8 },
          { category: "Terra", value: 97.3 },
        ],
        color: color,
      },
    ];
  }, [color]);

  return (
    <div className="space-y-12">
      {/* Simple Vertical Bar Chart */}
      <ComponentPreview
        title="Vertical Bar Chart"
        description="Basic vertical bar chart showing monthly sales data. Clean and straightforward visualization for categorical data with single series."
        preview={
          <div className="w-full">
            <BarChart.Root
              series={[
                {
                  name: "Sales",
                  data: salesData,
                  color: color,
                },
              ]}
              xAxis={{ label: "Month" }}
              yAxis={{ label: "Sales ($K)" }}
              orientation="vertical"
              mode="grouped"
              animate={false}
            >
              <BarChart.Container>
                <BarChart.Viewport>
                  <BarChart.Grid />
                  <BarChart.Axes />
                  <BarChart.Bars />
                  <BarChart.Interaction />
                  <BarChart.Tooltip />
                </BarChart.Viewport>
              </BarChart.Container>
            </BarChart.Root>
          </div>
        }
        code={`<BarChart.Root
  series={[
    {
      name: "Sales",
      data: salesData,
      color: "#3b82f6",
    },
  ]}
  xAxis={{ label: "Month" }}
  yAxis={{ label: "Sales ($K)" }}
  orientation="vertical"
  mode="grouped"
>
  <BarChart.Container>
    <BarChart.Viewport>
      <BarChart.Grid />
      <BarChart.Axes />
      <BarChart.Bars />
      <BarChart.Interaction />
      <BarChart.Tooltip />
    </BarChart.Viewport>
  </BarChart.Container>
</BarChart.Root>`}
      />

      {/* Grouped Bar Chart */}
      <ComponentPreview
        title="Grouped Bar Chart"
        description="Multiple series displayed side-by-side for easy comparison. Perfect for comparing multiple products or categories across time periods."
        preview={
          <div className="w-full">
            <BarChart.Root
              series={revenueData}
              xAxis={{ label: "Quarter" }}
              yAxis={{ label: "Revenue ($K)" }}
              orientation="vertical"
              mode="grouped"
              barWidth={0.7}
              barGap={0.05}
              animate={false}
            >
              <BarChart.Container>
                <BarChart.Viewport>
                  <BarChart.Grid />
                  <BarChart.Axes />
                  <BarChart.Bars />
                  <BarChart.Interaction />
                  <BarChart.Tooltip />
                </BarChart.Viewport>
              </BarChart.Container>
            </BarChart.Root>
          </div>
        }
        code={`<BarChart.Root
  series={revenueData}
  xAxis={{ label: "Quarter" }}
  yAxis={{ label: "Revenue ($K)" }}
  orientation="vertical"
  mode="grouped"
  barWidth={0.7}
>
  <BarChart.Container>
    <BarChart.Viewport>
      <BarChart.Grid />
      <BarChart.Axes />
      <BarChart.Bars />
      <BarChart.Interaction />
      <BarChart.Tooltip />
    </BarChart.Viewport>
  </BarChart.Container>
</BarChart.Root>`}
      />

      {/* Stacked Bar Chart */}
      <ComponentPreview
        title="Stacked Bar Chart"
        description="Stacked bars showing the composition of totals across categories. Ideal for showing part-to-whole relationships over time or across categories."
        preview={
          <div className="w-full">
            <BarChart.Root
              series={missionData}
              xAxis={{ label: "Mission Phase" }}
              yAxis={{ label: "Hours Allocated" }}
              orientation="vertical"
              mode="stacked"
              animate={false}
            >
              <BarChart.Container>
                <BarChart.Viewport>
                  <BarChart.Grid />
                  <BarChart.Axes />
                  <BarChart.Bars />
                  <BarChart.Interaction />
                  <BarChart.Tooltip />
                </BarChart.Viewport>
              </BarChart.Container>
            </BarChart.Root>
          </div>
        }
        code={`<BarChart.Root
  series={missionData}
  xAxis={{ label: "Mission Phase" }}
  yAxis={{ label: "Hours Allocated" }}
  orientation="vertical"
  mode="stacked"
>
  <BarChart.Container>
    <BarChart.Viewport>
      <BarChart.Grid />
      <BarChart.Axes />
      <BarChart.Bars />
      <BarChart.Interaction />
      <BarChart.Tooltip />
    </BarChart.Viewport>
  </BarChart.Container>
</BarChart.Root>`}
      />

      {/* Horizontal Bar Chart */}
      <ComponentPreview
        title="Horizontal Bar Chart"
        description="Horizontal orientation is ideal for comparing values with longer category labels. Perfect for rankings, ratings, or performance metrics."
        preview={
          <div className="w-full">
            <BarChart.Root
              series={satelliteData}
              xAxis={{ label: "Uptime (%)" }}
              yAxis={{ label: "Satellite" }}
              orientation="horizontal"
              mode="grouped"
              animate={false}
            >
              <BarChart.Container>
                <BarChart.Viewport>
                  <BarChart.Grid />
                  <BarChart.Axes />
                  <BarChart.Bars />
                  <BarChart.Interaction />
                  <BarChart.Tooltip />
                </BarChart.Viewport>
              </BarChart.Container>
            </BarChart.Root>
          </div>
        }
        code={`<BarChart.Root
  series={satelliteData}
  xAxis={{ label: "Uptime (%)" }}
  yAxis={{ label: "Satellite" }}
  orientation="horizontal"
  mode="grouped"
>
  <BarChart.Container>
    <BarChart.Viewport>
      <BarChart.Grid />
      <BarChart.Axes />
      <BarChart.Bars />
      <BarChart.Interaction />
      <BarChart.Tooltip />
    </BarChart.Viewport>
  </BarChart.Container>
</BarChart.Root>`}
      />
    </div>
  );
};

// Pre-generated static data to avoid hydration mismatches
const normalData = [
  52.3, 48.7, 51.2, 49.8, 53.6, 47.4, 50.9, 52.1, 48.3, 51.7, 49.2, 52.8, 48.9,
  50.4, 53.2, 47.8, 51.5, 49.6, 52.6, 48.1, 50.7, 53.9, 47.2, 51.3, 49.9, 52.4,
  48.5, 50.2, 53.5, 47.6, 51.8, 49.4, 52.9, 48.8, 50.6, 53.1, 47.9, 51.4, 49.7,
  52.7, 48.2, 50.8, 53.8, 47.3, 51.1, 49.5, 52.5, 48.6, 50.3, 53.4, 47.7, 51.9,
  49.3, 52.2, 48.4, 50.5, 53.3, 47.5, 51.6, 49.8, 45.2, 54.8, 46.7, 55.3, 44.9,
  56.1, 45.8, 54.2, 46.3, 55.7, 44.5, 56.5, 45.6, 54.4, 46.1, 55.9, 44.7, 56.3,
  45.4, 54.6, 46.5, 55.1, 44.3, 56.7, 45.9, 54.1, 46.8, 55.4, 44.6, 56.4, 43.8,
  57.2, 42.9, 58.1, 43.5, 57.5, 42.6, 58.4, 43.2, 57.8, 42.3, 58.7, 43.9, 57.1,
  42.7, 58.3, 43.4, 57.6, 42.8, 58.2, 43.1, 57.9, 42.4, 58.6, 43.6, 57.4, 42.5,
  58.5, 43.3, 57.7, 41.2, 59.8, 40.5, 60.5, 41.7, 59.3, 40.8, 60.2, 41.4, 59.6,
  40.2, 60.8, 41.9, 59.1, 40.6, 60.4, 41.3, 59.7, 40.9, 60.1, 41.6, 59.4, 40.3,
  60.7, 41.8, 59.2, 40.7, 60.3, 41.1, 59.9, 38.5, 62.5, 37.8, 63.2, 38.9, 62.1,
  37.4, 63.6, 38.3, 62.7, 37.9, 63.1, 38.7, 62.3, 37.5, 63.5, 38.4, 62.6, 37.6,
  63.4, 38.8, 62.2, 37.2, 63.8, 38.6, 62.4, 37.7, 63.3, 38.2, 62.8, 35.4, 65.6,
  34.8, 66.2, 35.9, 65.1, 34.3, 66.7, 35.5, 65.5, 34.7, 66.3, 35.8, 65.2, 34.4,
  66.6, 35.6, 65.4, 34.6, 66.4, 35.7, 65.3, 34.2, 66.8, 35.3, 65.7, 34.9, 66.1,
  35.2, 65.8, 32.1, 68.9, 31.5, 69.5, 32.6, 68.4, 31.2, 69.8, 32.3, 68.7, 31.8,
  69.2, 32.5, 68.5, 31.4, 69.6, 32.4, 68.6, 31.6, 69.4, 32.7, 68.3, 31.1, 69.9,
  32.2, 68.8, 31.9, 69.1, 32.8, 68.2, 28.5, 72.5, 27.8, 73.2, 28.9, 72.1, 27.4,
  73.6, 28.3, 72.7, 27.9, 73.1, 28.7, 72.3, 27.5, 73.5, 28.4, 72.6, 27.6, 73.4,
  28.8, 72.2, 27.2, 73.8, 28.6, 72.4, 27.7, 73.3, 28.2, 72.8, 25.3, 75.7, 24.6,
  76.4, 25.8, 75.2, 24.2, 76.8, 25.4, 75.6, 24.8, 76.2, 25.7, 75.3, 24.4, 76.6,
  25.5, 75.5, 24.7, 76.3, 25.9, 75.1, 24.1, 76.9, 25.6, 75.4, 24.9, 76.1, 25.2,
  75.8, 21.8, 79.2, 20.9, 80.1, 21.5, 79.5, 20.6, 80.4, 21.2, 79.8, 20.3, 80.7,
  21.9, 79.1, 20.7, 80.3, 21.4, 79.6, 20.8, 80.2, 21.6, 79.4, 20.2, 80.8, 21.7,
  79.3, 20.5, 80.5, 21.3, 79.7, 18.4, 82.6, 17.5, 83.5, 18.9, 82.1, 17.2, 83.8,
  18.3, 82.7, 17.8, 83.2, 18.7, 82.3, 17.4, 83.6, 18.5, 82.5, 17.6, 83.4, 18.8,
  82.2, 17.1, 83.9, 18.6, 82.4, 17.7, 83.3, 18.2, 82.8, 14.9, 86.1, 13.8, 87.2,
  14.5, 86.5, 13.4, 87.6, 14.2, 86.8, 13.9, 87.1, 14.7, 86.3, 13.5, 87.5, 14.3,
  86.7, 13.7, 87.3, 14.8, 86.2, 13.2, 87.8, 14.6, 86.4, 13.6, 87.4, 14.4, 86.6,
  11.5, 89.5, 10.8, 90.2, 11.2, 89.8, 10.4, 90.6, 11.8, 89.2, 10.6, 90.4, 11.4,
  89.6, 10.9, 90.1, 11.6, 89.4, 10.5, 90.5, 11.9, 89.1, 10.3, 90.7, 11.3, 89.7,
  10.7, 90.3, 11.7, 89.3, 7.8, 93.2, 6.9, 94.1, 7.5, 93.5, 6.6, 94.4, 7.2, 93.8,
  6.3, 94.7, 7.9, 93.1, 6.7, 94.3, 7.4, 93.6, 6.8, 94.2, 7.6, 93.4, 6.2, 94.8,
  7.7, 93.3, 6.5, 94.5, 7.3, 93.7, 6.4, 94.6, 4.2, 96.8, 3.5, 97.5, 4.7, 96.3,
  3.1, 97.9, 4.4, 96.6, 3.8, 97.2, 4.6, 96.4, 3.3, 97.7, 4.5, 96.5, 3.6, 97.4,
  4.8, 96.2, 3.2, 97.8, 4.3, 96.7, 3.9, 97.1, 4.1, 96.9, 3.4, 97.6,
];

const temperatureData = [
  18.2, 19.5, 20.1, 21.3, 19.8, 20.5, 21.7, 22.3, 20.8, 21.5, 19.6, 20.9, 22.1,
  21.8, 20.4, 22.5, 23.1, 21.2, 20.7, 22.8, 19.9, 21.4, 22.6, 20.3, 21.9, 23.4,
  22.9, 21.6, 20.2, 23.2, 21.1, 22.4, 20.6, 23.5, 22.7, 21.0, 24.1, 23.8, 22.2,
  21.3, 20.5, 23.9, 24.3, 22.0, 21.7, 24.5, 23.6, 22.8, 21.4, 24.8,
];

const signalData = [
  -72.3, -68.5, -71.8, -69.2, -73.5, -67.4, -70.9, -68.8, -72.6, -69.7, -71.2,
  -68.1, -73.8, -69.5, -70.4, -67.9, -72.9, -68.3, -71.5, -69.8, -73.2, -67.6,
  -70.7, -68.9, -72.1, -69.4, -71.8, -68.2, -73.6, -69.1, -70.3, -67.8, -72.7,
  -68.6, -71.4, -69.9, -73.4, -67.5, -70.8, -68.7, -72.4, -69.3, -71.9, -68.4,
  -73.7, -69.6, -70.5, -67.7, -72.8, -68.5, -53.2, -51.8, -54.5, -52.3, -53.9,
  -51.4, -54.1, -52.7, -53.6, -51.9, -54.8, -52.1, -53.4, -51.6, -54.3, -52.5,
  -53.7, -51.3, -54.6, -52.9, -53.1, -51.7, -54.4, -52.2, -53.8, -51.5, -54.2,
  -52.6, -53.5, -51.8, -54.9, -52.4, -53.3, -51.2, -54.7, -52.8, -53.9, -51.6,
  -54.1, -52.3, -71.6, -68.9, -72.5, -69.6, -71.1, -68.4, -73.1, -69.2, -70.8,
  -68.7, -72.2, -69.5, -71.7, -68.2, -73.3, -69.8, -70.6, -67.9, -72.8, -68.6,
  -71.4, -69.3, -73.5, -67.7, -70.9, -68.8, -72.4, -69.1, -71.8, -68.3, -73.7,
  -69.7, -70.5, -67.6, -72.6, -68.9, -71.3, -69.4, -73.2, -67.8, -70.7, -68.5,
  -72.1, -69.9, -71.9, -68.1, -73.6, -69.5, -70.4, -67.5, -52.8, -51.5, -54.2,
  -52.6, -53.7, -51.9, -54.5, -52.3, -53.4, -51.7, -54.1, -52.8, -53.9, -51.4,
  -54.6, -52.1, -53.2, -51.8, -54.4, -52.5, -53.6, -51.3, -54.8, -52.7, -53.1,
  -51.6, -54.3, -52.4, -53.8, -51.2, -54.7, -52.9, -53.5, -51.5, -54.9, -52.2,
  -53.3, -51.9, -54.1, -52.6, -72.9, -69.2, -71.5, -68.7, -73.4, -69.8, -70.8,
  -68.4, -72.3, -69.5, -71.7, -68.9, -73.1, -69.3, -70.6, -68.1, -72.7, -69.6,
  -71.2, -68.5, -73.6, -69.1, -70.4, -67.9, -72.5, -69.7, -71.9, -68.3, -73.8,
  -69.4, -70.7, -67.7, -72.1, -68.8, -71.4, -69.9, -73.3, -67.6, -70.9, -68.6,
  -72.6, -69.2, -71.8, -68.2, -73.5, -69.5, -70.5, -67.8, -72.8, -68.7, -53.6,
  -51.9, -54.3, -52.5, -53.8, -51.4, -54.7, -52.8, -53.2, -51.7, -54.5, -52.3,
  -53.9, -51.6, -54.1, -52.6, -53.7, -51.3, -54.8, -52.1, -53.4, -51.8, -54.2,
  -52.7, -53.5, -51.5, -54.6, -52.4, -53.1, -51.2, -54.4, -52.9, -53.3, -51.9,
  -54.9, -52.2, -53.8, -51.6, -54.1, -52.5, -71.3, -68.8, -72.7, -69.4, -70.9,
  -68.2, -73.2, -69.7, -71.6, -68.5, -72.4, -69.1, -71.8, -68.9, -73.5, -69.5,
  -70.7, -67.9, -72.9, -68.6, -71.2, -69.8, -73.7, -67.7, -70.5, -68.7, -72.2,
  -69.3, -71.9, -68.4,
];

const velocityData = [
  235.6, 189.3, 267.8, 145.2, 298.5, 201.7, 178.9, 256.3, 134.8, 289.2, 223.4,
  167.5, 245.9, 198.6, 276.3, 156.8, 312.7, 189.4, 234.1, 267.5, 145.9, 298.2,
  212.6, 178.3, 256.8, 198.1, 289.7, 167.4, 245.2, 223.9, 298.6, 156.3, 312.4,
  189.7, 234.5, 267.1, 145.6, 276.9, 212.3, 178.6, 256.2, 198.8, 289.4, 167.9,
  245.7, 223.5, 298.1, 156.7, 312.9, 189.2, 234.8, 267.6, 145.3, 276.4, 212.9,
  178.1, 256.7, 198.4, 289.8, 167.2, 245.4, 223.8, 298.7, 156.5, 312.2, 189.9,
  234.3, 267.3, 145.8, 276.7, 212.5, 178.8, 256.4, 198.6, 289.5, 167.7, 245.9,
  223.2, 298.3, 156.9, 312.6, 189.5, 234.7, 267.9, 145.5, 276.2, 212.7, 178.4,
  256.9, 198.2, 289.1, 167.5, 245.6, 223.6, 298.8, 156.4, 312.8, 189.8, 234.2,
  267.4, 356.7, 423.5, 389.2, 412.8, 367.9, 445.3, 378.4, 401.6, 434.2, 398.7,
  356.1, 423.9, 389.6, 412.3, 367.4, 445.8, 378.9, 401.2, 434.7, 398.2, 356.5,
  423.2, 389.8, 412.6, 367.7, 445.1, 378.2, 401.8, 434.5, 398.5, 356.9, 423.6,
  389.4, 412.9, 367.2, 445.5, 378.7, 401.4, 434.1, 398.9, 356.3, 423.8, 389.1,
  412.5, 367.6, 445.9, 378.5, 401.9, 434.8, 398.4, 467.2, 489.7, 456.8, 478.3,
  501.6, 445.9, 489.4, 467.8, 478.6, 501.2, 456.3, 489.9, 467.5, 478.8, 501.8,
  445.6, 489.2, 467.9, 478.4, 501.5, 456.7, 489.5, 467.3, 478.2, 501.4, 445.8,
  489.8, 467.6, 478.9, 501.9, 456.2, 489.3, 467.8, 478.5, 501.3, 445.5, 489.6,
  467.4, 478.7, 501.7, 456.5, 489.1, 467.2, 478.3, 501.1, 445.9, 489.9, 467.9,
  478.6, 501.6, 123.4, 98.7, 156.2, 87.5, 167.8, 112.9, 145.3, 98.1, 134.6,
  178.2, 123.8, 98.3, 156.7, 87.9, 167.3, 112.5, 145.8, 98.6, 134.2, 178.7,
  123.2, 98.9, 156.4, 87.3, 167.6, 112.7, 145.5, 98.4, 134.8, 178.4, 123.6,
  98.5, 156.9, 87.7, 167.1, 112.3, 145.2, 98.8, 134.4, 178.9, 123.9, 98.2,
  156.3, 87.6, 167.8, 112.8, 145.7, 98.2, 134.9, 178.3, 289.5, 312.8, 267.3,
  334.6, 256.9, 301.2, 278.4, 323.7, 289.8, 312.4, 267.6, 334.2, 256.5, 301.7,
  278.9, 323.3, 289.2, 312.9, 267.9, 334.8, 256.3, 301.4, 278.6, 323.5, 289.7,
  312.5, 267.4, 334.4, 256.8, 301.9, 278.2, 323.9, 289.4, 312.7, 267.7, 334.1,
  256.6, 301.5, 278.8, 323.6, 412.3, 434.8, 389.6, 456.2, 401.7, 423.5, 445.9,
  378.4, 412.8, 434.3, 389.2, 456.7, 401.3, 423.9, 445.5, 378.9, 412.5, 434.6,
  389.8, 456.4, 401.9, 423.2, 445.7, 378.6, 412.7, 434.9, 389.4, 456.1, 401.5,
  423.7, 445.3, 378.8, 412.2, 434.5, 389.9, 456.8, 401.8, 423.4, 445.8, 378.2,
  534.6, 567.3, 512.8, 589.5, 498.2, 556.7, 523.9, 578.4, 534.2, 567.8, 512.4,
  589.1, 498.7, 556.3, 523.5, 578.9, 534.8, 567.5, 512.9, 589.7, 498.4, 556.9,
  523.2, 578.6, 534.5, 567.2, 512.6, 589.3, 498.9, 556.5, 523.7, 578.2, 534.3,
  567.9, 512.3, 589.8, 498.5, 556.8, 523.4, 578.5, 178.9, 201.5, 156.3, 223.7,
  189.4, 212.8, 167.6, 234.2, 178.5, 201.9, 156.8, 223.3, 189.9, 212.4, 167.2,
  234.7, 178.3, 201.6, 156.5, 223.9, 189.7, 212.9, 167.8, 234.4, 178.7, 201.3,
  156.9, 223.5, 189.2, 212.6, 167.4, 234.8, 178.8, 201.8, 156.4, 223.2, 189.5,
  212.3, 167.9, 234.6, 298.4, 323.7, 278.9, 345.2, 289.6, 312.5, 301.8, 334.9,
  298.2, 323.4, 278.5, 345.7, 289.3, 312.9, 301.4, 334.5, 298.7, 323.8, 278.7,
  345.3, 289.8, 312.6, 301.9, 334.2, 298.5, 323.5, 278.4, 345.9, 289.5, 312.3,
  301.6, 334.7, 298.3, 323.9, 278.8, 345.5, 289.7, 312.8, 301.5, 334.4, 445.3,
  467.8, 423.5, 489.2, 434.9, 456.6, 478.4, 412.7, 445.7, 467.4, 423.9, 489.7,
  434.5, 456.2, 478.9, 412.3, 445.4, 467.9, 423.6, 489.3, 434.8, 456.7, 478.5,
  412.8, 445.9, 467.5, 423.2, 489.8, 434.4, 456.3, 478.6, 412.5, 445.5, 467.2,
  423.8, 489.5, 434.7, 456.9, 478.3, 412.9, 556.8, 578.4, 534.6, 601.3, 545.9,
  567.2, 589.7, 523.5, 556.4, 578.9, 534.2, 601.8, 545.5, 567.7, 589.3, 523.9,
  556.9, 578.5, 534.7, 601.4, 545.8, 567.3, 589.8, 523.6, 556.5, 578.2, 534.3,
  601.9, 545.4, 567.8, 589.5, 523.2, 556.7, 578.7, 534.8, 601.5, 545.9, 567.4,
  589.2, 523.8, 689.5, 712.3, 667.8, 734.6, 678.9, 701.5, 723.8, 656.4, 689.2,
  712.8, 667.4, 734.2, 678.5, 701.9, 723.4, 656.9, 689.7, 712.5, 667.9, 734.7,
  678.8, 701.6, 723.9, 656.5, 689.4, 712.2, 667.5, 734.3, 678.4, 701.3, 723.5,
  656.8, 689.8, 712.7, 667.2, 734.8, 678.9, 701.8, 723.2, 656.3, 234.7, 256.3,
  212.8, 278.9, 223.5, 245.6, 267.4, 201.9, 234.3, 256.8, 212.4, 278.5, 223.9,
  245.2, 267.9, 201.5, 234.8, 256.4, 212.9, 278.3, 223.6, 245.7, 267.5, 201.8,
  234.5, 256.9, 212.5, 278.7, 223.3, 245.4, 267.8, 201.6, 234.9, 256.5, 212.3,
  278.9, 223.8, 245.9, 267.3, 201.2, 389.4, 412.7, 367.8, 434.9, 378.5, 401.6,
  423.3, 356.9, 389.8, 412.3, 367.4, 434.5, 378.9, 401.2, 423.8, 356.5, 389.5,
  412.8, 367.9, 434.2, 378.6, 401.7, 423.4, 356.8, 389.9, 412.4, 367.5, 434.7,
  378.3, 401.9, 423.9, 356.4, 389.6, 412.9, 367.3, 434.8, 378.8, 401.5, 423.5,
  356.9, 512.8, 534.5, 489.7, 556.3, 501.9, 523.6, 545.8, 478.4, 512.4, 534.9,
  489.3, 556.8, 501.5, 523.2, 545.4, 478.9, 512.9, 534.6, 489.8, 556.4, 501.8,
  523.7, 545.9, 478.5, 512.5, 534.3, 489.4, 556.9, 501.4, 523.9, 545.5, 478.2,
  512.7, 534.8, 489.9, 556.5, 501.9, 523.5, 545.7, 478.7, 645.3, 667.9, 623.5,
  689.6, 634.7, 656.8, 678.4, 612.9, 645.8, 667.5, 623.9, 689.2, 634.3, 656.4,
  678.9, 612.5, 645.4, 667.8, 623.6, 689.7, 634.8, 656.9, 678.5, 612.8, 645.9,
  667.4, 623.2, 689.3, 634.4, 656.5, 678.8, 612.4, 645.5, 667.9, 623.8, 689.8,
  634.9, 656.3, 678.3, 612.9, 778.9, 801.4, 756.8, 823.6, 767.5, 789.9, 812.3,
  745.7, 778.5, 801.9, 756.4, 823.2, 767.9, 789.5, 812.8, 745.3, 778.3, 801.5,
  756.9, 823.7, 767.6, 789.8, 812.4, 745.8, 778.8, 801.2, 756.5, 823.3, 767.2,
  789.6, 812.9, 745.4, 778.4, 801.7, 756.3, 823.8, 767.8, 789.3, 812.5, 745.9,
];

const HistogramExamples = () => {
  const { color } = useColorScheme();

  return (
    <div className="space-y-12">
      {/* Basic Histogram */}
      <ComponentPreview
        title="Basic Distribution"
        description="Simple histogram showing a normal distribution with automatic binning. The data follows a bell curve centered around 50 with standard deviation of 15."
        preview={
          <div className="w-full">
            <Histogram.Root
              data={normalData}
              bins={{ count: 20 }}
              xAxis={{ label: "Value" }}
              yAxis={{ label: "Frequency" }}
              color={color}
              animate={false}
            >
              <Histogram.Container>
                <Histogram.Viewport>
                  <Histogram.Grid />
                  <Histogram.Axes />
                  <Histogram.Bars />
                  <Histogram.Tooltip />
                </Histogram.Viewport>
              </Histogram.Container>
            </Histogram.Root>
          </div>
        }
        code={`<Histogram.Root
  data={normalData}
  bins={{ count: 20 }}
  xAxis={{ label: "Value" }}
  yAxis={{ label: "Frequency" }}
  color="#06b6d4"
>
  <Histogram.Container>
    <Histogram.Viewport>
      <Histogram.Grid />
      <Histogram.Axes />
      <Histogram.Bars />
      <Histogram.Tooltip />
    </Histogram.Viewport>
  </Histogram.Container>
</Histogram.Root>`}
      />

      {/* Histogram with Statistics */}
      <ComponentPreview
        title="With Statistical Overlays"
        description="Temperature measurements with mean and median lines. Useful for quickly identifying central tendency and distribution shape in experimental data."
        preview={
          <div className="w-full">
            <Histogram.Root
              data={temperatureData}
              bins={{ count: 12 }}
              xAxis={{ label: "Temperature (°C)" }}
              yAxis={{ label: "Count" }}
              color={color}
              showMean={true}
              showMedian={true}
              animate={false}
            >
              <Histogram.Container>
                <Histogram.Viewport>
                  <Histogram.Grid />
                  <Histogram.Axes />
                  <Histogram.Bars />
                  <Histogram.Statistics />
                  <Histogram.Tooltip />
                </Histogram.Viewport>
              </Histogram.Container>
            </Histogram.Root>
          </div>
        }
        code={`<Histogram.Root
  data={temperatureData}
  bins={{ count: 12 }}
  xAxis={{ label: "Temperature (°C)" }}
  yAxis={{ label: "Count" }}
  color="#06b6d4"
  showMean={true}
  showMedian={true}
>
  <Histogram.Container>
    <Histogram.Viewport>
      <Histogram.Grid />
      <Histogram.Axes />
      <Histogram.Bars />
      <Histogram.Statistics />
      <Histogram.Tooltip />
    </Histogram.Viewport>
  </Histogram.Container>
</Histogram.Root>`}
      />

      {/* Density Mode */}
      <ComponentPreview
        title="Density Mode"
        description="Normalized density histogram showing probability distribution. The y-axis represents probability density rather than raw counts, useful for comparing distributions of different sample sizes."
        preview={
          <div className="w-full">
            <Histogram.Root
              data={normalData}
              bins={{ count: 25 }}
              xAxis={{ label: "Value" }}
              yAxis={{ label: "Density" }}
              color={color}
              mode="density"
              showMean={true}
              animate={false}
            >
              <Histogram.Container>
                <Histogram.Viewport>
                  <Histogram.Grid />
                  <Histogram.Axes />
                  <Histogram.Bars />
                  <Histogram.Statistics />
                  <Histogram.Tooltip />
                </Histogram.Viewport>
              </Histogram.Container>
            </Histogram.Root>
          </div>
        }
        code={`<Histogram.Root
  data={normalData}
  bins={{ count: 25 }}
  xAxis={{ label: "Value" }}
  yAxis={{ label: "Density" }}
  color="#06b6d4"
  mode="density"
  showMean={true}
>
  <Histogram.Container>
    <Histogram.Viewport>
      <Histogram.Grid />
      <Histogram.Axes />
      <Histogram.Bars />
      <Histogram.Statistics />
      <Histogram.Tooltip />
    </Histogram.Viewport>
  </Histogram.Container>
</Histogram.Root>`}
      />

      {/* Bimodal Distribution */}
      <ComponentPreview
        title="Bimodal Distribution"
        description="Satellite signal strength showing two distinct operating modes. The bimodal distribution reveals two separate satellite systems with different signal characteristics."
        preview={
          <div className="w-full">
            <Histogram.Root
              data={signalData}
              bins={{ count: 30 }}
              xAxis={{ label: "Signal Strength (dBm)" }}
              yAxis={{ label: "Count" }}
              color={color}
              showMean={true}
              showMedian={true}
              barGap={0.05}
              animate={false}
            >
              <Histogram.Container>
                <Histogram.Viewport>
                  <Histogram.Grid />
                  <Histogram.Axes />
                  <Histogram.Bars />
                  <Histogram.Statistics />
                  <Histogram.Tooltip />
                </Histogram.Viewport>
              </Histogram.Container>
            </Histogram.Root>
          </div>
        }
        code={`<Histogram.Root
  data={signalData}
  bins={{ count: 30 }}
  xAxis={{ label: "Signal Strength (dBm)" }}
  yAxis={{ label: "Count" }}
  color="#06b6d4"
  showMean={true}
  showMedian={true}
  barGap={0.05}
>
  <Histogram.Container>
    <Histogram.Viewport>
      <Histogram.Grid />
      <Histogram.Axes />
      <Histogram.Bars />
      <Histogram.Statistics />
      <Histogram.Tooltip />
    </Histogram.Viewport>
  </Histogram.Container>
</Histogram.Root>`}
      />

      {/* Physical Distribution */}
      <ComponentPreview
        title="Particle Velocity Distribution"
        description="Maxwell-Boltzmann velocity distribution for gas particles. This right-skewed distribution is characteristic of kinetic theory and shows the probability distribution of particle speeds in an ideal gas."
        preview={
          <div className="w-full">
            <Histogram.Root
              data={velocityData}
              bins={{ count: 40 }}
              xAxis={{ label: "Velocity (m/s)" }}
              yAxis={{ label: "Frequency" }}
              color={color}
              mode="count"
              showMean={true}
              barOpacity={0.9}
              animate={false}
            >
              <Histogram.Container>
                <Histogram.Viewport>
                  <Histogram.Grid />
                  <Histogram.Axes />
                  <Histogram.Bars />
                  <Histogram.Statistics />
                  <Histogram.Tooltip />
                </Histogram.Viewport>
              </Histogram.Container>
            </Histogram.Root>
          </div>
        }
        code={`<Histogram.Root
  data={velocityData}
  bins={{ count: 40 }}
  xAxis={{ label: "Velocity (m/s)" }}
  yAxis={{ label: "Frequency" }}
  color="#06b6d4"
  mode="count"
  showMean={true}
  barOpacity={0.9}
>
  <Histogram.Container>
    <Histogram.Viewport>
      <Histogram.Grid />
      <Histogram.Axes />
      <Histogram.Bars />
      <Histogram.Statistics />
      <Histogram.Tooltip />
    </Histogram.Viewport>
  </Histogram.Container>
</Histogram.Root>`}
      />
    </div>
  );
};

const BoxPlotExamples = () => {
  const { color } = useColorScheme();

  return (
    <div className="space-y-12">
      {/* Basic Box Plot */}
      <ComponentPreview
        title="Basic Box Plot"
        description="Statistical distribution visualization showing quartiles, median, and outliers across multiple categories. Each box represents the interquartile range (IQR) with whiskers extending to 1.5×IQR."
        preview={
          <div className="w-full">
            <BoxPlot.Root
              data={[
                {
                  name: "Sample A",
                  values: normalData.slice(0, 30),
                  color: color,
                },
                { name: "Sample B", values: temperatureData, color: "#8b5cf6" },
                {
                  name: "Sample C",
                  values: normalData.slice(30, 60),
                  color: "#f59e0b",
                },
              ]}
              yAxis={{ label: "Value" }}
              animate={false}
            >
              <BoxPlot.Container>
                <BoxPlot.Viewport>
                  <BoxPlot.Grid />
                  <BoxPlot.Axes />
                  <BoxPlot.Boxes />
                  <BoxPlot.Tooltip />
                </BoxPlot.Viewport>
              </BoxPlot.Container>
            </BoxPlot.Root>
          </div>
        }
        code={`<BoxPlot.Root
  data={[
    { name: "Sample A", values: sampleA, color: "#06b6d4" },
    { name: "Sample B", values: sampleB, color: "#8b5cf6" },
    { name: "Sample C", values: sampleC, color: "#f59e0b" },
  ]}
  yAxis={{ label: "Value" }}
>
  <BoxPlot.Container>
    <BoxPlot.Viewport>
      <BoxPlot.Grid />
      <BoxPlot.Axes />
      <BoxPlot.Boxes />
      <BoxPlot.Tooltip />
    </BoxPlot.Viewport>
  </BoxPlot.Container>
</BoxPlot.Root>`}
      />

      {/* Horizontal Box Plot */}
      <ComponentPreview
        title="Horizontal Orientation"
        description="Box plots displayed horizontally for easier label reading and compact vertical space. Ideal for comparing many categories or when category names are long."
        preview={
          <div className="w-full">
            <BoxPlot.Root
              data={[
                {
                  name: "Control Group",
                  values: normalData.slice(0, 25),
                  color: color,
                },
                {
                  name: "Treatment A",
                  values: temperatureData.slice(0, 25),
                  color: "#8b5cf6",
                },
                {
                  name: "Treatment B",
                  values: normalData.slice(25, 50),
                  color: "#f59e0b",
                },
                {
                  name: "Treatment C",
                  values: temperatureData.slice(25),
                  color: "#ef4444",
                },
              ]}
              orientation="horizontal"
              xAxis={{ label: "Measurement" }}
              showMean={true}
              animate={false}
            >
              <BoxPlot.Container>
                <BoxPlot.Viewport>
                  <BoxPlot.Grid />
                  <BoxPlot.Axes />
                  <BoxPlot.Boxes />
                  <BoxPlot.Tooltip />
                </BoxPlot.Viewport>
              </BoxPlot.Container>
            </BoxPlot.Root>
          </div>
        }
        code={`<BoxPlot.Root
  data={[
    { name: "Control Group", values: control, color: "#06b6d4" },
    { name: "Treatment A", values: treatmentA, color: "#8b5cf6" },
    { name: "Treatment B", values: treatmentB, color: "#f59e0b" },
    { name: "Treatment C", values: treatmentC, color: "#ef4444" },
  ]}
  orientation="horizontal"
  xAxis={{ label: "Measurement" }}
  showMean={true}
>
  <BoxPlot.Container>
    <BoxPlot.Viewport>
      <BoxPlot.Grid />
      <BoxPlot.Axes />
      <BoxPlot.Boxes />
      <BoxPlot.Tooltip />
    </BoxPlot.Viewport>
  </BoxPlot.Container>
</BoxPlot.Root>`}
      />
    </div>
  );
};

const ViolinPlotExamples = () => {
  const { color } = useColorScheme();

  return (
    <div className="space-y-12">
      {/* Basic Violin Plot */}
      <ComponentPreview
        title="Basic Violin Plot"
        description="Probability density visualization using kernel density estimation. The width at each value represents the probability density, providing more information about the distribution shape than traditional box plots."
        preview={
          <div className="w-full">
            <ViolinPlot.Root
              data={[
                {
                  name: "Dataset A",
                  values: normalData.slice(0, 30),
                  color: color,
                },
                {
                  name: "Dataset B",
                  values: temperatureData,
                  color: "#8b5cf6",
                },
                {
                  name: "Dataset C",
                  values: normalData.slice(30, 60),
                  color: "#f59e0b",
                },
              ]}
              yAxis={{ label: "Value" }}
              animate={false}
            >
              <ViolinPlot.Container>
                <ViolinPlot.Viewport>
                  <ViolinPlot.Grid />
                  <ViolinPlot.Axes />
                  <ViolinPlot.Violins />
                  <ViolinPlot.Tooltip />
                </ViolinPlot.Viewport>
              </ViolinPlot.Container>
            </ViolinPlot.Root>
          </div>
        }
        code={`<ViolinPlot.Root
  data={[
    { name: "Dataset A", values: dataA, color: "#06b6d4" },
    { name: "Dataset B", values: dataB, color: "#8b5cf6" },
    { name: "Dataset C", values: dataC, color: "#f59e0b" },
  ]}
  yAxis={{ label: "Value" }}
>
  <ViolinPlot.Container>
    <ViolinPlot.Viewport>
      <ViolinPlot.Grid />
      <ViolinPlot.Axes />
      <ViolinPlot.Violins />
      <ViolinPlot.Tooltip />
    </ViolinPlot.Viewport>
  </ViolinPlot.Container>
</ViolinPlot.Root>`}
      />

      <ComponentPreview
        title="Horizontal Orientation"
        description="Violin plots displayed horizontally with inner box plots showing quartiles. The combination provides both detailed distribution shape and traditional statistical summaries."
        preview={
          <div className="w-full">
            <ViolinPlot.Root
              data={[
                {
                  name: "Baseline",
                  values: normalData.slice(0, 30),
                  color: color,
                },
                {
                  name: "Week 1",
                  values: temperatureData.slice(0, 20),
                  color: "#8b5cf6",
                },
                {
                  name: "Week 2",
                  values: normalData.slice(30, 60),
                  color: "#f59e0b",
                },
                {
                  name: "Week 4",
                  values: temperatureData.slice(20),
                  color: "#ef4444",
                },
              ]}
              orientation="horizontal"
              xAxis={{ label: "Performance Score" }}
              showBox={true}
              showMean={true}
              animate={false}
            >
              <ViolinPlot.Container>
                <ViolinPlot.Viewport>
                  <ViolinPlot.Grid />
                  <ViolinPlot.Axes />
                  <ViolinPlot.Violins />
                  <ViolinPlot.Tooltip />
                </ViolinPlot.Viewport>
              </ViolinPlot.Container>
            </ViolinPlot.Root>
          </div>
        }
        code={`<ViolinPlot.Root
  data={[
    { name: "Baseline", values: baseline, color: "#06b6d4" },
    { name: "Week 1", values: week1, color: "#8b5cf6" },
    { name: "Week 2", values: week2, color: "#f59e0b" },
    { name: "Week 4", values: week4, color: "#ef4444" },
  ]}
  orientation="horizontal"
  xAxis={{ label: "Performance Score" }}
  showBox={true}
  showMean={true}
>
  <ViolinPlot.Container>
    <ViolinPlot.Viewport>
      <ViolinPlot.Grid />
      <ViolinPlot.Axes />
      <ViolinPlot.Violins />
      <ViolinPlot.Tooltip />
    </ViolinPlot.Viewport>
  </ViolinPlot.Container>
</ViolinPlot.Root>`}
      />
    </div>
  );
};

const SpectrogramExamples = () => {
  const { color } = useColorScheme();
  const spectrogramData = useMemo(() => {
    const random = seededRandom(42);
    const points: SpectrogramDataPoint[] = [];

    for (let t = 0; t < 100; t++) {
      for (let f = 0; f < 128; f++) {
        const freq = f * 40; // 0 to 5120 Hz
        const time = t * 0.05; // 0 to 5 seconds

        // Create a chirp signal (frequency increases over time)
        const chirpFreq = 300 + time * 800; // 300Hz to 4300Hz
        const chirpMag = Math.exp(-Math.pow((freq - chirpFreq) / 150, 2)) * 80;

        // Add harmonics
        const harmonic1 = Math.exp(-Math.pow((freq - 1200) / 200, 2)) * 40;
        const harmonic2 = Math.exp(-Math.pow((freq - 2400) / 180, 2)) * 25;

        // Background noise
        const noise = random() * 2;

        // Time-varying amplitude modulation
        const envelope = 0.5 + 0.5 * Math.sin(time * 2 * Math.PI * 0.5);

        const magnitude = (chirpMag + harmonic1 + harmonic2) * envelope + noise;

        points.push({ time, frequency: freq, magnitude });
      }
    }

    return points;
  }, []);

  return (
    <div className="space-y-12">
      <ComponentPreview
        title="Chirp Signal Spectrogram"
        description="Time-frequency representation showing a chirp signal (frequency sweep from 300Hz to 4300Hz) with harmonics at 1200Hz and 2400Hz. The color intensity represents signal magnitude with amplitude modulation creating the pulsing pattern."
        preview={
          <div className="w-full">
            <Spectrogram.Root
              data={spectrogramData}
              timeAxis={{ label: "Time (s)" }}
              frequencyAxis={{ label: "Frequency (Hz)" }}
              colorScale="inferno"
              magnitudeScale="linear"
              height={450}
            >
              <Spectrogram.Container>
                <Spectrogram.Viewport>
                  <Spectrogram.Heatmap />
                  <Spectrogram.Axes />
                  <Spectrogram.ColorBar />
                  <Spectrogram.Tooltip />
                </Spectrogram.Viewport>
              </Spectrogram.Container>
            </Spectrogram.Root>
          </div>
        }
        code={`<Spectrogram.Root
  data={spectrogramData}
  timeAxis={{ label: "Time (s)" }}
  frequencyAxis={{ label: "Frequency (Hz)" }}
  colorScale="inferno"
  magnitudeScale="linear"
>
  <Spectrogram.Container>
    <Spectrogram.Viewport>
      <Spectrogram.Heatmap />
      <Spectrogram.Axes />
      <Spectrogram.ColorBar />
      <Spectrogram.Tooltip />
    </Spectrogram.Viewport>
  </Spectrogram.Container>
</Spectrogram.Root>`}
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
            <Earth
              dayMapUrl="/day.jpg"
              enableRotation={false}
              brightness={1.2}
              radius={10}
            >
              <Earth.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Earth.Controls
                  minDistance={12}
                  maxDistance={100}
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
  radius={10}
>
  <Earth.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Earth.Controls minDistance={12} maxDistance={100} />
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
              radius={10}
            >
              <Mars.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Mars.Controls minDistance={12} maxDistance={100} />
                <Mars.Globe />
              </Mars.Canvas>
            </Mars>
          </div>
        }
        code={`<Mars
  textureUrl="/flat-mars.jpg"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Mars.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Mars.Controls minDistance={12} maxDistance={100} />
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
              radius={10}
            >
              <Mercury.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Mercury.Controls minDistance={12} maxDistance={100} />
                <Mercury.Globe />
              </Mercury.Canvas>
            </Mercury>
          </div>
        }
        code={`<Mercury
  textureUrl="/flat-mercury.png"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Mercury.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Mercury.Controls minDistance={12} maxDistance={100} />
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
              radius={10}
            >
              <Venus.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Venus.Controls minDistance={12} maxDistance={100} />
                <Venus.Globe />
              </Venus.Canvas>
            </Venus>
          </div>
        }
        code={`<Venus
  textureUrl="/flat-venus.jpg"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Venus.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Venus.Controls minDistance={12} maxDistance={100} />
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
              radius={10}
            >
              <Moon.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Moon.Controls minDistance={12} maxDistance={100} />
                <Moon.Globe />
              </Moon.Canvas>
            </Moon>
          </div>
        }
        code={`<Moon
  textureUrl="/moon.jpg"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Moon.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Moon.Controls minDistance={12} maxDistance={100} />
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
              radius={10}
            >
              <Jupiter.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Jupiter.Controls minDistance={12} maxDistance={100} />
                <Jupiter.Globe />
              </Jupiter.Canvas>
            </Jupiter>
          </div>
        }
        code={`<Jupiter
  textureUrl="/flat-jupiter.jpg"
  enableRotation={false}
  brightness={1.1}
  radius={10}
>
  <Jupiter.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Jupiter.Controls minDistance={12} maxDistance={100} />
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
              radius={10}
            >
              <Saturn.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Saturn.Controls minDistance={12} maxDistance={100} />
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
  radius={10}
>
  <Saturn.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Saturn.Controls minDistance={12} maxDistance={100} />
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
              radius={10}
            >
              <Uranus.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Uranus.Controls minDistance={12} maxDistance={100} />
                <Uranus.Globe />
              </Uranus.Canvas>
            </Uranus>
          </div>
        }
        code={`<Uranus
  textureUrl="/flat-uranus.jpg"
  enableRotation={false}
  brightness={1.2}
  radius={10}
>
  <Uranus.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Uranus.Controls minDistance={12} maxDistance={100} />
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
              radius={10}
            >
              <Neptune.Canvas height="600px" cameraPosition={[0, 10, 30]}>
                <Neptune.Controls minDistance={12} maxDistance={100} />
                <Neptune.Globe />
              </Neptune.Canvas>
            </Neptune>
          </div>
        }
        code={`<Neptune
  textureUrl="/flat-neptune.jpg"
  enableRotation={false}
  brightness={1.3}
  radius={10}
>
  <Neptune.Canvas height="600px" cameraPosition={[0, 10, 30]}>
    <Neptune.Controls minDistance={12} maxDistance={100} />
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
  "polar-plot": PolarPlotExamples,
  heatmap: HeatmapExamples,
  "gantt-chart": GanttChartExamples,
  "scatter-plot": ScatterPlotExamples,
  "bar-chart": BarChartExamples,
  histogram: HistogramExamples,
  "box-plot": BoxPlotExamples,
  "violin-plot": ViolinPlotExamples,
  spectrogram: SpectrogramExamples,
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
              {componentId === "histogram" && (
                <>
                  <tr>
                    <td className="p-3 font-mono text-xs">data</td>
                    <td className="p-3 font-mono text-xs">number[]</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      required
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Raw data values to bin and visualize
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">bins</td>
                    <td className="p-3 font-mono text-xs">BinConfig</td>
                    <td className="p-3 font-mono text-xs">{"{ count: 10 }"}</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Bin configuration: count (default 10), width, or explicit
                      edges
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">xAxis</td>
                    <td className="p-3 font-mono text-xs">HistogramAxis</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      auto
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      X-axis (value axis) configuration with domain, label,
                      formatter
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">yAxis</td>
                    <td className="p-3 font-mono text-xs">HistogramAxis</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      auto
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Y-axis (frequency/density axis) configuration
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">mode</td>
                    <td className="p-3 font-mono text-xs">
                      "count" | "density"
                    </td>
                    <td className="p-3 font-mono text-xs">"count"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Display mode: raw counts or normalized density
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">variant</td>
                    <td className="p-3 font-mono text-xs">HistogramVariant</td>
                    <td className="p-3 font-mono text-xs">"default"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Visual style: "default", "minimal", "scientific",
                      "dashboard"
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">color</td>
                    <td className="p-3 font-mono text-xs">string</td>
                    <td className="p-3 font-mono text-xs">"#06b6d4"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Bar fill color in any CSS color format
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">barOpacity</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">0.8</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Bar opacity (0.0-1.0)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">barGap</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">0.1</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Gap between bars as fraction of bar width (0.0-0.5)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showStats</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Display statistical overlays (mean, median, std dev)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showMean</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Display vertical line at mean value
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showMedian</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Display vertical line at median value
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">animate</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Enable entrance animations for bars and grid
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
                </>
              )}
              {componentId === "polar-plot" && (
                <>
                  <tr>
                    <td className="p-3 font-mono text-xs">series</td>
                    <td className="p-3 font-mono text-xs">PolarSeries[]</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      required
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Array of data series with theta, r coordinates
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">axis</td>
                    <td className="p-3 font-mono text-xs">PolarAxis</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">-</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Radial domain, rings, angle labels configuration
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">width</td>
                    <td className="p-3 font-mono text-xs">number</td>
                    <td className="p-3 font-mono text-xs">600</td>
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
                    <td className="p-3 font-mono text-xs">showGrid</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Show concentric circles and radial lines
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">showLegend</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">true</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Show series legend
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
                    <td className="p-3 font-mono text-xs">variant</td>
                    <td className="p-3 font-mono text-xs">
                      "polar" | "radar" | "rose"
                    </td>
                    <td className="p-3 font-mono text-xs">"polar"</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Plot type: standard polar, radar chart, or rose diagram
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
                    <td className="p-3 font-mono text-xs">toggleableSeries</td>
                    <td className="p-3 font-mono text-xs">boolean</td>
                    <td className="p-3 font-mono text-xs">false</td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      Allow series visibility toggle via legend
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
