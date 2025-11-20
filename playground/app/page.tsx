"use client";

import { LineChart } from "@plexusui/components/charts/line-chart";
import { Gauge } from "@plexusui/components/charts/gauge";
import { HeatmapChart } from "@plexusui/components/charts/heatmap-chart";
import { useState, useEffect } from "react";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AudioVisualizer } from "./components/audio-visualizer";
import { CameraVisualizer } from "./components/camera-visualizer";
import { OrientationVisualizer } from "./components/orientation-visualizer";
import { MedicalScanViewer } from "./components/medical-scan-viewer";
import { ECGAnalysis } from "./components/ecg-analysis";
import { SensorIntegration } from "./components/sensor-integration";

// ============================================================================
// CRITICAL CARE PATIENT MONITORING - Supporting Components
// ============================================================================

function VitalSignsTrends() {
  const [data, setData] = useState(() => [
    {
      name: "Heart Rate",
      color: "#ef4444",
      data: Array.from({ length: 50 }, (_, i) => ({ x: i, y: 72 })),
    },
    {
      name: "SpO₂",
      color: "#3b82f6",
      data: Array.from({ length: 50 }, (_, i) => ({ x: i, y: 98 })),
    },
    {
      name: "Resp Rate",
      color: "#8b5cf6",
      data: Array.from({ length: 50 }, (_, i) => ({ x: i, y: 16 })),
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((series) => {
          const newData = [...series.data];
          newData.shift();
          const lastX = newData[newData.length - 1].x;
          const lastY = newData[newData.length - 1].y;

          let newY: number;
          if (series.name === "Heart Rate") {
            newY = Math.max(60, Math.min(100, lastY + (Math.random() - 0.5) * 2));
          } else if (series.name === "SpO₂") {
            newY = Math.max(94, Math.min(100, lastY + (Math.random() - 0.5) * 0.5));
          } else {
            newY = Math.max(12, Math.min(22, lastY + (Math.random() - 0.5) * 1));
          }

          newData.push({ x: lastX + 1, y: newY });
          return { ...series, data: newData };
        })
      );
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <LineChart
      series={data}
      width={550}
      height={250}
      showGrid
      showAxes
      showTooltip
    />
  );
}

function PatientMonitoringGrid() {
  const [data, setData] = useState(() => {
    const initial = [];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        initial.push({
          x,
          y,
          value: 75 + (Math.random() - 0.5) * 30,
        });
      }
    }
    return initial;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((cell) => ({
          ...cell,
          value: Math.max(40, Math.min(100, cell.value + (Math.random() - 0.5) * 8)),
        }))
      );
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return <HeatmapChart data={data} width={550} height={280} cellGap={4} />;
}

function VitalSignsGauges() {
  const [hr, setHr] = useState(72);
  const [spo2, setSpo2] = useState(98);
  const [temp, setTemp] = useState(37.2);
  const [bp, setBp] = useState(120);
  const [rr, setRr] = useState(16);

  useEffect(() => {
    const interval = setInterval(() => {
      setHr((prev) => Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 2)));
      setSpo2((prev) => Math.max(94, Math.min(100, prev + (Math.random() - 0.5) * 0.5)));
      setTemp((prev) => Math.max(36.5, Math.min(38.5, prev + (Math.random() - 0.5) * 0.1)));
      setBp((prev) => Math.max(100, Math.min(150, prev + (Math.random() - 0.5) * 3)));
      setRr((prev) => Math.max(12, Math.min(22, prev + (Math.random() - 0.5) * 1)));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-5 gap-3">
      <Gauge
        value={hr}
        min={40}
        max={120}
        label="Heart Rate"
        unit="BPM"
        width={140}
        height={140}
      />
      <Gauge
        value={spo2}
        min={85}
        max={100}
        label="SpO₂"
        unit="%"
        width={140}
        height={140}
      />
      <Gauge
        value={temp}
        min={35}
        max={40}
        label="Temperature"
        unit="°C"
        width={140}
        height={140}
      />
      <Gauge
        value={bp}
        min={80}
        max={180}
        label="Blood Pressure"
        unit="mmHg"
        width={140}
        height={140}
      />
      <Gauge
        value={rr}
        min={8}
        max={30}
        label="Resp Rate"
        unit="/min"
        width={140}
        height={140}
      />
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="py-12">
            <h1 className="text-4xl mb-3">
              Simplifying human-computer interaction for hardware.
            </h1>
            <p className="text-sm text-gray-400 max-w-3xl mx-auto">
              Observability made Simple. Unified visibility and optimization
              across all physical systems.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 justify-center items-center">
        <Tabs
          defaultValue="medical"
          className="w-full justify-center items-center flex flex-col"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="medical" className="text-xs">
              3D Medical Imaging
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-xs">
              Live Audio
            </TabsTrigger>
            <TabsTrigger value="camera" className="text-xs">
              Motion Detection
            </TabsTrigger>
            <TabsTrigger value="orientation" className="text-xs">
              Device Tilt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="audio" className="space-y-4 w-full">
            <AudioVisualizer />
          </TabsContent>

          <TabsContent value="camera" className="space-y-4 w-full">
            <CameraVisualizer />
          </TabsContent>

          <TabsContent value="orientation" className="space-y-4 w-full">
            <OrientationVisualizer />
          </TabsContent>

          <TabsContent value="medical" className="space-y-4 w-full">
            {/* Top Metrics Row */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                icon={Activity}
                title="Heart Rate"
                value="72 BPM"
                change="+2%"
                trend="up"
              />
              <MetricCard
                icon={Activity}
                title="Blood Pressure"
                value="120/80 mmHg"
                change="+0%"
                trend="neutral"
              />
              <MetricCard
                icon={Activity}
                title="SpO₂"
                value="98%"
                change="+1%"
                trend="up"
              />
              <MetricCard
                icon={Activity}
                title="Temperature"
                value="37.2°C"
                change="0%"
                trend="neutral"
              />
              <MetricCard
                icon={Activity}
                title="Resp Rate"
                value="16/min"
                change="+0%"
                trend="neutral"
              />
            </div>

            {/* Main 3D + ECG Row */}
            <div className="grid gap-3 md:grid-cols-2">
              <ChartCard
                title="3D Brain Scan (CT/MRI)"
                description="Interactive point cloud visualization • Color-mapped by tissue density"
              >
                <MedicalScanViewer />
              </ChartCard>
              <ChartCard
                title="ECG with Frequency Analysis"
                description="Real-time cardiac monitoring with spectral decomposition"
              >
                <ECGAnalysis />
              </ChartCard>
            </div>

            {/* Vital Signs Trends */}
            <ChartCard
              title="24-Hour Vital Signs Trends"
              description="Multi-parameter trending: Heart rate, SpO₂, and respiratory rate"
            >
              <VitalSignsTrends />
            </ChartCard>

            {/* Bottom Row: Gauges + Patient Grid */}
            <div className="grid gap-3 md:grid-cols-2">
              <ChartCard
                title="Current Vital Signs"
                description="Live patient vitals with normal range indicators"
              >
                <VitalSignsGauges />
              </ChartCard>
              <ChartCard
                title="Multi-Patient Monitoring"
                description="Real-time status heatmap: 5 patients × 5 vital parameters"
              >
                <PatientMonitoringGrid />
              </ChartCard>
            </div>

            {/* Optional Real Sensor Integration */}
            <SensorIntegration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  change,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}) {
  return (
    <Card className="hover:border-zinc-700 cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-gray-500 flex items-center gap-2">
          <Icon className="h-3 w-3" />
          {title}
        </h3>
      </div>
      <div className="space-y-1">
        <div className="text-lg font-semibold">{value}</div>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          {trend === "up" && <TrendingUp className="h-3 w-3 text-green-400" />}
          {trend === "down" && (
            <TrendingDown className="h-3 w-3 text-red-400" />
          )}
          <span
            className={
              trend === "up"
                ? "text-green-400"
                : trend === "down"
                ? "text-red-400"
                : "text-gray-400"
            }
          >
            {change}
          </span>
          <span>from last hour</span>
        </p>
      </div>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="hover:border-zinc-700">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-gray-500">{title}</h3>
      </div>
      <div className="space-y-3">
        <p className="text-xs text-gray-400">{description}</p>
        <div>{children}</div>
      </div>
    </Card>
  );
}
