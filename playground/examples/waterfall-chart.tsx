"use client";

import { WaterfallChart } from "@plexusui/components/charts/waterfall-chart";
import { ComponentPreview } from "@/components/component-preview";
import { useState, useEffect } from "react";

// ============================================================================
// Helper: Generate test signals
// ============================================================================

// Generate multi-frequency sine wave (simulating RF signal)
function generateRFSignal(
  samples: number,
  sampleRate: number,
  frequencies: number[]
): number[] {
  const signal = new Array(samples).fill(0);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;

    for (const freq of frequencies) {
      // Add frequency component with some phase variation
      signal[i] +=
        Math.sin(2 * Math.PI * freq * t + Math.random() * 0.1) / frequencies.length;
    }

    // Add noise
    signal[i] += (Math.random() - 0.5) * 0.1;
  }

  return signal;
}

// Generate chirp signal (frequency sweep)
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

// Generate EEG-like signal with multiple brain wave bands
function generateEEGSignal(samples: number, sampleRate: number): number[] {
  const signal = new Array(samples).fill(0);

  // Brain wave bands
  const bands = [
    { name: "Delta", freqRange: [0.5, 4], amplitude: 0.3 },
    { name: "Theta", freqRange: [4, 8], amplitude: 0.25 },
    { name: "Alpha", freqRange: [8, 13], amplitude: 0.4 }, // Dominant
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
        band.amplitude * Math.sin(2 * Math.PI * freq * t + Math.random() * Math.PI);
    }

    // Add noise (artifacts)
    signal[i] += (Math.random() - 0.5) * 0.05;
  }

  return signal;
}

// Generate industrial vibration signal
function generateVibrationSignal(samples: number, sampleRate: number): number[] {
  const signal = new Array(samples).fill(0);

  // Normal operation frequencies (motor harmonics)
  const normalFreqs = [50, 100, 150]; // 50 Hz motor + harmonics

  // Bearing fault frequencies (appear intermittently)
  const faultFreqs = [237, 312]; // BPFO, BPFI

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;

    // Normal operation
    for (const freq of normalFreqs) {
      signal[i] += 0.3 * Math.sin(2 * Math.PI * freq * t);
    }

    // Fault frequencies appear with modulation
    const faultIntensity = 0.5 + 0.5 * Math.sin(2 * Math.PI * 2 * t); // 2 Hz modulation
    for (const freq of faultFreqs) {
      signal[i] += 0.1 * faultIntensity * Math.sin(2 * Math.PI * freq * t);
    }

    // Broadband noise
    signal[i] += (Math.random() - 0.5) * 0.1;
  }

  return signal;
}

// ============================================================================
// Example Components
// ============================================================================

function RFSpectrumAnalyzer() {
  const sampleRate = 2000; // 2 kHz
  const duration = 5; // 5 seconds
  const samples = sampleRate * duration;

  // Multi-frequency RF signal (simulating multiple transmitters)
  const signal = generateRFSignal(samples, sampleRate, [150, 250, 400, 650, 850]);

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
              Sample Rate: {sampleRate} Hz | FFT Size: 256 | Duration: {duration}s
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

  // Generate chirp (frequency sweep) - classic audio test
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
      description="Predictive maintenance - detecting bearing faults via frequency analysis"
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
  const sampleRate = 1000; // 1 kHz
  const [signal, setSignal] = useState<number[]>(() => {
    // Initialize with 5 seconds of data
    return generateRFSignal(5000, sampleRate, [100, 250, 400]);
  });
  const [isPaused, setIsPaused] = useState(false);

  // Stream new data every 100ms
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSignal((prev) => {
        // Add 100 new samples (0.1 second worth)
        const newSamples = 100;
        const newData = generateRFSignal(newSamples, sampleRate, [
          100 + Math.random() * 50,
          250 + Math.random() * 50,
          400 + Math.random() * 50,
        ]);

        // Keep only the last 10 seconds (10000 samples)
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

// ============================================================================
// Main Export
// ============================================================================

export function WaterfallChartExamples() {
  return (
    <div className="space-y-8">
      <RFSpectrumAnalyzer />
      <EEGMonitor />
      <AudioSpectrogram />
      <VibrationAnalysis />
      <StreamingWaterfall />
      <PrimitiveWaterfallChart />
    </div>
  );
}
