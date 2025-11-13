"use client";

import { useState, useEffect } from "react";
import { StatusGrid } from "@plexusui/components/charts/status-grid";
import type { KPIMetric } from "@plexusui/components/charts/status-grid";
import { ComponentPreview } from "@/components/component-preview";

function AircraftSystemsDashboard() {
  const [metrics, setMetrics] = useState<KPIMetric[]>([
    {
      id: "altitude",
      label: "Altitude",
      value: 35000,
      unit: "ft",
      change: 2.5,
      status: "normal",
      min: 0,
      max: 45000,
      sparkline: [33000, 33500, 34000, 34200, 34500, 34800, 35000],
    },
    {
      id: "speed",
      label: "Ground Speed",
      value: 485,
      unit: "kts",
      change: -1.2,
      status: "normal",
      sparkline: [490, 488, 487, 486, 485, 485, 485],
    },
    {
      id: "fuel",
      label: "Fuel Remaining",
      value: 12500,
      unit: "lbs",
      change: -5.3,
      status: "warning",
      threshold: { warning: 10000, critical: 5000 },
      sparkline: [15000, 14500, 14000, 13500, 13000, 12700, 12500],
    },
    {
      id: "temp",
      label: "Engine Temp",
      value: 850,
      unit: "°C",
      change: 0.5,
      status: "normal",
      threshold: { warning: 900, critical: 950 },
      sparkline: [845, 846, 847, 848, 849, 849, 850],
    },
    {
      id: "oil-pressure",
      label: "Oil Pressure",
      value: 45,
      unit: "psi",
      change: -2.1,
      status: "critical",
      threshold: { warning: 50, critical: 40 },
      sparkline: [55, 52, 50, 48, 47, 46, 45],
    },
    {
      id: "hydraulics",
      label: "Hydraulics",
      value: 3000,
      unit: "psi",
      change: 0,
      status: "normal",
      sparkline: [3000, 3000, 3000, 3000, 3000, 3000, 3000],
    },
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => {
          const newValue = metric.value + (Math.random() - 0.5) * 10;
          const newSparkline = [
            ...((metric?.sparkline?.slice(1) ?? []) as number[]),
            newValue,
          ];
          const change =
            ((newValue - (metric?.sparkline?.[0] ?? 0)) /
              (metric?.sparkline?.[0] ?? 0)) *
            100;

          // Determine status based on thresholds
          let status: "normal" | "warning" | "critical" = "normal";
          if (metric.threshold) {
            if (newValue <= metric.threshold.critical) {
              status = "critical";
            } else if (newValue <= metric.threshold.warning) {
              status = "warning";
            }
          }

          return {
            ...metric,
            value: newValue,
            sparkline: newSparkline,
            change,
            status,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ComponentPreview
      title="Aircraft Systems Dashboard"
      description="Real-time flight systems monitoring with sparklines, thresholds, and status indicators. Live updates every second."
      code={`const [metrics, setMetrics] = useState<KPIMetric[]>([
  {
    id: "altitude",
    label: "Altitude",
    value: 35000,
    unit: "ft",
    change: 2.5,
    status: "normal",
    min: 0,
    max: 45000,
    sparkline: [33000, 33500, 34000, 34200, 34500, 34800, 35000],
  },
  {
    id: "fuel",
    label: "Fuel Remaining",
    value: 12500,
    unit: "lbs",
    change: -5.3,
    status: "warning",
    threshold: { warning: 10000, critical: 5000 },
    sparkline: [15000, 14500, 14000, 13500, 13000, 12700, 12500],
  },
  // ... more metrics
]);

// Simulate real-time updates
useEffect(() => {
  const interval = setInterval(() => {
    setMetrics(prev => prev.map(metric => {
      const newValue = metric.value + (Math.random() - 0.5) * 10;
      const newSparkline = [...metric.sparkline.slice(1), newValue];
      const change = ((newValue - metric.sparkline[0]) / metric.sparkline[0]) * 100;
      return { ...metric, value: newValue, sparkline: newSparkline, change };
    }));
  }, 1000);
  return () => clearInterval(interval);
}, []);

<StatusGrid
  metrics={metrics}
  columns={3}
  gap={16}
  showSparklines={true}
/>`}
      preview={
        <div className="w-full p-4">
          <StatusGrid
            metrics={metrics}
            columns={3}
            gap={16}
            showSparklines={true}
          />
        </div>
      }
    />
  );
}

function CompactStatusView() {
  const [metrics, setMetrics] = useState<KPIMetric[]>([
    {
      id: "altitude",
      label: "Altitude",
      value: 35000,
      unit: "ft",
      change: 2.5,
      status: "normal",
    },
    {
      id: "speed",
      label: "Ground Speed",
      value: 485,
      unit: "kts",
      change: -1.2,
      status: "normal",
    },
    {
      id: "fuel",
      label: "Fuel",
      value: 12500,
      unit: "lbs",
      change: -5.3,
      status: "warning",
    },
    {
      id: "temp",
      label: "Engine Temp",
      value: 850,
      unit: "°C",
      change: 0.5,
      status: "normal",
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((metric) => {
          const newValue = metric.value + (Math.random() - 0.5) * 8;
          return {
            ...metric,
            value: newValue,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ComponentPreview
      title="Compact View (No Sparklines)"
      description="Condensed status display without sparklines. Perfect for space-constrained dashboards."
      code={`<StatusGrid
  metrics={metrics}
  columns={4}
  gap={12}
  showSparklines={false}
/>`}
      preview={
        <div className="w-full p-4">
          <StatusGrid
            metrics={metrics}
            columns={4}
            gap={12}
            showSparklines={false}
          />
        </div>
      }
    />
  );
}

function EngineMonitoring() {
  const [engineMetrics, setEngineMetrics] = useState<KPIMetric[]>([
    {
      id: "rpm",
      label: "RPM",
      value: 2450,
      unit: "rpm",
      change: 0.3,
      status: "normal",
      threshold: { warning: 2800, critical: 3000 },
      sparkline: [2400, 2420, 2430, 2440, 2445, 2448, 2450],
    },
    {
      id: "egt",
      label: "EGT",
      value: 750,
      unit: "°C",
      change: 1.2,
      status: "normal",
      threshold: { warning: 850, critical: 900 },
      sparkline: [740, 742, 745, 746, 748, 749, 750],
    },
    {
      id: "oil-temp",
      label: "Oil Temp",
      value: 85,
      unit: "°C",
      change: 0.8,
      status: "normal",
      threshold: { warning: 100, critical: 110 },
      sparkline: [83, 83.5, 84, 84.2, 84.5, 84.8, 85],
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEngineMetrics((prev) =>
        prev.map((metric) => {
          const variance = metric.id === "rpm" ? 20 : 5;
          const newValue = metric.value + (Math.random() - 0.5) * variance;
          const newSparkline = [
            ...((metric?.sparkline?.slice(1) ?? []) as number[]),
            newValue,
          ];
          const change =
            ((newValue - (metric?.sparkline?.[0] ?? 0)) /
              (metric?.sparkline?.[0] ?? 0)) *
            100;

          let status: "normal" | "warning" | "critical" = "normal";
          if (metric.threshold) {
            if (newValue >= metric.threshold.critical) {
              status = "critical";
            } else if (newValue >= metric.threshold.warning) {
              status = "warning";
            }
          }

          return {
            ...metric,
            value: newValue,
            sparkline: newSparkline,
            change,
            status,
          };
        })
      );
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <ComponentPreview
      title="Engine Monitoring Station"
      description="Critical engine parameters with high threshold warnings. Fast update rate for responsive monitoring."
      code={`<StatusGrid
  metrics={engineMetrics}
  columns={3}
  gap={16}
  showSparklines={true}
/>`}
      preview={
        <div className="w-full p-4">
          <StatusGrid
            metrics={engineMetrics}
            columns={3}
            gap={16}
            showSparklines={true}
          />
        </div>
      }
    />
  );
}

export function StatusGridExamples() {
  return (
    <div className="space-y-8">
      <AircraftSystemsDashboard />
      <CompactStatusView />
      <EngineMonitoring />
    </div>
  );
}
