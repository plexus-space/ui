"use client";

import { useEffect, useRef, useState } from "react";
import {
  WaveformMonitor,
  type WaveformTrace,
} from "@plexusui/components/charts/waveform-monitor";
import ChartContainer from "@plexusui/components/primitives/chart-container";
import { ChartGrid } from "@plexusui/components/primitives/chart-grid";
import { ChartAxes } from "@plexusui/components/primitives/chart-axes";
import { ComponentPreview } from "@/components/component-preview";
import { ApiReferenceTable } from "@/components/api-reference-table";
import { waveformMonitorApiProps } from "./api/waveform-monitor";

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

// Example code string for the code tab
const BASIC_EXAMPLE_CODE = `import { WaveformMonitor } from "@/components/waveform-monitor";

function VitalSignsMonitor() {
  const [traces, setTraces] = useState([
    { id: "ecg", data: [], color: [0.2, 0.8, 0.3] },
    { id: "spo2", data: [], color: [0.3, 0.6, 1.0] },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = Date.now() / 1000;
      setTraces(prev => prev.map(trace => ({
        ...trace,
        data: [...trace.data, [t, Math.random()]].slice(-2000)
      })));
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <WaveformMonitor.Root width={800} height={400} traces={traces}>
      <WaveformMonitor.Container className="border rounded-lg">
        <WaveformMonitor.Canvas />
        <WaveformMonitor.Traces />
        <WaveformMonitor.Metrics />
      </WaveformMonitor.Container>
    </WaveformMonitor.Root>
  );
}`;

export const WaveformMonitorExamples: React.FC = () => {
  const [traces, setTraces] = useState<WaveformTrace[]>([
    { id: "ecg", data: [], label: "ECG" },
    { id: "spo2", data: [], label: "SpO2" },
    { id: "bp", data: [], label: "BP" },
  ]);

  const streamSpeedRef = useRef(1.0);
  const maxPointsRef = useRef(2000);
  const timeRef = useRef(0);
  const animationRef = useRef<number | undefined>(undefined);
  const streamSpeed = 1.0;
  const maxPointsPerTrace = 2000;

  useEffect(() => {
    streamSpeedRef.current = streamSpeed;
  }, [streamSpeed]);

  useEffect(() => {
    maxPointsRef.current = maxPointsPerTrace;
  }, [maxPointsPerTrace]);

  useEffect(() => {
    const stream = () => {
      const dt = 0.016 * streamSpeedRef.current;
      timeRef.current += dt;
      const t = timeRef.current;

      setTraces((prevTraces) =>
        prevTraces.map((trace) => {
          let newPoint: [number, number];

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
          const maxPoints = maxPointsRef.current;
          if (newData.length > maxPoints) {
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
  }, []);

  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="space-y-8">
      <ComponentPreview
        title="Real-Time Medical Vitals"
        description="Multi-parameter vital signs display streaming at 60fps. Composable primitive - add your own overlays and features."
        code={BASIC_EXAMPLE_CODE}
        preview={
          <div className="w-full">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
              <div className="relative">
                <WaveformMonitor.Root
                  width={800}
                  height={400}
                  traces={traces}
                  backgroundColor={[0.05, 0.05, 0.08, 1.0]}
                >
                  <WaveformMonitor.Container>
                    <WaveformMonitor.Canvas />
                    <WaveformMonitor.Traces />
                    <WaveformMonitor.Metrics />
                  </WaveformMonitor.Container>
                </WaveformMonitor.Root>
              </div>
            </div>
          </div>
        }
      />

      <ComponentPreview
        title="With Grid & Axes"
        description="Add grid lines and axes for better data readability. ChartContainer provides layout context while WaveformMonitor manages rendering."
        preview={
          <ChartContainer
            width={800}
            height={400}
            showControls
            isPaused={isPaused}
            onPauseChange={setIsPaused}
            className="border border-zinc-200 dark:border-zinc-800 rounded-lg"
          >
            <div
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              <WaveformMonitor.Root
                width={800}
                height={400}
                traces={traces}
                backgroundColor={[0.05, 0.05, 0.08, 1.0]}
                margin={{ top: 40, right: 40, bottom: 60, left: 70 }}
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
            </div>
          </ChartContainer>
        }
        code={`import ChartContainer from "@plexusui/components/primitives/chart-container";
import { ChartGrid } from "@plexusui/components/primitives/chart-grid";
import { ChartAxes } from "@plexusui/components/primitives/chart-axes";

// ChartContainer provides layout context (dimensions, zoom, pan, controls)
// WaveformMonitor owns the canvas and manages WebGPU rendering
<ChartContainer showControls>
  <WaveformMonitor.Root width={800} height={400} traces={traces}>
    <WaveformMonitor.Container>
      <WaveformMonitor.Canvas />
      <ChartGrid horizontalLines={5} verticalLines={10} showMajorLines />
      <WaveformMonitor.Traces />
      <ChartAxes xLabel="Time (s)" yLabel="Amplitude" />
    </WaveformMonitor.Container>
  </WaveformMonitor.Root>
  <ChartContainer.Controls />
</ChartContainer>`}
      />

      <div className="space-y-3">
        <h3 className="text-xl font-semibold">API Reference</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          WaveformMonitor is a primitive component. Compose with ChartContainer,
          ChartGrid, ChartAxes or build your own overlays.
        </p>
        <ApiReferenceTable props={waveformMonitorApiProps} />
      </div>
    </div>
  );
};
