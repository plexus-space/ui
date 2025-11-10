"use client";

import { AreaChart } from "@plexusui/components/charts/area-chart";
import type { DataPoint } from "@plexusui/components/charts/area-chart";
import { ComponentPreview } from "@/components/component-preview";
import { useState, useEffect } from "react";

// ============================================================================
// Example Data
// ============================================================================

const stockPriceData: DataPoint[] = Array.from({ length: 60 }, (_, i) => ({
  x: i,
  y: 100 + Math.sin(i / 10) * 20 + Math.random() * 10,
}));

const temperatureData: DataPoint[] = Array.from({ length: 50 }, (_, i) => ({
  x: i,
  y: 20 + Math.sin(i / 8) * 10 + Math.random() * 5,
}));

// ============================================================================
// Example Components
// ============================================================================

function BasicAreaChart() {
  return (
    <ComponentPreview
      title="Basic Area Chart"
      description="Simple area chart showing stock price trends"
      code={`import { AreaChart } from "@/components/plexusui/charts/area-chart";

const data = Array.from({ length: 60 }, (_, i) => ({
  x: i,
  y: 100 + Math.sin(i / 10) * 20 + Math.random() * 10,
}));

<AreaChart
  series={[{
    name: "Stock Price",
    data,
    color: "#3b82f6",
    fillOpacity: 0.3,
  }]}
  width={800}
  height={400}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <AreaChart
            series={[
              {
                name: "Stock Price",
                data: stockPriceData,
                color: "#3b82f6",
                fillOpacity: 0.3,
                strokeWidth: 2,
              },
            ]}
            yAxis={{ label: "Price ($)" }}
            xAxis={{ label: "Time (days)" }}
            width={800}
            height={400}
            showGrid
            showTooltip
          />
        </div>
      }
    />
  );
}

function MultiSeriesAreaChart() {
  return (
    <ComponentPreview
      title="Multi-Series Area Chart"
      description="Multiple data series with overlapping areas"
      code={`const series1 = [...];
const series2 = [...];

<AreaChart
  series={[
    { name: "Server A", data: series1, color: "#10b981", fillOpacity: 0.2 },
    { name: "Server B", data: series2, color: "#f59e0b", fillOpacity: 0.2 },
  ]}
  showTooltip
/>`}
      preview={
        <div className="w-full h-[400px]">
          <AreaChart
            series={[
              {
                name: "Server A",
                data: Array.from({ length: 40 }, (_, i) => ({
                  x: i,
                  y: 60 + Math.sin(i / 6) * 15 + Math.random() * 8,
                })),
                color: "#10b981",
                fillOpacity: 0.25,
                strokeWidth: 2,
              },
              {
                name: "Server B",
                data: Array.from({ length: 40 }, (_, i) => ({
                  x: i,
                  y: 50 + Math.cos(i / 5) * 12 + Math.random() * 8,
                })),
                color: "#f59e0b",
                fillOpacity: 0.25,
                strokeWidth: 2,
              },
            ]}
            yAxis={{ label: "CPU Usage (%)" }}
            xAxis={{ label: "Time (min)" }}
            width={800}
            height={400}
            showGrid
            showTooltip
          />
        </div>
      }
    />
  );
}

function StreamingAreaChart() {
  const [data, setData] = useState<DataPoint[]>(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: i,
      y: 50 + Math.sin(i / 8) * 20,
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const newX = prev.length > 0 ? prev[prev.length - 1].x + 1 : 0;
        const newY = 50 + Math.sin(newX / 8) * 20 + Math.random() * 15;

        const updated = [...prev, { x: newX, y: newY }];
        return updated.length > 100 ? updated.slice(-100) : updated;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const xMin = data.length > 0 ? data[0].x : 0;
  const xMax = data.length > 0 ? data[data.length - 1].x : 100;

  return (
    <ComponentPreview
      title="Real-time Area Chart"
      description="Streaming data with smooth area visualization"
      code={`const [data, setData] = useState<DataPoint[]>(initialData);

useEffect(() => {
  const interval = setInterval(() => {
    setData(prev => {
      const newX = prev[prev.length - 1].x + 1;
      const newY = calculateValue(newX);
      const updated = [...prev, { x: newX, y: newY }];
      return updated.slice(-100); // Keep last 100 points
    });
  }, 100);

  return () => clearInterval(interval);
}, []);

<AreaChart
  series={[{
    name: "Live Signal",
    data,
    color: "#8b5cf6",
    fillOpacity: 0.4,
  }]}
  xAxis={{ domain: [data[0].x, data[data.length - 1].x] }}
/>`}
      preview={
        <div className="w-full h-[400px]">
          <AreaChart
            series={[
              {
                name: "Live Signal",
                data,
                color: "#8b5cf6",
                fillOpacity: 0.4,
                strokeWidth: 2,
              },
            ]}
            xAxis={{ domain: [xMin, xMax] }}
            yAxis={{ label: "Value" }}
            width={800}
            height={400}
            showGrid
            showTooltip
          />
        </div>
      }
    />
  );
}

function PrimitiveAreaChart() {
  return (
    <ComponentPreview
      title="Primitive Components"
      description="Build custom area charts with primitive components"
      code={`import { AreaChart } from "@/components/plexusui/charts/area-chart";

<AreaChart.Root
  series={[{ name: "Data", data, color: "#06b6d4" }]}
  width={800}
  height={400}
>
  <AreaChart.Canvas showGrid />
  <AreaChart.Axes />
  <AreaChart.Tooltip />
  <AreaChart.Legend />
</AreaChart.Root>`}
      preview={
        <div className="w-full h-[400px]">
          <AreaChart.Root
            series={[
              {
                name: "Temperature",
                data: temperatureData,
                color: "#06b6d4",
                fillOpacity: 0.3,
              },
            ]}
            width={800}
            height={400}
            preferWebGPU={true}
          >
            <AreaChart.Canvas showGrid />
            <AreaChart.Axes />
            <AreaChart.Tooltip />
            <AreaChart.Legend />
          </AreaChart.Root>
        </div>
      }
    />
  );
}

// ============================================================================
// Main Export
// ============================================================================

export function AreaChartExamples() {
  return (
    <div className="space-y-8">
      <BasicAreaChart />
      <MultiSeriesAreaChart />
      <StreamingAreaChart />
      <PrimitiveAreaChart />
    </div>
  );
}
