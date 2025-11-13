"use client";

import { useState, useEffect } from "react";
import { StatusGrid } from "@plexusui/components/charts/status-grid";
import type { KPIMetric } from "@plexusui/components/charts/status-grid";
import { ComponentPreview } from "@/components/component-preview";

function CompoundAPIExample() {
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
      title="Compound API - Simple Usage"
      description="Real-time flight systems monitoring using the simple compound component API. Live updates every second."
      code={`import { StatusGrid } from "@plexusui/components/charts/status-grid";

// Simple compound API - pass metrics and configuration
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

function PrimitiveAPIExample() {
  const [metrics, setMetrics] = useState<KPIMetric[]>([
    {
      id: "altitude",
      label: "Altitude",
      value: 35000,
      unit: "ft",
      change: 2.5,
      status: "normal",
      sparkline: [33000, 33500, 34000, 34200, 34500, 34800, 35000],
    },
    {
      id: "fuel",
      label: "Fuel Remaining",
      value: 12500,
      unit: "lbs",
      change: -5.3,
      status: "warning",
      sparkline: [15000, 14500, 14000, 13500, 13000, 12700, 12500],
    },
    {
      id: "oil-pressure",
      label: "Oil Pressure",
      value: 45,
      unit: "psi",
      change: -2.1,
      status: "critical",
      sparkline: [55, 52, 50, 48, 47, 46, 45],
    },
  ]);

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

          return {
            ...metric,
            value: newValue,
            sparkline: newSparkline,
            change,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ComponentPreview
      title="Primitive API - Custom Composition"
      description="Build custom cards with full control using primitive components. Compose your own layouts and styles."
      code={`import { StatusGrid } from "@plexusui/components/charts/status-grid";

// Primitive API - full control over composition
<StatusGrid.Root columns={3} gap={16}>
  {metrics.map((metric) => (
    <StatusGrid.Card key={metric.id}>
      <StatusGrid.StatusIndicator status={metric.status} />
      <StatusGrid.Label>{metric.label}</StatusGrid.Label>
      <StatusGrid.Value value={metric.value} unit={metric.unit} />
      {metric.change !== undefined && (
        <StatusGrid.ChangeIndicator change={metric.change} />
      )}
      {metric.sparkline && (
        <div className="mt-3 h-12">
          <StatusGrid.Sparkline
            data={metric.sparkline}
            width={200}
            height={48}
            color="#3b82f6"
          />
        </div>
      )}
    </StatusGrid.Card>
  ))}
</StatusGrid.Root>`}
      preview={
        <div className="w-full p-4">
          <StatusGrid.Root columns={3} gap={16}>
            {metrics.map((metric) => {
              const statusColors = {
                normal: "#10b981",
                warning: "#f59e0b",
                critical: "#ef4444",
                offline: "#6b7280",
              };
              const color = statusColors[metric.status || "normal"];

              return (
                <StatusGrid.Card key={metric.id}>
                  <StatusGrid.StatusIndicator status={metric.status} />
                  <StatusGrid.Label>{metric.label}</StatusGrid.Label>
                  <StatusGrid.Value value={metric.value} unit={metric.unit} />
                  {metric.change !== undefined && (
                    <StatusGrid.ChangeIndicator change={metric.change} />
                  )}
                  {metric.sparkline && metric.sparkline.length > 1 && (
                    <div className="mt-3 h-12">
                      <StatusGrid.Sparkline
                        data={metric.sparkline}
                        width={200}
                        height={48}
                        color={color}
                      />
                    </div>
                  )}
                </StatusGrid.Card>
              );
            })}
          </StatusGrid.Root>
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
      <CompoundAPIExample />
      <PrimitiveAPIExample />
      <CompactStatusView />
      <EngineMonitoring />
    </div>
  );
}
