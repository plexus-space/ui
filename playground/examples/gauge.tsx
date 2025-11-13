"use client";

import { useState, useEffect } from "react";
import { Gauge } from "@plexusui/components/charts/gauge";
import { ComponentPreview } from "@/components/component-preview";
import { useColorScheme } from "@/components/color-scheme-provider";

// ============================================================================
// Example Components
// ============================================================================

function EngineRPMGauge() {
  const [rpm, setRpm] = useState(3500);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setRpm((prev) => {
        // Simulate engine RPM variations
        const change = (Math.random() - 0.5) * 200;
        const newRpm = prev + change;

        // Add occasional engine throttle changes
        if (Math.random() < 0.02) {
          return Math.max(
            1000,
            Math.min(6000, newRpm + (Math.random() - 0.5) * 1000)
          );
        }

        return Math.max(1000, Math.min(6000, newRpm));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentZone =
    rpm < 2000
      ? "Idle"
      : rpm < 4000
      ? "Normal"
      : rpm < 5000
      ? "High"
      : "Redline";

  return (
    <ComponentPreview
      title="Engine RPM Monitor"
      description="Clean circular gauge with color zones - Modern minimal design for easy readability"
      code={`import { Gauge } from "@/components/plexusui/charts/gauge";

<Gauge
  value={rpm}
  min={0}
  max={6000}
  label="RPM"
  unit="RPM"
  variant="circular"
  zones={[
    { from: 0, to: 2000, color: "#06b6d4" },
    { from: 2000, to: 4000, color: "#10b981" },
    { from: 4000, to: 5000, color: "#f97316" },
    { from: 5000, to: 6000, color: "#ef4444" },
  ]}
  needleColor="#06b6d4"
  width={800}
  height={600}
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Engine Status: {currentZone} ({rpm.toFixed(0)} RPM)
              </div>
              <div className="text-xs text-zinc-500">
                Zones: Idle (0-2k) | Normal (2k-4k) | High (4k-5k) | Redline
                (5k-6k)
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

          <div className="w-full h-[600px]">
            <Gauge
              value={rpm}
              min={0}
              max={6000}
              label="RPM"
              unit="RPM"
              variant="circular"
              zones={[
                { from: 0, to: 2000, color: "#06b6d4" },
                { from: 2000, to: 4000, color: "#10b981" },
                { from: 4000, to: 5000, color: "#f97316" },
                { from: 5000, to: 6000, color: "#ef4444" },
              ]}
              needleColor="#06b6d4"
              width={800}
              height={600}
              preferWebGPU={true}
            />
          </div>
        </div>
      }
    />
  );
}

function PrimitiveGaugeExample() {
  const { color } = useColorScheme();
  const [value, setValue] = useState(65);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => {
        const change = (Math.random() - 0.5) * 5;
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <ComponentPreview
      title="Primitive Components"
      description="Build custom gauges with primitive components for full control"
      code={`import { Gauge } from "@/components/plexusui/charts/gauge";

<Gauge.Root
  value={value}
  min={0}
  max={100}
  label="Metric"
  unit="%"
  variant="circular"
  width={800}
  height={600}
>
  <Gauge.Canvas />
  <Gauge.ValueDisplay />
</Gauge.Root>`}
      preview={
        <div className="w-full h-[600px]">
          <Gauge.Root
            value={value}
            min={0}
            max={100}
            label="Metric"
            unit="%"
            variant="circular"
            width={800}
            height={600}
            needleColor={color}
            preferWebGPU={true}
          >
            <Gauge.Canvas />
            <Gauge.ValueDisplay />
          </Gauge.Root>
        </div>
      }
    />
  );
}

function FuelLevelGauge() {
  const { color } = useColorScheme();
  const [fuelLevel, setFuelLevel] = useState(75);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setFuelLevel((prev) => {
        // Simulate fuel consumption with occasional refills
        if (Math.random() < 0.01) {
          return Math.min(100, prev + 30); // Refill
        }

        const change = (Math.random() - 0.7) * 2; // Slow decrease
        return Math.max(0, Math.min(100, prev + change));
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isPaused]);

  const fuelStatus =
    fuelLevel < 15
      ? "Critical"
      : fuelLevel < 30
      ? "Low"
      : fuelLevel < 70
      ? "Normal"
      : "Full";

  return (
    <ComponentPreview
      title="Linear Fuel Gauge"
      description="Flat horizontal gauge with color zones - Perfect for dashboard displays"
      code={`import { Gauge } from "@/components/plexusui/charts/gauge";

<Gauge
  value={fuelLevel}
  min={0}
  max={100}
  label="Fuel"
  unit="%"
  variant="linear"
  zones={[
    { from: 0, to: 15, color: "#ef4444" },
    { from: 15, to: 30, color: "#f97316" },
    { from: 30, to: 70, color: "#10b981" },
    { from: 70, to: 100, color: "#06b6d4" },
  ]}
  showTicks={true}
  tickCount={11}
  width={800}
  height={200}
/>`}
      preview={
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Fuel Status: {fuelStatus} ({fuelLevel.toFixed(1)}%)
              </div>
              <div className="text-xs text-zinc-500">
                Zones: Critical (0-15%) | Low (15-30%) | Normal (30-70%) | Full
                (70-100%)
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

          <div className="w-full h-[200px]">
            <Gauge
              value={fuelLevel}
              min={0}
              max={100}
              label="Fuel"
              unit="%"
              variant="linear"
              zones={[
                { from: 0, to: 15, color: "#ef4444" },
                { from: 15, to: 30, color: "#f97316" },
                { from: 30, to: 70, color: "#10b981" },
                { from: 70, to: 100, color: "#06b6d4" },
              ]}
              needleColor={color}
              showTicks={true}
              tickCount={11}
              width={800}
              height={200}
              preferWebGPU={true}
            />
          </div>
        </div>
      }
    />
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function GaugeExamples() {
  return (
    <div className="space-y-8">
      <EngineRPMGauge />
      <FuelLevelGauge />
      <PrimitiveGaugeExample />
    </div>
  );
}
