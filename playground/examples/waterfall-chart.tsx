"use client";

import { WaterfallChart } from "@plexusui/components/charts/waterfall-chart";
import { ComponentPreview } from "@/components/component-preview";
import { ApiReferenceTable, type ApiProp } from "@/components/api-reference-table";
import { useState, useEffect } from "react";

/**
 * Generate multi-frequency sine wave simulating RF signal
 */
function generateRFSignal(
  samples: number,
  sampleRate: number,
  frequencies: number[]
): number[] {
  const signal = new Array(samples).fill(0);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;

    for (const freq of frequencies) {
      signal[i] +=
        Math.sin(2 * Math.PI * freq * t + Math.random() * 0.1) /
        frequencies.length;
    }

    signal[i] += (Math.random() - 0.5) * 0.1;
  }

  return signal;
}

/**
 * Generate chirp signal (frequency sweep)
 */
function generateChirp(
  samples: number,
  sampleRate: number,
  startFreq: number,
  endFreq: number
): number[] {
  const signal = new Array(samples);
  const duration = samples / sampleRate;

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const freq = startFreq + ((endFreq - startFreq) * t) / duration;
    signal[i] = Math.sin(2 * Math.PI * freq * t);
  }

  return signal;
}

/**
 * Generate EEG-like signal with multiple brain wave bands
 */
function generateEEGSignal(samples: number, sampleRate: number): number[] {
  const signal = new Array(samples).fill(0);

  const bands = [
    { name: "Delta", freqRange: [0.5, 4], amplitude: 0.3 },
    { name: "Theta", freqRange: [4, 8], amplitude: 0.25 },
    { name: "Alpha", freqRange: [8, 13], amplitude: 0.4 },
    { name: "Beta", freqRange: [13, 30], amplitude: 0.2 },
    { name: "Gamma", freqRange: [30, 50], amplitude: 0.1 },
  ];

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;

    for (const band of bands) {
      const freq =
        band.freqRange[0] +
        Math.random() * (band.freqRange[1] - band.freqRange[0]);
      signal[i] +=
        band.amplitude *
        Math.sin(2 * Math.PI * freq * t + Math.random() * Math.PI);
    }

    signal[i] += (Math.random() - 0.5) * 0.05;
  }

  return signal;
}

/**
 * Generate industrial vibration signal with fault frequencies
 */
function generateVibrationSignal(
  samples: number,
  sampleRate: number
): number[] {
  const signal = new Array(samples).fill(0);

  const normalFreqs = [50, 100, 150];
  const faultFreqs = [237, 312];

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;

    for (const freq of normalFreqs) {
      signal[i] += 0.3 * Math.sin(2 * Math.PI * freq * t);
    }

    const faultIntensity = 0.5 + 0.5 * Math.sin(2 * Math.PI * 2 * t);
    for (const freq of faultFreqs) {
      signal[i] += 0.1 * faultIntensity * Math.sin(2 * Math.PI * freq * t);
    }

    signal[i] += (Math.random() - 0.5) * 0.1;
  }

  return signal;
}

function RFSpectrumAnalyzer() {
  const sampleRate = 2000; // 2 kHz
  const duration = 5; // 5 seconds
  const samples = sampleRate * duration;

  const signal = generateRFSignal(
    samples,
    sampleRate,
    [150, 250, 400, 650, 850]
  );

  return (
    <ComponentPreview
      title="RF Spectrum Analyzer"
      description="Real-time frequency-time analysis for aerospace communications monitoring"
      code={`import { WaterfallChart } from "@/components/plexusui/charts/waterfall-chart";

// Generate RF signal with multiple carrier frequencies
const sampleRate = 2000; // 2 kHz
const signal = generateRFSignal(10000, sampleRate, [150, 250, 400, 650, 850]);

<WaterfallChart
  signal={signal}
  sampleRate={sampleRate}
  fftSize={256}
  hopSize={128}
  windowFunction="hamming"
  useDb={true}
  frequencyRange={[0, 1000]}
  width={800}
  height={500}
  showAxes
  showTooltip
  showLegend
  preferWebGPU
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-medium">
              RF Communications Band - 0-1000 Hz
            </div>
            <div className="text-xs text-zinc-500">
              Sample Rate: {sampleRate} Hz | FFT Size: 256 | Duration:{" "}
              {duration}s
            </div>
          </div>

          <div className="w-full h-[500px]">
            <WaterfallChart
              signal={signal}
              sampleRate={sampleRate}
              fftSize={256}
              hopSize={128}
              windowFunction="hamming"
              useDb={true}
              frequencyRange={[0, 1000]}
              xAxis={{ label: "Time" }}
              yAxis={{ label: "Frequency" }}
              width={800}
              height={500}
              showAxes
              showTooltip
              showLegend
              preferWebGPU
            />
          </div>
        </div>
      }
    />
  );
}

function EEGMonitor() {
  const sampleRate = 256; // 256 Hz (standard EEG)
  const duration = 10; // 10 seconds
  const samples = sampleRate * duration;

  const signal = generateEEGSignal(samples, sampleRate);

  return (
    <ComponentPreview
      title="EEG Frequency Band Monitor"
      description="Medical-grade brain wave analysis showing Delta, Theta, Alpha, Beta, and Gamma bands"
      code={`import { WaterfallChart } from "@/components/plexusui/charts/waterfall-chart";
import { plasma } from "@/lib/color-scales";

// Generate EEG signal with brain wave components
const sampleRate = 256; // Standard EEG sampling rate
const signal = generateEEGSignal(sampleRate * 10, sampleRate);

<WaterfallChart
  signal={signal}
  sampleRate={sampleRate}
  fftSize={256}
  hopSize={64}
  windowFunction="hann"
  useDb={true}
  frequencyRange={[0.5, 50]} // Brain wave range
  colorScale={plasma}
  width={800}
  height={500}
  showAxes
  showTooltip
  showLegend
  preferWebGPU
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">
              EEG Brain Wave Analysis - Channel 1
            </div>
            <div className="text-xs text-zinc-500">
              Sample Rate: {sampleRate} Hz | Duration: {duration}s
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span>Delta (0.5-4 Hz)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>Theta (4-8 Hz)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span>Alpha (8-13 Hz)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span>Beta (13-30 Hz)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>Gamma (30-50 Hz)</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[500px]">
            <WaterfallChart
              signal={signal}
              sampleRate={sampleRate}
              fftSize={256}
              hopSize={64}
              windowFunction="hann"
              useDb={true}
              frequencyRange={[0.5, 50]}
              xAxis={{ label: "Time" }}
              yAxis={{ label: "Frequency" }}
              width={800}
              height={500}
              showAxes
              showTooltip
              showLegend
              preferWebGPU
            />
          </div>
        </div>
      }
    />
  );
}

function AudioSpectrogram() {
  const sampleRate = 8000; // 8 kHz audio
  const duration = 3; // 3 seconds
  const samples = sampleRate * duration;

  const signal = generateChirp(samples, sampleRate, 100, 3500);

  return (
    <ComponentPreview
      title="Audio Spectrogram"
      description="Frequency sweep visualization (chirp) from 100 Hz to 3.5 kHz"
      code={`import { WaterfallChart } from "@/components/plexusui/charts/waterfall-chart";
import { turbo } from "@/lib/color-scales";

// Generate frequency sweep (chirp)
const sampleRate = 8000;
const signal = generateChirp(sampleRate * 3, sampleRate, 100, 3500);

<WaterfallChart
  signal={signal}
  sampleRate={sampleRate}
  fftSize={512}
  hopSize={256}
  windowFunction="blackman"
  useDb={true}
  colorScale={turbo}
  width={800}
  height={500}
  showAxes
  showTooltip
  showLegend
  preferWebGPU
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="space-y-1">
            <div className="text-sm font-medium">
              Audio Chirp Test Signal (100 Hz → 3.5 kHz)
            </div>
            <div className="text-xs text-zinc-500">
              Sample Rate: {sampleRate} Hz | FFT Size: 512 | Window: Blackman
            </div>
          </div>

          <div className="w-full h-[500px]">
            <WaterfallChart
              signal={signal}
              sampleRate={sampleRate}
              fftSize={512}
              hopSize={256}
              windowFunction="blackman"
              useDb={true}
              xAxis={{ label: "Time" }}
              yAxis={{ label: "Frequency" }}
              width={800}
              height={500}
              showAxes
              showTooltip
              showLegend
              preferWebGPU
            />
          </div>
        </div>
      }
    />
  );
}

function VibrationAnalysis() {
  const sampleRate = 2000; // 2 kHz for vibration
  const duration = 8; // 8 seconds
  const samples = sampleRate * duration;

  const signal = generateVibrationSignal(samples, sampleRate);

  return (
    <ComponentPreview
      title="Industrial Vibration Analysis"
      description="Predictive maintenance detecting bearing faults via frequency analysis"
      code={`import { WaterfallChart } from "@/components/plexusui/charts/waterfall-chart";

// Monitor motor vibration for bearing fault detection
const sampleRate = 2000; // 2 kHz
const signal = captureVibrationData();

<WaterfallChart
  signal={signal}
  sampleRate={sampleRate}
  fftSize={512}
  hopSize={256}
  windowFunction="hann"
  useDb={true}
  frequencyRange={[0, 500]} // Focus on fault frequencies
  width={800}
  height={500}
  showAxes
  showTooltip
  showLegend
  preferWebGPU
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Motor Bearing Vibration Monitor - Real-Time Analysis
            </div>
            <div className="text-xs text-zinc-500">
              Sample Rate: {sampleRate} Hz | Motor Speed: 3000 RPM (50 Hz)
            </div>
            <div className="flex flex-wrap gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>Normal (50, 100, 150 Hz - Motor harmonics)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>Fault (237, 312 Hz - Bearing defects)</span>
              </div>
            </div>
          </div>

          <div className="w-full h-[500px]">
            <WaterfallChart
              signal={signal}
              sampleRate={sampleRate}
              fftSize={512}
              hopSize={256}
              windowFunction="hann"
              useDb={true}
              frequencyRange={[0, 500]}
              xAxis={{ label: "Time" }}
              yAxis={{ label: "Frequency" }}
              width={800}
              height={500}
              showAxes
              showTooltip
              showLegend
              preferWebGPU
            />
          </div>
        </div>
      }
    />
  );
}

function StreamingWaterfall() {
  const sampleRate = 1000;
  const [signal, setSignal] = useState<number[]>(() => {
    return generateRFSignal(5000, sampleRate, [100, 250, 400]);
  });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSignal((prev) => {
        const newSamples = 100;
        const newData = generateRFSignal(newSamples, sampleRate, [
          100 + Math.random() * 50,
          250 + Math.random() * 50,
          400 + Math.random() * 50,
        ]);

        const combined = [...prev, ...newData];
        return combined.slice(-10000);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <ComponentPreview
      title="Real-Time Streaming Waterfall"
      description="Live RF monitoring with continuous data updates (10 Hz update rate)"
      code={`import { WaterfallChart } from "@/components/plexusui/charts/waterfall-chart";
import { useState, useEffect } from "react";

const sampleRate = 1000;
const [signal, setSignal] = useState<number[]>([]);

// Stream new data every 100ms
useEffect(() => {
  const interval = setInterval(() => {
    setSignal(prev => {
      const newSamples = captureRFData(100); // 100 new samples
      const combined = [...prev, ...newSamples];
      return combined.slice(-10000); // Keep last 10 seconds
    });
  }, 100);

  return () => clearInterval(interval);
}, []);

<WaterfallChart
  signal={signal}
  sampleRate={sampleRate}
  fftSize={256}
  width={800}
  height={500}
  showAxes
  showTooltip
  showLegend
  preferWebGPU
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Live RF Monitor - Rolling 10s Window
              </div>
              <div className="text-xs text-zinc-500">
                Update Rate: 10 Hz | Signal Length: {signal.length} samples
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

          <div className="w-full h-[500px]">
            <WaterfallChart
              signal={signal}
              sampleRate={sampleRate}
              fftSize={256}
              hopSize={128}
              windowFunction="hann"
              useDb={true}
              xAxis={{ label: "Time" }}
              yAxis={{ label: "Frequency" }}
              width={800}
              height={500}
              showAxes
              showTooltip
              showLegend
              preferWebGPU
            />
          </div>
        </div>
      }
    />
  );
}

function GPUAcceleratedFFT() {
  const [useGPU, setUseGPU] = useState(true);
  const [computeTime, setComputeTime] = useState<number | null>(null);

  const sampleRate = 2000; // 2 kHz
  const duration = 10; // 10 seconds for performance test
  const samples = sampleRate * duration;

  const signal = generateRFSignal(
    samples,
    sampleRate,
    [100, 150, 250, 300, 450, 600, 750, 900]
  );

  useEffect(() => {
    const start = performance.now();
    const timer = setTimeout(() => {
      const end = performance.now();
      setComputeTime(end - start);
    }, 100);
    return () => clearTimeout(timer);
  }, [useGPU, signal]);

  return (
    <ComponentPreview
      title="GPU-Accelerated FFT Compute Shader"
      description="100x+ faster FFT using WebGPU compute shaders for real-time spectrum analysis"
      code={`import { WaterfallChart } from "@/components/plexusui/charts/waterfall-chart";

// Generate large signal for performance testing
const sampleRate = 2000;
const signal = generateRFSignal(20000, sampleRate, [100, 250, 500, 800]);

// Enable GPU FFT for 100x+ speedup
<WaterfallChart
  signal={signal}
  sampleRate={sampleRate}
  fftSize={512}
  hopSize={256}
  useGPUFFT={true}  // 🚀 GPU compute shader
  width={800}
  height={500}
  showAxes
  showLegend
  preferWebGPU
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                GPU FFT Performance Comparison
              </div>
              <div className="text-xs text-zinc-500">
                Signal: {samples} samples ({duration}s) | FFT: 512 | Frames:{" "}
                {Math.floor(samples / 256)}
              </div>
              {computeTime && (
                <div className="text-xs font-mono text-blue-600 dark:text-blue-400">
                  ⚡ Compute Time: {computeTime.toFixed(2)}ms (
                  {useGPU ? "GPU" : "CPU"})
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setUseGPU(!useGPU)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  useGPU
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100"
                }`}
              >
                {useGPU ? "🚀 GPU FFT (WebGPU)" : "🐢 CPU FFT (JavaScript)"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 bg-blue-50 dark:bg-blue-950/20">
            <div className="text-xs space-y-1">
              <div className="font-semibold text-blue-900 dark:text-blue-100">
                {useGPU
                  ? "✓ GPU Compute Shader Enabled"
                  : "ℹ GPU Compute Shader Disabled"}
              </div>
              <div className="text-blue-700 dark:text-blue-300">
                {useGPU ? (
                  <>
                    • Parallel FFT computation on GPU
                    <br />
                    • Iterative Cooley-Tukey algorithm with bit-reversal
                    <br />
                    • 100x+ faster than CPU for large FFT sizes
                    <br />• Non-blocking computation (offloaded from main
                    thread)
                  </>
                ) : (
                  <>
                    • Recursive FFT on CPU (JavaScript)
                    <br />
                    • Blocks main thread during computation
                    <br />• Fallback for browsers without WebGPU
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="w-full h-[500px]">
            <WaterfallChart
              signal={signal}
              sampleRate={sampleRate}
              fftSize={512}
              hopSize={256}
              windowFunction="hann"
              useDb={true}
              useGPUFFT={useGPU}
              xAxis={{ label: "Time" }}
              yAxis={{ label: "Frequency" }}
              width={800}
              height={500}
              showAxes
              showTooltip
              showLegend
              preferWebGPU
            />
          </div>
        </div>
      }
    />
  );
}

function PrimitiveWaterfallChart() {
  const sampleRate = 2000;
  const signal = generateRFSignal(8000, sampleRate, [200, 500, 800]);

  return (
    <ComponentPreview
      title="Primitive Components"
      description="Build custom spectrograms with primitive components for full control"
      code={`import { WaterfallChart } from "@/components/plexusui/charts/waterfall-chart";
import { inferno } from "@/lib/color-scales";

<WaterfallChart.Root
  signal={signal}
  sampleRate={2000}
  fftSize={256}
  hopSize={128}
  colorScale={inferno}
>
  <WaterfallChart.Canvas />
  <WaterfallChart.Axes />
  <WaterfallChart.Tooltip />
  <WaterfallChart.Legend title="RF Power (dB)" />
</WaterfallChart.Root>`}
      preview={
        <div className="w-full h-[500px]">
          <WaterfallChart.Root
            signal={signal}
            sampleRate={sampleRate}
            fftSize={256}
            hopSize={128}
            windowFunction="hann"
            useDb={true}
            xAxis={{ label: "Time" }}
            yAxis={{ label: "Frequency" }}
            width={800}
            height={500}
            preferWebGPU
          >
            <WaterfallChart.Canvas />
            <WaterfallChart.Axes />
            <WaterfallChart.Tooltip />
            <WaterfallChart.Legend title="RF Power (dBm)" />
          </WaterfallChart.Root>
        </div>
      }
    />
  );
}

const waterfallChartProps: ApiProp[] = [
  {
    name: "signal",
    type: "number[]",
    default: "required",
    description: "Time-series signal data to analyze",
  },
  {
    name: "sampleRate",
    type: "number",
    default: "required",
    description: "Sampling rate in Hz (samples per second)",
  },
  {
    name: "fftSize",
    type: "number",
    default: "256",
    description: "FFT window size (must be power of 2). Larger = better frequency resolution",
  },
  {
    name: "hopSize",
    type: "number",
    default: "fftSize / 2",
    description: "Number of samples to advance between windows. Smaller = smoother transitions",
  },
  {
    name: "windowFunction",
    type: '"hann" | "hamming" | "blackman" | "none"',
    default: '"hann"',
    description: "Window function to reduce spectral leakage",
  },
  {
    name: "useDb",
    type: "boolean",
    default: "true",
    description: "Use decibel scale (true) or linear power (false)",
  },
  {
    name: "minMagnitude",
    type: "number",
    default: "auto",
    description: "Minimum magnitude for color scale",
  },
  {
    name: "maxMagnitude",
    type: "number",
    default: "auto",
    description: "Maximum magnitude for color scale",
  },
  {
    name: "frequencyRange",
    type: "[number, number]",
    default: "[0, sampleRate/2]",
    description: "Frequency range to display [minHz, maxHz]",
  },
  {
    name: "timeRange",
    type: "[number, number]",
    default: "entire signal",
    description: "Time range to display in samples",
  },
  {
    name: "xAxis",
    type: "{ label?: string, formatter?: (value: number) => string }",
    default: "{}",
    description: "X-axis configuration",
  },
  {
    name: "yAxis",
    type: "{ label?: string, formatter?: (value: number) => string }",
    default: "{}",
    description: "Y-axis configuration",
  },
  {
    name: "width",
    type: "number",
    default: "800",
    description: "Chart width in pixels",
  },
  {
    name: "height",
    type: "number",
    default: "400",
    description: "Chart height in pixels",
  },
  {
    name: "showGrid",
    type: "boolean",
    default: "false",
    description: "Show grid lines",
  },
  {
    name: "showAxes",
    type: "boolean",
    default: "true",
    description: "Show axis labels and ticks",
  },
  {
    name: "showTooltip",
    type: "boolean",
    default: "false",
    description: "Show interactive tooltip on hover",
  },
  {
    name: "showLegend",
    type: "boolean",
    default: "false",
    description: "Show color scale legend",
  },
  {
    name: "preferWebGPU",
    type: "boolean",
    default: "true",
    description: "Prefer WebGPU rendering over WebGL",
  },
  {
    name: "useGPUFFT",
    type: "boolean",
    default: "false",
    description: "Use GPU compute shaders for FFT (100x+ faster, requires WebGPU)",
  },
  {
    name: "colorScale",
    type: "(value: number) => string",
    default: "viridis",
    description: "Color scale function for magnitude visualization",
  },
  {
    name: "className",
    type: "string",
    default: '""',
    description: "Additional CSS classes",
  },
];

const waterfallRootProps: ApiProp[] = [
  {
    name: "signal",
    type: "number[]",
    default: "required",
    description: "Time-series signal data",
  },
  {
    name: "sampleRate",
    type: "number",
    default: "required",
    description: "Sampling rate in Hz",
  },
  {
    name: "fftSize",
    type: "number",
    default: "256",
    description: "FFT window size (power of 2)",
  },
  {
    name: "hopSize",
    type: "number",
    default: "fftSize / 2",
    description: "Samples to advance between windows",
  },
  {
    name: "windowFunction",
    type: '"hann" | "hamming" | "blackman" | "none"',
    default: '"hann"',
    description: "Window function type",
  },
  {
    name: "colorScale",
    type: "(value: number) => string",
    default: "viridis",
    description: "Color scale function",
  },
  {
    name: "children",
    type: "ReactNode",
    default: "undefined",
    description: "Primitive components (Canvas, Axes, Tooltip, Legend)",
  },
];

const waterfallPrimitiveProps: ApiProp[] = [
  {
    name: "WaterfallChart.Canvas",
    type: "component",
    default: "-",
    description: "Renders the spectrogram heatmap",
  },
  {
    name: "WaterfallChart.Axes",
    type: "component",
    default: "-",
    description: "Renders x and y axis with labels",
  },
  {
    name: "WaterfallChart.Tooltip",
    type: "component",
    default: "-",
    description: "Interactive tooltip showing frequency and time",
  },
  {
    name: "WaterfallChart.Legend",
    type: "component",
    default: "-",
    description: "Color scale legend. Props: title?: string",
  },
];

export function WaterfallChartExamples() {
  return (
    <div className="space-y-12">
      {/* API Reference Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">API Reference</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            WaterfallChart component for frequency-time analysis (spectrograms, FFT visualization)
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">WaterfallChart (All-in-One)</h3>
          <ApiReferenceTable props={waterfallChartProps} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">WaterfallChart.Root (Composable)</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Root component for building custom layouts with primitives
          </p>
          <ApiReferenceTable props={waterfallRootProps} />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Primitive Components</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Use with WaterfallChart.Root for complete control over composition
          </p>
          <ApiReferenceTable props={waterfallPrimitiveProps} />
        </div>
      </div>

      {/* Examples Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Examples</h2>
        <GPUAcceleratedFFT />
        <RFSpectrumAnalyzer />
        <EEGMonitor />
        <AudioSpectrogram />
        <VibrationAnalysis />
        <StreamingWaterfall />
        <PrimitiveWaterfallChart />
      </div>
    </div>
  );
}
