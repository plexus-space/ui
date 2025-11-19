"use client";

import { LineChart } from "@plexusui/components/charts/line-chart";
import { BarChart } from "@plexusui/components/charts/bar-chart";
import { Gauge } from "@plexusui/components/charts/gauge";
import { HeatmapChart } from "@plexusui/components/charts/heatmap-chart";
import { useState, useEffect } from "react";
import { Activity, Zap, Cpu, TrendingUp, TrendingDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AudioVisualizer } from "./components/audio-visualizer";
import { CameraVisualizer } from "./components/camera-visualizer";
import { OrientationVisualizer } from "./components/orientation-visualizer";
import { PointCloudVisualizer } from "./components/point-cloud-visualizer";

// ============================================================================
// DASHBOARD 1: HEALTH MONITORING
// ============================================================================

function HealthHeartRate() {
  const [data, setData] = useState(() => [
    {
      name: "Heart Rate",
      color: "#ef4444",
      data: Array.from({ length: 100 }, (_, i) => ({ x: i, y: 72 })),
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
          newData.push({
            x: lastX + 1,
            y: Math.max(60, Math.min(100, lastY + (Math.random() - 0.5) * 3)),
          });
          return { ...series, data: newData };
        })
      );
    }, 100);
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
      yAxis={{ domain: [50, 110], label: "BPM" }}
    />
  );
}

function HealthEEG() {
  const [data, setData] = useState(() => [
    {
      name: "Alpha",
      color: "#3b82f6",
      data: Array.from({ length: 100 }, (_, i) => ({ x: i, y: 8 })),
    },
    {
      name: "Beta",
      color: "#8b5cf6",
      data: Array.from({ length: 100 }, (_, i) => ({ x: i, y: 4 })),
    },
    {
      name: "Theta",
      color: "#ec4899",
      data: Array.from({ length: 100 }, (_, i) => ({ x: i, y: 0 })),
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((series) => {
          const newData = [...series.data];
          newData.shift();
          const lastX = newData[newData.length - 1].x;
          const offset =
            series.name === "Alpha" ? 8 : series.name === "Beta" ? 4 : 0;
          newData.push({
            x: lastX + 1,
            y:
              offset +
              Math.sin(lastX * 0.1) * 1.5 +
              (Math.random() - 0.5) * 0.5,
          });
          return { ...series, data: newData };
        })
      );
    }, 80);
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
      yAxis={{ label: "μV" }}
    />
  );
}

function HealthVitals() {
  const [temp, setTemp] = useState(37.2);
  const [spo2, setSpo2] = useState(98);
  const [bp, setBp] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      setTemp((prev) =>
        Math.max(36.5, Math.min(38, prev + (Math.random() - 0.5) * 0.15))
      );
      setSpo2((prev) =>
        Math.max(95, Math.min(100, prev + (Math.random() - 0.5) * 0.8))
      );
      setBp((prev) =>
        Math.max(110, Math.min(140, prev + (Math.random() - 0.5) * 3))
      );
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Gauge
        value={temp}
        min={35}
        max={40}
        label="Body Temp"
        unit="°C"
        width={160}
        height={160}
      />
      <Gauge
        value={spo2}
        min={80}
        max={100}
        label="SpO₂"
        unit="%"
        width={160}
        height={160}
      />
      <Gauge
        value={bp}
        min={80}
        max={160}
        label="Blood Pressure"
        unit="mmHg"
        width={160}
        height={160}
      />
    </div>
  );
}

// ============================================================================
// DASHBOARD 2: ROBOTICS
// ============================================================================

function RobotMotorSpeeds() {
  const [data, setData] = useState(() => [
    {
      name: "Motors",
      data: [
        { x: "M1", y: 1200 },
        { x: "M2", y: 1450 },
        { x: "M3", y: 980 },
        { x: "M4", y: 1320 },
        { x: "M5", y: 1150 },
        { x: "M6", y: 1380 },
      ],
      color: "#3b82f6",
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((series) => ({
          ...series,
          data: series.data.map((d) => ({
            ...d,
            y: Math.max(800, Math.min(2000, d.y + (Math.random() - 0.5) * 100)),
          })),
        }))
      );
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <BarChart
      series={data}
      width={550}
      height={250}
      showGrid
      showAxes
      yAxis={{ label: "RPM" }}
    />
  );
}

function RobotBattery() {
  const [data, setData] = useState(() => [
    {
      name: "Cells",
      data: [
        { x: "Cell 1", y: 4.15 },
        { x: "Cell 2", y: 4.12 },
        { x: "Cell 3", y: 4.18 },
        { x: "Cell 4", y: 4.1 },
        { x: "Cell 5", y: 4.16 },
        { x: "Cell 6", y: 4.14 },
      ],
      color: "#10b981",
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((series) => ({
          ...series,
          data: series.data.map((d) => ({
            ...d,
            y: Math.max(
              3.8,
              Math.min(4.2, d.y + (Math.random() - 0.51) * 0.02)
            ),
          })),
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BarChart
      series={data}
      width={550}
      height={250}
      showGrid
      showAxes
      yAxis={{ domain: [3.5, 4.5], label: "Volts" }}
    />
  );
}

function RobotSensors() {
  const [data, setData] = useState(() => {
    const initial = [];
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        initial.push({ x, y, value: Math.random() * 100 });
      }
    }
    return initial;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((cell) => ({
          ...cell,
          value: Math.max(
            0,
            Math.min(100, cell.value + (Math.random() - 0.5) * 15)
          ),
        }))
      );
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return <HeatmapChart data={data} width={550} height={260} cellGap={2} />;
}

// ============================================================================
// DASHBOARD 3: ENERGY
// ============================================================================

function EnergyConsumption() {
  const [data, setData] = useState(() => [
    {
      name: "Grid",
      color: "#3b82f6",
      data: Array.from({ length: 60 }, (_, i) => ({ x: i, y: 45 })),
    },
    {
      name: "Solar",
      color: "#f59e0b",
      data: Array.from({ length: 60 }, (_, i) => ({ x: i, y: 25 })),
    },
    {
      name: "Battery",
      color: "#10b981",
      data: Array.from({ length: 60 }, (_, i) => ({ x: i, y: 15 })),
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((series) => {
          const newData = [...series.data];
          newData.shift();
          const lastX = newData[newData.length - 1].x;
          const base =
            series.name === "Grid" ? 45 : series.name === "Solar" ? 25 : 15;
          newData.push({
            x: lastX + 1,
            y: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * 10)),
          });
          return { ...series, data: newData };
        })
      );
    }, 200);
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
      yAxis={{ domain: [0, 100], label: "kW" }}
    />
  );
}

function EnergyGeneration() {
  const [data, setData] = useState(() => [
    {
      name: "Output",
      data: [
        { x: "00:00", y: 0 },
        { x: "06:00", y: 15 },
        { x: "12:00", y: 45 },
        { x: "18:00", y: 20 },
        { x: "24:00", y: 0 },
      ],
      color: "#f59e0b",
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((series) => ({
          ...series,
          data: series.data.map((d, i) => {
            const base = [0, 15, 45, 20, 0][i];
            return { ...d, y: Math.max(0, base + (Math.random() - 0.5) * 5) };
          }),
        }))
      );
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <BarChart
      series={data}
      width={550}
      height={250}
      showGrid
      showAxes
      yAxis={{ label: "kW" }}
    />
  );
}

function EnergyStorage() {
  const [charge, setCharge] = useState(78);
  const [load, setLoad] = useState(65);
  const [efficiency, setEfficiency] = useState(92);

  useEffect(() => {
    const interval = setInterval(() => {
      setCharge((prev) => Math.max(60, Math.min(100, prev - 0.05)));
      setLoad((prev) =>
        Math.max(40, Math.min(100, prev + (Math.random() - 0.5) * 8))
      );
      setEfficiency((prev) =>
        Math.max(85, Math.min(98, prev + (Math.random() - 0.5) * 1))
      );
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      <Gauge
        value={charge}
        min={0}
        max={100}
        label="Battery Charge"
        unit="%"
        width={160}
        height={160}
      />
      <Gauge
        value={load}
        min={0}
        max={100}
        label="System Load"
        unit="%"
        width={160}
        height={160}
      />
      <Gauge
        value={efficiency}
        min={0}
        max={100}
        label="Efficiency"
        unit="%"
        width={160}
        height={160}
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
          defaultValue="audio"
          className="w-full justify-center items-center flex flex-col"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="audio" className="text-xs">
              Live Audio
            </TabsTrigger>
            <TabsTrigger value="camera" className="text-xs">
              Motion Detection
            </TabsTrigger>
            <TabsTrigger value="orientation" className="text-xs">
              Device Tilt
            </TabsTrigger>
            <TabsTrigger value="pointcloud" className="text-xs">
              3D Point Cloud
            </TabsTrigger>
            <TabsTrigger value="health" className="text-xs">
              Health Monitoring
            </TabsTrigger>
            <TabsTrigger value="robotics" className="text-xs">
              Robotics
            </TabsTrigger>
            <TabsTrigger value="energy" className="text-xs">
              Energy Management
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

          <TabsContent value="pointcloud" className="space-y-4 w-full">
            <PointCloudVisualizer />
          </TabsContent>

          <TabsContent value="health" className="space-y-4 w-full">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
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
                value="120/80"
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
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ChartCard
                title="ECG Monitor"
                description="Real-time heart rate streaming"
              >
                <HealthHeartRate />
              </ChartCard>
              <ChartCard
                title="EEG Brainwaves"
                description="Alpha, beta, theta waves"
              >
                <HealthEEG />
              </ChartCard>
            </div>

            <ChartCard
              title="Vital Signs"
              description="Temperature, oxygen saturation, blood pressure"
            >
              <HealthVitals />
            </ChartCard>
          </TabsContent>

          {/* Robotics Dashboard */}
          <TabsContent value="robotics" className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Cpu}
                title="Active Motors"
                value="6/6"
                change="0%"
                trend="neutral"
              />
              <MetricCard
                icon={Zap}
                title="Avg RPM"
                value="1,247"
                change="+5%"
                trend="up"
              />
              <MetricCard
                icon={Activity}
                title="Battery"
                value="82%"
                change="-2%"
                trend="down"
              />
              <MetricCard
                icon={Activity}
                title="Sensor Health"
                value="100%"
                change="0%"
                trend="neutral"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ChartCard
                title="Motor Speeds"
                description="6 motors RPM monitoring"
              >
                <RobotMotorSpeeds />
              </ChartCard>
              <ChartCard
                title="Battery Cells"
                description="Individual cell voltages"
              >
                <RobotBattery />
              </ChartCard>
            </div>

            <ChartCard
              title="Pressure Sensor Array"
              description="100 sensors, 10x10 grid"
            >
              <RobotSensors />
            </ChartCard>
          </TabsContent>

          {/* Energy Dashboard */}
          <TabsContent value="energy" className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                icon={Zap}
                title="Total Load"
                value="85 kW"
                change="+8%"
                trend="up"
              />
              <MetricCard
                icon={Activity}
                title="Solar Gen"
                value="25 kW"
                change="+12%"
                trend="up"
              />
              <MetricCard
                icon={Activity}
                title="Battery"
                value="78%"
                change="-5%"
                trend="down"
              />
              <MetricCard
                icon={TrendingUp}
                title="Efficiency"
                value="92%"
                change="+3%"
                trend="up"
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ChartCard
                title="Power Consumption"
                description="Grid, solar, battery sources"
              >
                <EnergyConsumption />
              </ChartCard>
              <ChartCard
                title="Solar Generation"
                description="24-hour output cycle"
              >
                <EnergyGeneration />
              </ChartCard>
            </div>

            <ChartCard
              title="Energy Storage"
              description="Battery charge, system load, efficiency"
            >
              <EnergyStorage />
            </ChartCard>
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
  icon: any;
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
