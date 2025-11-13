"use client";

import { useState, useEffect } from "react";
import { RadarChart } from "@plexusui/components/charts/radar-chart";
import type {
  RadarSeries,
  RadarDataPoint,
} from "@plexusui/components/charts/radar-chart";
import { ComponentPreview } from "@/components/component-preview";
import {
  useColorScheme,
  useMultiColors,
} from "@/components/color-scheme-provider";

function SonarVisualization() {
  const { color } = useColorScheme();

  return (
    <ComponentPreview
      title="Multi-Sector Sonar Display"
      description="Static radar with labeled targets across multiple sectors. Perfect for sonar or tactical displays."
      code={`<RadarChart
  series={[
    {
      name: "Sector A",
      data: [
        { angle: 30, distance: 0.5, label: "Target 1" },
        { angle: 60, distance: 0.7, label: "Target 2" },
        { angle: 150, distance: 0.3, label: "Target 3" },
        { angle: 240, distance: 0.9, label: "Target 4" },
        { angle: 310, distance: 0.6, label: "Target 5" },
      ],
      color: "#10b981",
    },
  ]}
  rings={5}
  sectors={8}
  showSweep={false}
  width={500}
  height={500}
/>`}
      preview={
        <div className="flex items-center justify-center p-8">
          <RadarChart
            series={[
              {
                name: "Sector A",
                data: [
                  { angle: 30, distance: 0.5, label: "Target 1" },
                  { angle: 60, distance: 0.7, label: "Target 2" },
                  { angle: 150, distance: 0.3, label: "Target 3" },
                  { angle: 240, distance: 0.9, label: "Target 4" },
                  { angle: 310, distance: 0.6, label: "Target 5" },
                ],
                color: color,
              },
            ]}
            rings={5}
            sectors={8}
            showSweep={false}
            width={500}
            height={500}
          />
        </div>
      }
    />
  );
}

interface TargetWithVelocity extends RadarDataPoint {
  heading: number; // Direction of travel in degrees
  speed: number; // Speed in distance units per update
}

function HighPerformanceTracking() {
  const colors = useMultiColors(5);
  const [targets, setTargets] = useState<RadarSeries[]>(() => {
    // Initialize 200 targets with realistic velocities
    const createTargets = (
      count: number,
      minSpeed: number,
      maxSpeed: number
    ): TargetWithVelocity[] => {
      return Array.from({ length: count }, (_, i) => ({
        angle: Math.random() * 360,
        distance: 0.2 + Math.random() * 0.6,
        intensity: 0.7 + Math.random() * 0.3,
        label: `T${i}`,
        heading: Math.random() * 360, // Initial heading
        speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
      }));
    };

    return [
      {
        name: "Air Traffic",
        data: createTargets(80, 0.003, 0.008), // Faster (aircraft)
        color: colors[0],
      },
      {
        name: "Ground Vehicles",
        data: createTargets(60, 0.001, 0.003), // Slower (ground)
        color: colors[1],
      },
      {
        name: "Naval Vessels",
        data: createTargets(30, 0.0015, 0.004), // Medium (ships)
        color: colors[2],
      },
      {
        name: "Unknown",
        data: createTargets(30, 0.002, 0.006), // Variable
        color: colors[3],
      },
    ];
  });

  // High-frequency updates with realistic movement patterns
  useEffect(() => {
    const interval = setInterval(() => {
      setTargets((prev) =>
        prev.map((series) => ({
          ...series,
          data: series.data.map((point) => {
            const target = point as TargetWithVelocity;

            // Gradual heading changes (more realistic turning)
            const headingChange = (Math.random() - 0.5) * 1.5;
            const newHeading = (target.heading + headingChange + 360) % 360;

            // Convert polar to cartesian, move, convert back
            const currentX =
              target.distance * Math.cos((target.angle * Math.PI) / 180);
            const currentY =
              target.distance * Math.sin((target.angle * Math.PI) / 180);

            // Move in heading direction
            const dx = target.speed * Math.cos((newHeading * Math.PI) / 180);
            const dy = target.speed * Math.sin((newHeading * Math.PI) / 180);

            const newX = currentX + dx;
            const newY = currentY + dy;

            // Convert back to polar
            const newDistance = Math.sqrt(newX * newX + newY * newY);
            const newAngle = (Math.atan2(newY, newX) * 180) / Math.PI;

            // Bounce off edges
            let finalDistance = newDistance;
            let finalHeading = newHeading;
            if (newDistance > 0.9 || newDistance < 0.15) {
              finalHeading = (newHeading + 180) % 360; // Reverse direction
              finalDistance = Math.max(0.15, Math.min(0.9, newDistance));
            }

            return {
              ...target,
              angle: (newAngle + 360) % 360,
              distance: finalDistance,
              heading: finalHeading,
              intensity:
                0.7 + Math.sin(Date.now() * 0.002 + target.angle) * 0.15,
            };
          }),
        }))
      );
    }, 50); // 20fps updates for 200 targets = 4000 calculations/sec

    return () => clearInterval(interval);
  }, []);

  const totalTargets = targets.reduce((sum, s) => sum + s.data.length, 0);

  return (
    <ComponentPreview
      title="High-Performance Multi-Target Tracking"
      description={`Real-time tracking of ${totalTargets} targets with realistic physics-based movement. Each target has velocity, heading, and smooth trajectory changes. Demonstrates WebGPU acceleration rendering thousands of vertices at 60fps.`}
      code={`// Targets with realistic velocity and heading
interface TargetWithVelocity extends RadarDataPoint {
  heading: number;
  speed: number;
}

const [targets, setTargets] = useState<RadarSeries[]>(() => {
  const createTargets = (count: number, minSpeed: number, maxSpeed: number) =>
    Array.from({ length: count }, (_, i) => ({
      angle: Math.random() * 360,
      distance: 0.2 + Math.random() * 0.6,
      heading: Math.random() * 360,
      speed: minSpeed + Math.random() * (maxSpeed - minSpeed),
    }));

  return [
    { name: "Air Traffic", data: createTargets(80, 0.003, 0.008), color: "#3b82f6" },
    { name: "Ground Vehicles", data: createTargets(60, 0.001, 0.003), color: "#10b981" },
    { name: "Naval Vessels", data: createTargets(30, 0.0015, 0.004), color: "#f59e0b" },
  ];
});

// Realistic movement with smooth trajectory changes
useEffect(() => {
  const interval = setInterval(() => {
    setTargets(prev => prev.map(series => ({
      ...series,
      data: series.data.map(point => {
        const target = point as TargetWithVelocity;
        const newHeading = (target.heading + (Math.random() - 0.5) * 1.5) % 360;

        // Move in cartesian space for smooth motion
        const x = target.distance * Math.cos(target.angle * Math.PI / 180);
        const y = target.distance * Math.sin(target.angle * Math.PI / 180);
        const dx = target.speed * Math.cos(newHeading * Math.PI / 180);
        const dy = target.speed * Math.sin(newHeading * Math.PI / 180);

        return { ...target, angle: Math.atan2(y + dy, x + dx) * 180 / Math.PI };
      }),
    })));
  }, 50);
  return () => clearInterval(interval);
}, []);

<RadarChart
  series={targets}
  rings={8}
  sectors={24}
  showSweep={true}
  sweepSpeed={3}
  preferWebGPU={true}
  width={800}
  height={800}
/>`}
      preview={
        <div className="flex flex-col items-center justify-center space-y-4 w-full">
          <div style={{ width: "800px", height: "800px" }}>
            <RadarChart
              series={targets}
              rings={8}
              sectors={24}
              showSweep={true}
              sweepSpeed={3}
              preferWebGPU={true}
              width={800}
              height={800}
            />
          </div>
          <div className="flex gap-4 text-xs">
            {targets.map((series, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: series.color }}
                />
                <span className="text-zinc-400">
                  {series.name}: {series.data.length}
                </span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}

function PrimitiveExample() {
  const { color } = useColorScheme();

  return (
    <ComponentPreview
      title="Primitive Components"
      description="Build custom radar displays using primitive components for complete control"
      code={`import { RadarChart } from "@plexusui/components/charts/radar-chart";

const targets = [
  { angle: 45, distance: 0.6, label: "Alpha" },
  { angle: 135, distance: 0.8, label: "Bravo" },
  { angle: 225, distance: 0.4, label: "Charlie" },
  { angle: 315, distance: 0.7, label: "Delta" },
];

// Compose your own radar with primitives
<RadarChart.Root
  series={[{ name: "Contacts", data: targets, color: "#8b5cf6" }]}
  rings={4}
  sectors={8}
  showSweep={true}
  width={600}
  height={600}
  preferWebGPU={true}
>
  <RadarChart.Canvas />
  <RadarChart.Labels />
  <RadarChart.Tooltip />
</RadarChart.Root>`}
      preview={
        <div className="flex items-center justify-center p-8">
          <div style={{ width: "600px", height: "600px" }}>
            <RadarChart.Root
              series={[
                {
                  name: "Tactical Contacts",
                  data: [
                    {
                      angle: 45,
                      distance: 0.6,
                      label: "Alpha",
                      intensity: 0.9,
                    },
                    {
                      angle: 135,
                      distance: 0.8,
                      label: "Bravo",
                      intensity: 0.7,
                    },
                    {
                      angle: 225,
                      distance: 0.4,
                      label: "Charlie",
                      intensity: 0.85,
                    },
                    {
                      angle: 315,
                      distance: 0.7,
                      label: "Delta",
                      intensity: 0.75,
                    },
                  ],
                  color: color,
                },
              ]}
              rings={4}
              sectors={8}
              showSweep={true}
              sweepSpeed={2}
              width={600}
              height={600}
              preferWebGPU={true}
            >
              <RadarChart.Canvas />
              <RadarChart.Labels />
              <RadarChart.Tooltip />
            </RadarChart.Root>
          </div>
        </div>
      }
    />
  );
}

export function RadarChartExamples() {
  return (
    <div className="space-y-8">
      <HighPerformanceTracking />
      <SonarVisualization />
      <PrimitiveExample />
    </div>
  );
}
