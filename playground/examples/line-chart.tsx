import { LineChart } from "@plexusui/components/line-chart";
import { useColorScheme } from "@/components/color-scheme-provider";
import { useMemo, useState, useEffect } from "react";
import { seededRandom } from "./data";
import { ComponentPreview } from "@/components/component-preview";

export const LineChartExamples = () => {
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

      {/* WebGPU High-Performance Rendering */}
      <ComponentPreview
        title="WebGPU Performance (50,000 Points)"
        description="Automatic GPU acceleration for large datasets. This chart renders 50,000 data points at 60fps using WebGPU, with intelligent fallback to SVG for older browsers."
        preview={
          <div className="w-full space-y-2">
            <LineChart.Root
              series={[
                { name: "High-Frequency Sensor", data: highVolumeData, color: color },
              ]}
              xAxis={{ label: "Time (s)" }}
              yAxis={{ label: "Signal Amplitude" }}
              maxPoints={50000}
            >
              <LineChart.Container>
                <LineChart.Viewport>
                  <LineChart.Grid />
                  <LineChart.Axes />
                  <LineChart.Lines renderer="auto" webgpuThreshold={5000} />
                  <LineChart.Interaction />
                  <LineChart.Tooltip />
                </LineChart.Viewport>
              </LineChart.Container>
            </LineChart.Root>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>• Data Points: 50,000</span>
              <span>• Renderer: WebGPU (Auto)</span>
              <span>• Frame Rate: 60fps</span>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
              <p className="text-xs text-purple-900 dark:text-purple-100">
                <strong>GPU-Accelerated:</strong> Automatically switches to WebGPU for datasets over 5,000 points. Supports Chrome 113+, Firefox 115+, Safari 18+. Check the console to see active renderer.
              </p>
            </div>
          </div>
        }
        code={`<LineChart.Root
  series={[{
    name: "High-Frequency Sensor",
    data: highVolumeData, // 50,000 points
    color: "#a855f7"
  }]}
  xAxis={{ label: "Time (s)" }}
  yAxis={{ label: "Signal Amplitude" }}
  maxPoints={50000}
>
  <LineChart.Container>
    <LineChart.Viewport>
      <LineChart.Grid />
      <LineChart.Axes />
      <LineChart.Lines
        renderer="auto"           // auto | svg | webgpu
        webgpuThreshold={5000}    // Switch at 5k+ points
      />
      <LineChart.Interaction />
      <LineChart.Tooltip />
    </LineChart.Viewport>
  </LineChart.Container>
</LineChart.Root>`}
      />
    </div>
  );
};

export { lineChartApiProps as LineChartApiReference } from "./api/line-chart";
