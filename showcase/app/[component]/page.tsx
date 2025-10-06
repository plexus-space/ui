"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import CodePlayground from "@/components/CodePlayground";

const ComponentPreview = dynamic(
  () => import("@/components/ComponentPreview"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-zinc-500">Loading 3D preview...</div>
      </div>
    ),
  }
);

const components = [
  {
    id: "earth",
    name: "Earth",
    category: "Planetary Bodies",
    textures: [
      "/day.jpg",
      "/night.jpg",
      "/clouds.jpg",
      "/bump.jpg",
      "/ocean.png",
    ],
  },
  {
    id: "mars",
    name: "Mars",
    category: "Planetary Bodies",
    textures: ["/flat-mars.jpg"],
  },
  {
    id: "mercury",
    name: "Mercury",
    category: "Planetary Bodies",
    textures: ["/flat-mercury.png"],
  },
  {
    id: "venus",
    name: "Venus",
    category: "Planetary Bodies",
    textures: ["/flat-venus.jpg"],
  },
  {
    id: "moon",
    name: "Moon",
    category: "Planetary Bodies",
    textures: ["/moon.jpg"],
  },
  {
    id: "jupiter",
    name: "Jupiter",
    category: "Planetary Bodies",
    textures: ["/flat-jupiter.jpg"],
  },
  {
    id: "saturn",
    name: "Saturn",
    category: "Planetary Bodies",
    textures: ["/saturnmap.jpg"],
  },
  {
    id: "uranus",
    name: "Uranus",
    category: "Planetary Bodies",
    textures: ["/flat-uranus.jpg"],
  },
  {
    id: "neptune",
    name: "Neptune",
    category: "Planetary Bodies",
    textures: ["/flat-neptune.jpg"],
  },
  {
    id: "orbital-path",
    name: "Orbital Path",
    category: "Orbital Mechanics",
    description:
      "Draw elliptical orbits around planets using real Keplerian orbital elements. Essential for visualizing satellite trajectories.",
    textures: [],
  },
  {
    id: "solar-system",
    name: "Solar System",
    category: "Systems",
    description:
      "Complete solar system visualization with all 8 planets at astronomically accurate relative distances. Includes animated orbits and realistic planet sizes.",
    textures: [],
  },
  {
    id: "line-chart",
    name: "LineChart",
    category: "Charts",
    description:
      "Simple, animated line chart for plotting data over time. Includes automatic scaling, interactive hover tooltips, multi-series support, and smooth animations. Perfect for scientific data visualization.",
    textures: [],
  },
  {
    id: "xy-plot",
    name: "XYPlot",
    category: "Charts",
    description:
      "Scatter and parametric plot component for phase space diagrams, phase plots, and correlation analysis. Supports multiple point styles, density-based coloring, trendlines, and both linear and logarithmic scales. Essential for scientific data analysis.",
    textures: [],
  },
  {
    id: "polar-plot",
    name: "PolarPlot",
    category: "Charts",
    description:
      "Polar coordinate plotting for directional data visualization. Perfect for antenna radiation patterns, wind roses, and circular statistics. Supports filled areas, linear and logarithmic radial scales, configurable angular units (degrees/radians), and smooth animations.",
    textures: [],
  },
];

export default function ComponentPage() {
  const params = useParams();
  const componentId = params.component as string;
  const component = components.find((c) => c.id === componentId);
  const activeComponent = component || components[0];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-background">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-lg font-bold">Plexus UI</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-foreground transition-colors"
            >
              Getting Started
            </Link>

            {["Planetary Bodies", "Orbital Mechanics", "Systems", "Charts"].map(
              (category) => (
                <div key={category}>
                  <div className="mt-6 mb-2 px-3 text-xs font-semibold text-zinc-400 dark:text-zinc-600 uppercase tracking-wider">
                    {category}
                  </div>
                  {components
                    .filter((comp) => comp.category === category)
                    .map((comp) => (
                      <Link
                        key={comp.id}
                        href={`/${comp.id}`}
                        className={`block px-3 py-2 rounded transition-colors ${
                          comp.id === componentId
                            ? "bg-zinc-200 dark:bg-zinc-800 text-foreground font-medium"
                            : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-foreground"
                        }`}
                      >
                        {comp.name}
                      </Link>
                    ))}
                </div>
              )
            )}
          </div>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-5xl mx-auto p-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            {activeComponent.name}
          </h1>

          <p className="text-zinc-700 dark:text-zinc-300 mb-8 text-lg leading-relaxed">
            {activeComponent?.description || ""}
          </p>

          <section className="mb-12">
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden h-[500px]">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-zinc-500">Loading 3D preview...</div>
                  </div>
                }
              >
                <ComponentPreview componentId={componentId} />
              </Suspense>
            </div>
          </section>

          {/* Textures Download */}
          {activeComponent.textures.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Textures</h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Download the texture maps for {activeComponent.name}:
              </p>
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeComponent.textures.map((texture) => (
                    <a
                      key={texture}
                      href={texture}
                      download
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded text-sm text-zinc-700 dark:text-zinc-300 hover:text-foreground transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      {texture.split("/").pop()}
                    </a>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Installation
            </h2>
            <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
              <pre className="text-sm text-emerald-400">
                npx @plexusui/cli add {activeComponent.id}
              </pre>
            </div>
          </section>

          {/* Basic Usage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              {componentId === "line-chart" || componentId === "xy-plot" || componentId === "polar-plot"
                ? "Basic Usage"
                : "Composable Primitives"}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {componentId === "line-chart"
                ? "Simple line chart - just pass your data and labels:"
                : componentId === "xy-plot"
                ? "Create scatter plots with various point styles:"
                : componentId === "polar-plot"
                ? "Create polar plots for directional data - perfect for antenna patterns:"
                : "Components are built from composable primitives - use the high-level component or mix and match the building blocks:"}
            </p>
            <CodePlayground
              title="basic-usage.tsx"
              initialCode={
                componentId === "polar-plot"
                  ? `import { PolarPlot } from '@/components/plexusui/polar-plot'

function App() {
  // Antenna radiation pattern (cardioid)
  const antennaData = [];
  for (let angle = 0; angle <= 360; angle += 10) {
    const theta = (angle * Math.PI) / 180;
    const gain = 10 * (1 + Math.cos(theta));
    antennaData.push({ angle, radius: gain });
  }

  return (
    <PolarPlot
      series={[{
        name: "Antenna Pattern",
        data: antennaData,
        color: "#0ea5e9",
        filled: true
      }]}
      radialAxis={{ label: "Gain (dBi)" }}
      angularAxis={{ unit: "degrees" }}
    />
  )
}`
                  : componentId === "xy-plot"
                  ? `import { XYPlot } from '@/components/plexusui/xy-plot'

function App() {
  // Generate phase space data (position vs velocity)
  const data = Array.from({ length: 100 }, (_, i) => {
    const t = (i / 100) * Math.PI * 4;
    return {
      x: Math.cos(t) * Math.exp(-t / 10),
      y: -Math.sin(t) * Math.exp(-t / 10)
    };
  });

  return (
    <XYPlot
      data={data}
      xAxis={{ label: "Position" }}
      yAxis={{ label: "Velocity" }}
      pointStyle="circle"
      pointSize={3}
      color="#3b82f6"
    />
  )
}`
                  : componentId === "line-chart"
                  ? `import { LineChart } from '@/components/plexusui/line-chart'

function App() {
  const data = [
    { x: 0, y: 20 },
    { x: 1, y: 22 },
    { x: 2, y: 19 },
    { x: 3, y: 24 },
    { x: 4, y: 21 }
  ];

  return (
    <LineChart
      series={[
        {
          name: "Temperature",
          data,
          color: "#ef4444"
        }
      ]}
      xAxis={{ label: "Time (s)" }}
      yAxis={{ label: "Temp (°C)" }}
    />
  )
}`
                  : componentId === "gantt"
                  ? `import { Gantt } from '@/components/plexusui/gantt'

function App() {
  const groups = [{
    id: 'station-1',
    label: 'Ground Station Alpha',
    sublabel: 'Alaska',
    tasks: [{
      id: 'pass-1',
      label: 'ISS',
      startTime: Date.now() + 1000 * 60 * 30,
      endTime: Date.now() + 1000 * 60 * 45,
      priority: 'high'
    }]
  }];

  return (
    <Gantt
      groups={groups}
      onTaskClick={(taskId) => console.log(taskId)}
    />
  )
}`
                  : componentId === "earth"
                  ? `import { Earth, calculateSunPosition } from '@/components/plexusui/earth'

function App() {
  // Get current day of year (1-365)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  // Calculate astronomically accurate Sun position
  const sunPos = calculateSunPosition(dayOfYear);

  return (
    <Earth
      dayMapUrl="/textures/earth-day.jpg"
      cloudsMapUrl="/textures/earth-clouds.jpg"
      enableRotation={true}
      sunPosition={sunPos}
      brightness={1.2}
      // Automatically uses:
      // - Realistic 24-hour rotation
      // - 23.4397° axial tilt
      // - Accurate Sun color temperature
    />
  )
}`
                  : `import { ${activeComponent.name} } from '@/components/plexusui/${activeComponent.id}'

function App() {
  return (
    <${activeComponent.name}
      textureUrl="/textures/${activeComponent.id}.jpg"
      enableRotation={true}
      brightness={1.0}
    />
  )
}`
              }
            />
          </section>

          {/* Additional Examples for polar-plot */}
          {componentId === "polar-plot" && (
            <>
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  Multiple Series
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Compare multiple radiation patterns or directional data:
                </p>
                <CodePlayground
                  title="multiple-series.tsx"
                  initialCode={`import { PolarPlot } from '@/components/plexusui/polar-plot'

function App() {
  // Generate two antenna patterns
  const pattern1 = [];
  const pattern2 = [];

  for (let angle = 0; angle <= 360; angle += 10) {
    const theta = (angle * Math.PI) / 180;
    pattern1.push({
      angle,
      radius: 10 * (1 + Math.cos(theta))
    });
    pattern2.push({
      angle,
      radius: 8 * (1 + 0.5 * Math.cos(2 * theta))
    });
  }

  return (
    <PolarPlot
      series={[
        {
          name: "Cardioid",
          data: pattern1,
          color: "#0ea5e9",
          filled: true
        },
        {
          name: "Four-Lobe",
          data: pattern2,
          color: "#f59e0b",
          filled: true
        }
      ]}
      radialAxis={{ label: "Gain (dBi)" }}
      angularAxis={{ unit: "degrees" }}
    />
  )
}`}
                />
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  Logarithmic Scale
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Use logarithmic radial scale for wide dynamic range:
                </p>
                <CodePlayground
                  title="log-scale.tsx"
                  initialCode={`import { PolarPlot } from '@/components/plexusui/polar-plot'

function App() {
  // Generate data with wide range
  const data = [];
  for (let angle = 0; angle <= 360; angle += 10) {
    const theta = (angle * Math.PI) / 180;
    const power = Math.pow(10, 1 + Math.cos(theta));
    data.push({ angle, radius: power });
  }

  return (
    <PolarPlot
      series={[{
        name: "RF Power",
        data,
        color: "#ef4444",
        strokeWidth: 2.5
      }]}
      radialAxis={{
        label: "Power (W)",
        scale: "log"
      }}
      angularAxis={{ unit: "degrees" }}
    />
  )
}`}
                />
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  Wind Rose Example
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Visualize wind direction and speed distribution:
                </p>
                <CodePlayground
                  title="wind-rose.tsx"
                  initialCode={`import { PolarPlot } from '@/components/plexusui/polar-plot'

function App() {
  // Wind speed data by direction (16 compass points)
  const windData = [
    { angle: 0, radius: 15 },    // N
    { angle: 22.5, radius: 12 },
    { angle: 45, radius: 8 },    // NE
    { angle: 67.5, radius: 5 },
    { angle: 90, radius: 10 },   // E
    { angle: 112.5, radius: 18 },
    { angle: 135, radius: 22 },  // SE
    { angle: 157.5, radius: 20 },
    { angle: 180, radius: 25 },  // S
    { angle: 202.5, radius: 23 },
    { angle: 225, radius: 18 },  // SW
    { angle: 247.5, radius: 14 },
    { angle: 270, radius: 12 },  // W
    { angle: 292.5, radius: 9 },
    { angle: 315, radius: 11 },  // NW
    { angle: 337.5, radius: 13 },
    { angle: 360, radius: 15 }   // N (close)
  ];

  return (
    <PolarPlot
      series={[{
        name: "Wind Speed",
        data: windData,
        color: "#10b981",
        filled: true,
        strokeWidth: 2
      }]}
      radialAxis={{ label: "Speed (km/h)" }}
      angularAxis={{
        unit: "degrees",
        startAngle: 90,  // North at top
        direction: "clockwise"
      }}
    />
  )
}`}
                />
              </section>
            </>
          )}

          {/* Using Root Primitives */}
          {componentId !== "line-chart" && componentId !== "xy-plot" && componentId !== "polar-plot" && (
            <>
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  Using Root Primitives
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  For maximum control, use the root primitive with your own
                  scene setup:
                </p>
                <CodePlayground
                  title="root-primitives.tsx"
                  initialCode={
                    componentId === "gantt"
                      ? `import { GanttTimelineRoot, GanttHeaderRoot } from '@/components/plexusui/gantt'

function App() {
  const timeWindowStart = Date.now();
  const timeWindowEnd = timeWindowStart + 12 * 60 * 60 * 1000;

  return (
    <div>
      <GanttHeaderRoot
        timeWindowStart={timeWindowStart}
        timeWindowEnd={timeWindowEnd}
        divisions={12}
      />
      <GanttTimelineRoot
        group={myGroup}
        timeWindowStart={timeWindowStart}
        timeWindowEnd={timeWindowEnd}
      />
    </div>
  )
}`
                      : `import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { ${
                          activeComponent.name
                        }SphereRoot, ${activeComponent.name.toUpperCase()}_RADIUS } from '@/components/plexusui/${
                          activeComponent.id
                        }'

function App() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} />

      <${activeComponent.name}SphereRoot
        radius={${activeComponent.name.toUpperCase()}_RADIUS}
        textureUrl="/textures/${activeComponent.id}.jpg"
        enableRotation={true}
      />

      <OrbitControls />
    </Canvas>
  )
}`
                  }
                />
              </section>

              {/* Using Scene Primitives */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  Using Scene Primitives
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  The scene primitive includes{" "}
                  {componentId === "gantt"
                    ? "container styling and layout"
                    : "Canvas, lights, and controls"}
                  :
                </p>
                <CodePlayground
                  title="scene-primitives.tsx"
                  initialCode={
                    componentId === "gantt"
                      ? `import { GanttScene, GanttTimelineRoot } from '@/components/plexusui/gantt'

function App() {
  return (
    <GanttScene title="Mission Timeline">
      {/* Your timeline rows */}
      <GanttTimelineRoot
        group={group1}
        timeWindowStart={start}
        timeWindowEnd={end}
      />
      <GanttTimelineRoot
        group={group2}
        timeWindowStart={start}
        timeWindowEnd={end}
      />
    </GanttScene>
  )
}`
                      : `import { ${activeComponent.name}Scene, ${activeComponent.name}SphereRoot } from '@/components/plexusui/${activeComponent.id}'

function App() {
  return (
    <${activeComponent.name}Scene
      cameraPosition={[0, 0, 15000]}
      brightness={1.5}
    >
      <${activeComponent.name}SphereRoot
        radius={6371}
        textureUrl="/textures/${activeComponent.id}.jpg"
      />

      {/* Add custom meshes */}
      <mesh position={[0, 8000, 0]}>
        <sphereGeometry args={[500, 32, 32]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </${activeComponent.name}Scene>
  )
}`
                  }
                />
              </section>
            </>
          )}

          {/* Additional Examples */}
          {componentId === "xy-plot" && (
            <>
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  Density Coloring
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Visualize point density with automatic color mapping:
                </p>
                <CodePlayground
                  title="density-coloring.tsx"
                  initialCode={`import { XYPlot } from '@/components/plexusui/xy-plot'

function App() {
  // Generate clustered data
  const data = [
    ...Array.from({ length: 50 }, () => ({
      x: Math.random() * 2 + 1,
      y: Math.random() * 2 + 1
    })),
    ...Array.from({ length: 50 }, () => ({
      x: Math.random() * 2 - 3,
      y: Math.random() * 2 - 3
    }))
  ];

  return (
    <XYPlot
      data={data}
      xAxis={{ label: "X Position" }}
      yAxis={{ label: "Y Position" }}
      color="density"
      pointStyle="circle"
      pointSize={4}
    />
  )
}`}
                />
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  Point Styles & Trendline
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Use different point styles and add linear regression:
                </p>
                <CodePlayground
                  title="point-styles.tsx"
                  initialCode={`import { XYPlot } from '@/components/plexusui/xy-plot'

function App() {
  const data = Array.from({ length: 30 }, (_, i) => ({
    x: i,
    y: 2 * i + Math.random() * 10 - 5
  }));

  return (
    <XYPlot
      data={data}
      xAxis={{ label: "Independent Variable" }}
      yAxis={{ label: "Dependent Variable" }}
      pointStyle="diamond"
      pointSize={4}
      color="#ef4444"
      showTrendline={{
        show: true,
        color: "#3b82f6",
        dashed: true
      }}
    />
  )
}`}
                />
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-foreground">
                  Custom Coloring
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                  Color points dynamically based on data:
                </p>
                <CodePlayground
                  title="custom-coloring.tsx"
                  initialCode={`import { XYPlot } from '@/components/plexusui/xy-plot'

function App() {
  const data = Array.from({ length: 100 }, (_, i) => ({
    x: Math.random() * 10 - 5,
    y: Math.random() * 10 - 5
  }));

  return (
    <XYPlot
      data={data}
      xAxis={{ label: "X" }}
      yAxis={{ label: "Y" }}
      pointStyle="circle"
      pointSize={3}
      color={(point) => {
        // Color by quadrant
        if (point.x > 0 && point.y > 0) return "#22c55e";
        if (point.x < 0 && point.y > 0) return "#3b82f6";
        if (point.x < 0 && point.y < 0) return "#ef4444";
        return "#f59e0b";
      }}
    />
  )
}`}
                />
              </section>
            </>
          )}

          {/* Multiple Series Example for line-chart */}
          {componentId === "line-chart" && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Multiple Series
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Plot multiple lines on the same chart:
              </p>
              <CodePlayground
                title="multiple-series.tsx"
                initialCode={`import { LineChart } from '@/components/plexusui/line-chart'

function App() {
  return (
    <LineChart
      series={[
        {
          name: "CPU Usage",
          data: [
            { x: 0, y: 45 },
            { x: 1, y: 52 },
            { x: 2, y: 48 },
            { x: 3, y: 61 }
          ],
          color: "#3b82f6",
          strokeWidth: 2.5
        },
        {
          name: "Memory",
          data: [
            { x: 0, y: 30 },
            { x: 1, y: 35 },
            { x: 2, y: 33 },
            { x: 3, y: 38 }
          ],
          color: "#ef4444",
          dashed: true
        }
      ]}
      xAxis={{ label: "Time (s)" }}
      yAxis={{ label: "Usage (%)" }}
    />
  )
}`}
              />
            </section>
          )}

          {/* Physical Constants / Utilities */}
          {componentId !== "gantt" && componentId !== "line-chart" && componentId !== "xy-plot" ? (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                {componentId === "earth"
                  ? "Constants & Utilities"
                  : "Physical Constants"}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                {componentId === "earth"
                  ? "Astronomical constants and utility functions for realistic simulations:"
                  : "Each package exports real astronomical data:"}
              </p>
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
                <pre className="text-sm overflow-x-auto text-zinc-700 dark:text-zinc-300">
                  <code>
                    {componentId === "earth"
                      ? `import {
  // Physical Constants
  EARTH_RADIUS,              // 6371 km (scene units)
  EARTH_REAL_RADIUS_KM,      // 6371 km
  EARTH_ROTATION_PERIOD,     // 1 Earth day
  EARTH_ORBITAL_PERIOD,      // 365.25 Earth days
  EARTH_DIAMETER_KM,         // 12742 km
  EARTH_AXIAL_TILT,          // 23.4397° (obliquity)
  ASTRONOMICAL_UNIT_KM,      // 149597870.7 km (Earth-Sun distance)

  // Utility Functions
  calculateSunPosition,      // Get Sun position for any day of year
  calculateRotationSpeed,    // Create time-lapse effects
} from '@plexusui/earth'

// Examples:
const sunPos = calculateSunPosition(172);        // Summer solstice
const fastRotation = calculateRotationSpeed(86400); // 1 day/second`
                      : `import {
  ${activeComponent.name.toUpperCase()}_RADIUS,           // Radius in km
  ${activeComponent.name.toUpperCase()}_REAL_RADIUS_KM,   // Real radius
  ${activeComponent.name.toUpperCase()}_ROTATION_PERIOD,  // Rotation period
  ${activeComponent.name.toUpperCase()}_ORBITAL_PERIOD,   // Orbital period
  ${activeComponent.name.toUpperCase()}_DIAMETER_KM       // Diameter in km
} from '@/components/ui/${activeComponent.id}'`}
                  </code>
                </pre>
              </div>
            </section>
          ) : (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Utilities
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                The package exports helpful utility functions:
              </p>
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4">
                <pre className="text-sm overflow-x-auto text-zinc-700 dark:text-zinc-300">
                  <code>{`import { GanttUtils } from '@/components/ui/gantt'

// Get time window
const { start, end } = GanttUtils.getTimeWindow(12 * 60 * 60 * 1000);

// Format timestamps
GanttUtils.formatHHMM(Date.now());      // "14:30"
GanttUtils.formatDate(Date.now());       // "1/15/2025"
GanttUtils.formatDateTime(Date.now());   // "1/15/2025, 2:30 PM"`}</code>
                </pre>
              </div>
            </section>
          )}

          {/* Props */}
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Props</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">
                  {activeComponent.name} Component Props
                </h3>
                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-200/50 dark:bg-black/50">
                      <tr className="border-b border-zinc-200 dark:border-zinc-800">
                        <th className="text-left p-3 font-semibold">Prop</th>
                        <th className="text-left p-3 font-semibold">Type</th>
                        <th className="text-left p-3 font-semibold">Default</th>
                        <th className="text-left p-3 font-semibold">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {componentId === "earth" ? (
                        <>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">dayMapUrl</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">string</td>
                            <td className="p-3 text-zinc-500">optional</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Day texture URL
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">
                              cloudsMapUrl
                            </td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">string</td>
                            <td className="p-3 text-zinc-500">optional</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Clouds texture URL
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">
                              enableRotation
                            </td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">boolean</td>
                            <td className="p-3 text-zinc-500">true</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Enable realistic 24h rotation
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">
                              rotationSpeed
                            </td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">realistic</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Rotation speed (rad/sec)
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">axialTilt</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">23.4397°</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Earth's axial tilt
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">
                              sunPosition
                            </td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">[x,y,z]</td>
                            <td className="p-3 text-zinc-500">[150000,0,0]</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Sun light position
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 text-emerald-400">brightness</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">1.2</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Scene brightness
                            </td>
                          </tr>
                        </>
                      ) : componentId === "polar-plot" ? (
                        <>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">series</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">PolarSeries[]</td>
                            <td className="p-3 text-zinc-500">required</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Array of polar data series
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">radialAxis</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">RadialAxis</td>
                            <td className="p-3 text-zinc-500">{"{}"}</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Radial axis config (label, domain, scale)
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">angularAxis</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">AngularAxis</td>
                            <td className="p-3 text-zinc-500">{"{}"}</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Angular axis config (unit, startAngle, direction)
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">showGrid</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">boolean | GridConfig</td>
                            <td className="p-3 text-zinc-500">true</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Show grid (radial, angular, or both)
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">showLegend</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">boolean</td>
                            <td className="p-3 text-zinc-500">true</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Show legend
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">animate</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">boolean</td>
                            <td className="p-3 text-zinc-500">true</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Enable animations
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">symmetry</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">SymmetryType</td>
                            <td className="p-3 text-zinc-500">"none"</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              none | mirror | rotational
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 text-emerald-400">width / height</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">600 / 600</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Plot dimensions in pixels
                            </td>
                          </tr>
                        </>
                      ) : componentId === "xy-plot" ? (
                        <>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">data</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">Point[]</td>
                            <td className="p-3 text-zinc-500">required</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Array of {"{"} x, y {"}"} points
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">xAxis</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">Axis</td>
                            <td className="p-3 text-zinc-500">{"{}"}</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              X-axis config (label, domain, scale)
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">yAxis</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">Axis</td>
                            <td className="p-3 text-zinc-500">{"{}"}</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Y-axis config (label, domain, scale)
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">pointStyle</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">PointStyle</td>
                            <td className="p-3 text-zinc-500">"circle"</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              circle | cross | plus | square | diamond | triangle
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">pointSize</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">3</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Point size in pixels
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">color</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">ColorMapping</td>
                            <td className="p-3 text-zinc-500">"#3b82f6"</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              string | "density" | function
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">showTrendline</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">boolean | Trendline</td>
                            <td className="p-3 text-zinc-500">false</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Show linear regression trendline
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">showGrid</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">boolean</td>
                            <td className="p-3 text-zinc-500">true</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Show grid lines
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">animate</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">boolean</td>
                            <td className="p-3 text-zinc-500">true</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Enable animations
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 text-emerald-400">width / height</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">800 / 400</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Plot dimensions in pixels
                            </td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">textureUrl</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">string</td>
                            <td className="p-3 text-zinc-500">required</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              URL to texture
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <td className="p-3 text-emerald-400">
                              enableRotation
                            </td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">boolean</td>
                            <td className="p-3 text-zinc-500">true</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Enable auto-rotation
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 text-emerald-400">brightness</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">1.0</td>
                            <td className="p-3 text-zinc-600 dark:text-zinc-400">
                              Scene brightness
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
