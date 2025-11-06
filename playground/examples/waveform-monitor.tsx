"use client";

/**
 * Waveform Monitor - Interactive Example
 *
 * This example demonstrates real-time waveform visualization
 * with multiple traces, similar to medical monitors or telemetry displays.
 */

import * as React from "react";
import { WaveformMonitor, type WaveformTrace } from "@plexusui/components/waveform-monitor";

// ============================================================================
// Simulated Data Generators
// ============================================================================

/**
 * Generate realistic ECG waveform
 * Simulates a heartbeat pattern with P, QRS, and T waves
 */
const generateECGPoint = (t: number, hr: number = 75): number => {
  const period = 60 / hr; // seconds per beat
  const phase = (t % period) / period; // 0-1 position in beat cycle

  // QRS complex (main spike)
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

  // Baseline with slight noise
  return 0.05 + (Math.random() - 0.5) * 0.02;
};

/**
 * Generate realistic SpO2 (blood oxygen) waveform
 * Simulates pulse oximetry with arterial pulsation
 */
const generateSpO2Point = (t: number, hr: number = 75): number => {
  const period = 60 / hr;
  const phase = (t % period) / period;

  // Arterial pulse wave
  const pulse = Math.sin(phase * Math.PI * 2) * 0.3 + 0.7;
  const noise = (Math.random() - 0.5) * 0.03;

  return pulse + noise;
};

/**
 * Generate realistic blood pressure waveform
 * Simulates arterial pressure with systolic and diastolic phases
 */
const generateBPPoint = (t: number, hr: number = 75): number => {
  const period = 60 / hr;
  const phase = (t % period) / period;

  // Systolic upstroke
  if (phase < 0.3) {
    return 0.3 + phase * 2;
  }

  // Dicrotic notch and diastolic decay
  const decay = Math.exp(-((phase - 0.3) * 5));
  const dicrotic = phase > 0.35 && phase < 0.45 ? -0.05 : 0;

  return 0.9 * decay + 0.3 + dicrotic;
};

/**
 * Generate sensor telemetry data (e.g., vibration, temperature)
 * Simulates noisy sensor readings with slow drift
 */
const generateSensorPoint = (
  t: number,
  frequency: number = 2.0,
  amplitude: number = 0.5
): number => {
  const signal = Math.sin(t * frequency * Math.PI * 2) * amplitude;
  const noise = (Math.random() - 0.5) * 0.1;
  const drift = Math.sin(t * 0.1) * 0.2;

  return signal + noise + drift + 0.5;
};

// ============================================================================
// Example Component
// ============================================================================

export const WaveformMonitorExample: React.FC = () => {
  const [traces, setTraces] = React.useState<WaveformTrace[]>([
    { id: "ecg", data: [], label: "ECG" },
    { id: "spo2", data: [], label: "SpO2" },
    { id: "bp", data: [], label: "BP" },
  ]);

  const [isStreaming, setIsStreaming] = React.useState(true);
  const [streamSpeed, setStreamSpeed] = React.useState(1.0);
  const [maxPointsPerTrace, setMaxPointsPerTrace] = React.useState(2000);
  const [showGrid, setShowGrid] = React.useState(true);
  const [showMetrics, setShowMetrics] = React.useState(true);

  const timeRef = React.useRef(0);
  const animationRef = React.useRef<number | undefined>(undefined);

  // Stream data at ~60fps
  React.useEffect(() => {
    if (!isStreaming) return;

    const dt = 0.016 * streamSpeed; // ~16ms per frame, adjustable by speed

    const stream = () => {
      timeRef.current += dt;
      const t = timeRef.current;

      setTraces((prevTraces) =>
        prevTraces.map((trace) => {
          let newPoint: [number, number];

          // Generate appropriate data for each trace
          switch (trace.id) {
            case "ecg":
              newPoint = [t, generateECGPoint(t, 75)];
              break;
            case "spo2":
              newPoint = [t, generateSpO2Point(t, 75)];
              break;
            case "bp":
              newPoint = [t, generateBPPoint(t, 75)];
              break;
            default:
              newPoint = [t, generateSensorPoint(t)];
          }

          // Maintain circular buffer
          const newData = [...trace.data, newPoint];
          if (newData.length > maxPointsPerTrace) {
            newData.shift();
          }

          return {
            ...trace,
            data: newData,
          };
        })
      );

      animationRef.current = requestAnimationFrame(stream);
    };

    animationRef.current = requestAnimationFrame(stream);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isStreaming, streamSpeed, maxPointsPerTrace]);

  const handleClear = () => {
    setTraces((prev) => prev.map((trace) => ({ ...trace, data: [] })));
    timeRef.current = 0;
  };

  const handleAddTrace = () => {
    const newId = `sensor-${Date.now()}`;
    setTraces((prev) => [
      ...prev,
      { id: newId, data: [], label: `Sensor ${prev.length + 1}` },
    ]);
  };

  const handleRemoveTrace = () => {
    if (traces.length > 1) {
      setTraces((prev) => prev.slice(0, -1));
    }
  };

  const totalPoints = traces.reduce((sum, trace) => sum + trace.data.length, 0);

  return (
    <div className="space-y-6">
      {/* Example 1: Medical Vitals Monitor */}
      <section>
        <h3 className="text-xl font-semibold mb-4">
          Medical Vitals Monitor
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Real-time multi-parameter vital signs display. Simulates ECG, SpO2 (pulse oximetry),
          and arterial blood pressure waveforms streaming at 60fps. Each trace renders independently
          with WebGPU acceleration.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <WaveformMonitor
            width={800}
            height={400}
            traces={traces}
            showGrid={showGrid}
            showMetrics={showMetrics}
            maxPoints={10000}
            enableDecimation={true}
            backgroundColor={[0.05, 0.05, 0.08, 1.0]}
            gridColor={[0.2, 0.25, 0.2, 0.4]}
          />
        </div>

        {/* Controls */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              {isStreaming ? "Pause" : "Resume"}
            </button>

            <button
              onClick={handleClear}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md text-sm font-medium transition-colors"
            >
              Clear
            </button>

            <button
              onClick={handleAddTrace}
              disabled={traces.length >= 8}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Trace
            </button>

            <button
              onClick={handleRemoveTrace}
              disabled={traces.length <= 1}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove Trace
            </button>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showGrid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showGrid" className="text-sm text-zinc-300">
                Show Grid
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showMetrics"
                checked={showMetrics}
                onChange={(e) => setShowMetrics(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="showMetrics" className="text-sm text-zinc-300">
                Show Metrics
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-300">
              Stream Speed: {streamSpeed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={streamSpeed}
              onChange={(e) => setStreamSpeed(parseFloat(e.target.value))}
              className="w-full max-w-md"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-zinc-300">
              Max Points Per Trace: {maxPointsPerTrace.toLocaleString()}
            </label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={maxPointsPerTrace}
              onChange={(e) => setMaxPointsPerTrace(parseInt(e.target.value))}
              className="w-full max-w-md"
            />
          </div>

          <div className="text-sm text-zinc-400 font-mono">
            Total points rendering: {totalPoints.toLocaleString()} | Traces: {traces.length}
          </div>
        </div>
      </section>

      {/* Example 2: Static Waveform Display */}
      <section>
        <h3 className="text-xl font-semibold mb-4">
          Static Waveform Analysis
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Display pre-recorded or computed waveforms for analysis. This example shows
          mathematical functions, but could represent historical telemetry, test data,
          or signal processing results.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <WaveformMonitor
            width={800}
            height={300}
            traces={[
              {
                id: "sine",
                data: Array.from({ length: 1000 }, (_, i) => {
                  const x = (i / 1000) * 10;
                  return [x, Math.sin(x * 2) * 0.5 + 0.5] as [number, number];
                }),
                label: "Sine Wave",
              },
              {
                id: "square",
                data: Array.from({ length: 1000 }, (_, i) => {
                  const x = (i / 1000) * 10;
                  return [x, (Math.sin(x * 2) > 0 ? 0.8 : 0.2)] as [number, number];
                }),
                label: "Square Wave",
              },
              {
                id: "sawtooth",
                data: Array.from({ length: 1000 }, (_, i) => {
                  const x = (i / 1000) * 10;
                  return [x, ((x % 1) * 0.6) + 0.2] as [number, number];
                }),
                label: "Sawtooth",
              },
            ]}
            showGrid={true}
            showMetrics={true}
            backgroundColor={[0.02, 0.05, 0.08, 1.0]}
            gridColor={[0.15, 0.2, 0.25, 0.5]}
            xDomain={[0, 10]}
            yDomain={[0, 1]}
          />
        </div>
      </section>

      {/* Performance Notes */}
      <section className="border-l-4 border-emerald-500 pl-4">
        <h3 className="text-lg font-semibold mb-2">Performance Notes</h3>
        <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
          <p>
            ✓ <strong>WebGPU acceleration:</strong> All rendering happens on the GPU with zero main thread overhead
          </p>
          <p>
            ✓ <strong>Real-time streaming:</strong> Handles 60+ updates per second with sub-millisecond latency
          </p>
          <p>
            ✓ <strong>Scalable:</strong> Up to 10,000 points per trace, 8+ traces simultaneously
          </p>
          <p>
            ✓ <strong>GPU decimation:</strong> Automatically enabled for datasets exceeding maxPoints threshold
          </p>
          <p>
            ✓ <strong>Memory efficient:</strong> Circular buffers prevent memory growth during streaming
          </p>
        </div>
      </section>

      {/* Code Example */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Usage</h3>
        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-xs overflow-x-auto">
          <code className="text-emerald-400">{`import { WaveformMonitor } from "@/components/waveform-monitor";

const traces = [
  {
    id: "ecg",
    data: [[0, 0.1], [0.1, 0.8], [0.2, 0.2], ...],
    label: "ECG",
  },
  {
    id: "spo2",
    data: [[0, 0.7], [0.1, 0.75], [0.2, 0.72], ...],
    label: "SpO2",
  },
];

<WaveformMonitor
  width={800}
  height={400}
  traces={traces}
  showGrid={true}
  showMetrics={true}
  maxPoints={10000}
  enableDecimation={true}
/>`}</code>
        </pre>
      </section>
    </div>
  );
};
