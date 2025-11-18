"use client";

import { useState, useEffect, useMemo } from "react";
import { WaterfallChart } from "@plexusui/components/charts/waterfall-chart";
import {
  ControlChart,
  calculateControlLimits,
  type ControlViolation,
} from "@plexusui/components/charts/control-chart";
import { LineChart } from "@plexusui/components/charts/line-chart";
import { ComponentPreview } from "@/components/component-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ============================================================================
// Data Generation - Industrial Vibration Signals
// ============================================================================

/**
 * Generate realistic bearing vibration signal with fault frequencies
 * Based on actual vibration analysis principles used in predictive maintenance
 */
function generateBearingVibration(
  samples: number,
  sampleRate: number,
  options: {
    motorSpeed: number; // RPM
    hasBearingFault: boolean;
    faultSeverity?: number; // 0-1
  }
): number[] {
  const signal = new Array(samples).fill(0);
  const { motorSpeed, hasBearingFault, faultSeverity = 0.5 } = options;

  // Convert RPM to Hz
  const rotationFreq = motorSpeed / 60;

  const harmonics = [
    rotationFreq, // 1x
    rotationFreq * 2, // 2x
    rotationFreq * 3, // 3x
  ];

  // Bearing fault frequencies (simplified model)
  // BPFO (Ball Pass Frequency Outer) = 3.57 * shaft speed (typical)
  // BPFI (Ball Pass Frequency Inner) = 5.43 * shaft speed (typical)
  const bpfo = rotationFreq * 3.57;
  const bpfi = rotationFreq * 5.43;
  const faultFreqs = [bpfo, bpfi];

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;

    // Normal operation - motor harmonics
    for (const freq of harmonics) {
      const amplitude = 0.3 / harmonics.indexOf(freq) + 1; // Decreasing amplitude for harmonics
      signal[i] += amplitude * Math.sin(2 * Math.PI * freq * t);
    }

    // Bearing fault signatures (if present)
    if (hasBearingFault) {
      // Fault frequencies have amplitude modulation
      const modulationFreq = rotationFreq / 2; // Typical modulation
      const modulation = 0.5 + 0.5 * Math.sin(2 * Math.PI * modulationFreq * t);

      for (const freq of faultFreqs) {
        const faultAmplitude = 0.5 * faultSeverity * modulation;
        signal[i] += faultAmplitude * Math.sin(2 * Math.PI * freq * t);
      }
    }

    // Broadband noise (mechanical noise floor)
    signal[i] += (Math.random() - 0.5) * 0.15;

    // Random impulses (if fault is severe)
    if (hasBearingFault && faultSeverity > 0.6 && Math.random() < 0.001) {
      signal[i] += (Math.random() - 0.5) * 3 * faultSeverity;
    }
  }

  return signal;
}

/**
 * Calculate RMS (Root Mean Square) vibration level
 * Standard metric in vibration monitoring
 */
function calculateRMS(signal: number[]): number {
  const sum = signal.reduce((acc, val) => acc + val * val, 0);
  return Math.sqrt(sum / signal.length);
}

// ============================================================================
// Complete Vibration Monitoring Dashboard
// ============================================================================

function VibrationMonitoringDashboard() {
  const MOTOR_SPEED = 1800; // RPM (30 Hz)
  const SAMPLE_RATE = 2000; // 2 kHz
  const WINDOW_DURATION = 10; // seconds
  const SAMPLES_PER_WINDOW = SAMPLE_RATE * WINDOW_DURATION;
  const UPDATE_INTERVAL_MS = 500; // Update twice per second

  const [isRunning, setIsRunning] = useState(true);
  const [hasFault, setHasFault] = useState(false);
  const [faultSeverity, setFaultSeverity] = useState(0.5);
  const [vibrationSignal, setVibrationSignal] = useState<number[]>(() =>
    generateBearingVibration(SAMPLES_PER_WINDOW, SAMPLE_RATE, {
      motorSpeed: MOTOR_SPEED,
      hasBearingFault: false,
    })
  );

  const [rmsHistory, setRmsHistory] = useState<Array<{ x: number; y: number }>>(
    []
  );
  const [violations, setViolations] = useState<ControlViolation[]>([]);

  // Real-time simulation
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // Generate new data
      const newSignal = generateBearingVibration(
        SAMPLES_PER_WINDOW,
        SAMPLE_RATE,
        {
          motorSpeed: MOTOR_SPEED,
          hasBearingFault: hasFault,
          faultSeverity,
        }
      );

      setVibrationSignal(newSignal);

      // Calculate RMS and add to history
      const rms = calculateRMS(newSignal);
      setRmsHistory((prev) => {
        const newHistory = [
          ...prev,
          { x: prev.length, y: rms * 100 }, // Scale for better visualization
        ];
        // Keep last 100 samples
        return newHistory.slice(-100);
      });
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isRunning, hasFault, faultSeverity]);

  // Calculate control limits for RMS
  const controlLimits = useMemo(() => {
    if (rmsHistory.length < 10) {
      return {
        mean: 30,
        stdDev: 5,
        uclSigma: 3,
        warningSigma: 2,
      };
    }
    return calculateControlLimits(rmsHistory.map((p) => p.y));
  }, [rmsHistory]);

  const currentRMS =
    rmsHistory.length > 0 ? rmsHistory[rmsHistory.length - 1].y : 0;
  const isOverLimit =
    currentRMS > controlLimits.mean + controlLimits.stdDev * 3;

  return (
    <ComponentPreview
      title="Industrial Vibration Monitoring - Predictive Maintenance"
      description="Real-time bearing fault detection using FFT, SPC control charts, and time-domain analysis. Detects BPFO/BPFI fault frequencies before catastrophic failure."
      code={`import { WaterfallChart } from "@/components/plexusui/charts/waterfall-chart";
import { ControlChart, calculateControlLimits } from "@/components/plexusui/charts/control-chart";
import { LineChart } from "@/components/plexusui/charts/line-chart";

// Generate realistic bearing vibration signal
const signal = generateBearingVibration(20000, 2000, {
  motorSpeed: 1800, // RPM
  hasBearingFault: true,
  faultSeverity: 0.5
});

// Monitor vibration levels with SPC
const rms = calculateRMS(signal);
const limits = calculateControlLimits(rmsHistory);

// Real-time dashboards
<div className="grid grid-cols-2 gap-4">
  {/* Frequency domain - detect fault frequencies */}
  <WaterfallChart
    signal={signal}
    sampleRate={2000}
    fftSize={512}
    frequencyRange={[0, 400]}
  />

  {/* Statistical process control */}
  <ControlChart
    data={rmsHistory}
    limits={limits}
    rules={["rule1", "rule2", "rule3", "rule4"]}
  />

  {/* Time domain - see impulses */}
  <LineChart
    data={signal.map((y, x) => ({ x, y }))}
    xAxis={{ label: "Time (s)" }}
    yAxis={{ label: "Acceleration (g)" }}
  />
</div>`}
      preview={
        <div className="w-full space-y-4">
          {/* Status Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Motor Bearing Monitor - M-2341
                  </CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    Speed: {MOTOR_SPEED} RPM ({(MOTOR_SPEED / 60).toFixed(1)}{" "}
                    Hz) | Sample Rate: {SAMPLE_RATE} Hz
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={isOverLimit ? "destructive" : "default"}
                    className="text-sm px-3 py-1"
                  >
                    {isOverLimit ? "⚠️ FAULT DETECTED" : "✓ NORMAL"}
                  </Badge>
                  <Button
                    variant={isRunning ? "outline" : "default"}
                    onClick={() => setIsRunning(!isRunning)}
                  >
                    {isRunning ? "⏸ Pause" : "▶ Resume"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Current RMS Level
                  </div>
                  <div className="text-2xl font-bold font-mono tabular-nums">
                    {currentRMS.toFixed(2)}
                    <span className="text-sm text-muted-foreground ml-1">
                      mm/s
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Control Limit (UCL)
                  </div>
                  <div className="text-2xl font-bold font-mono tabular-nums">
                    {(controlLimits.mean + controlLimits.stdDev * 3).toFixed(2)}
                    <span className="text-sm text-muted-foreground ml-1">
                      mm/s
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">
                    Fault Status
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={hasFault}
                        onChange={(e) => setHasFault(e.target.checked)}
                        className="w-4 h-4"
                      />
                      Bearing Fault
                    </label>
                    {hasFault && (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={faultSeverity * 100}
                        onChange={(e) =>
                          setFaultSeverity(Number(e.target.value) / 100)
                        }
                        className="w-20"
                        title={`Severity: ${(faultSeverity * 100).toFixed(0)}%`}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Monitoring Panels */}
          <div className="grid grid-cols-2 gap-4">
            {/* Frequency Domain Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Frequency Spectrum (FFT) - Fault Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span>
                        Normal ({(MOTOR_SPEED / 60).toFixed(1)} Hz,{" "}
                        {((MOTOR_SPEED / 60) * 2).toFixed(1)} Hz)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span>
                        BPFO ({((MOTOR_SPEED / 60) * 3.57).toFixed(1)} Hz), BPFI
                        ({((MOTOR_SPEED / 60) * 5.43).toFixed(1)} Hz)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-[350px]">
                    <WaterfallChart
                      signal={vibrationSignal}
                      sampleRate={SAMPLE_RATE}
                      fftSize={512}
                      hopSize={256}
                      windowFunction="hann"
                      useDb={true}
                      frequencyRange={[0, 400]}
                      xAxis={{ label: "Time" }}
                      yAxis={{ label: "Frequency (Hz)" }}
                      width={500}
                      height={350}
                      showAxes
                      showTooltip
                      preferWebGPU
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistical Process Control */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  RMS Vibration Trend - SPC Control Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {violations.length > 0 && (
                    <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      🔍 {violations[0].description}
                    </div>
                  )}
                  <div className="w-full h-[350px]">
                    <ControlChart
                      data={rmsHistory}
                      limits={controlLimits}
                      rules={["rule1", "rule2", "rule3", "rule4"]}
                      onOutOfControl={(v) => setViolations(v)}
                      showZones={true}
                      xAxis={{ label: "Sample Number" }}
                      yAxis={{ label: "RMS Vibration (mm/s)" }}
                      width={500}
                      height={350}
                      showTooltip
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Time Domain Signal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-normal text-muted-foreground">
                Time Domain - Raw Acceleration Signal (Last 0.5s)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[250px]">
                <LineChart
                  series={[
                    {
                      name: "Vibration Signal",
                      data: vibrationSignal
                        .slice(-1000) // Last 0.5 seconds (1000 samples at 2kHz)
                        .map((y, i) => ({ x: i / SAMPLE_RATE, y })),
                    },
                  ]}
                  xAxis={{
                    label: "Time (s)",
                    formatter: (v: number | string) => {
                      const num =
                        typeof v === "number" ? v : parseFloat(String(v));
                      return `${num.toFixed(3)}s`;
                    },
                  }}
                  yAxis={{ label: "Acceleration (g)" }}
                  width={1100}
                  height={250}
                  showAxes
                  showTooltip
                  preferWebGPU
                />
              </div>
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function VibrationMonitoringExamples() {
  return (
    <div className="space-y-8">
      <VibrationMonitoringDashboard />
    </div>
  );
}
