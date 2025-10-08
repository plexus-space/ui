"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import CodePlayground from "@/components/code-playground";
import { components } from "@/constants/components";

const ComponentPreview = dynamic(
  () => import("@/components/component-preview"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-zinc-500">Loading 3D preview...</div>
      </div>
    ),
  }
);

export default function ComponentPage() {
  const params = useParams();
  const componentId = params.component as string;
  const component = components.find((c) => c.id === componentId);
  const activeComponent = component || components[0];

  return (
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
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Textures
            </h2>
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
            {componentId === "line-chart" ||
            componentId === "xy-plot" ||
            componentId === "polar-plot" ||
            componentId === "histogram" ||
            componentId === "heatmap"
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
              : componentId === "histogram"
              ? "Visualize data distributions with automatic binning:"
              : componentId === "heatmap"
              ? "Visualize 2D data matrices with beautiful scientific colormaps:"
              : "Components are built from composable primitives - use the high-level component or mix and match the building blocks:"}
          </p>
          <CodePlayground
            title="basic-usage.tsx"
            initialCode={
              componentId === "heatmap"
                ? `import { Heatmap } from '@/components/plexusui/heatmap'

function App() {
  // Generate sensor temperature data
  const tempData = [
    [22.3, 23.1, 24.5, 25.8, 26.2],
    [21.8, 22.9, 24.1, 25.3, 25.9],
    [21.2, 22.3, 23.7, 24.9, 25.4],
    [20.9, 21.7, 23.2, 24.4, 25.1],
  ];

  const times = ["8:00", "10:00", "12:00", "14:00", "16:00"];
  const zones = ["Zone A", "Zone B", "Zone C", "Zone D"];

  return (
    <Heatmap
      data={tempData}
      xLabels={times}
      yLabels={zones}
      xAxisLabel="Time of Day"
      yAxisLabel="Facility Zone"
      showValues
      valueFormat=".1f"
      showColorScale
    />
  )
}`
                : componentId === "histogram"
                ? `import { Histogram } from '@/components/plexusui/histogram'

function App() {
  // Generate measurement data
  const measurements = Array.from({ length: 200 }, () => {
    // Normal distribution using Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return 50 + z * 10;
  });

  return (
    <Histogram
      data={measurements}
      bins="auto"
      xAxis={{ label: "Measurement Value" }}
      yAxis={{ label: "Frequency" }}
      color="#3b82f6"
    />
  )
}`
                : componentId === "polar-plot"
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

        {componentId === "histogram" && (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Density & Normal Overlay
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Show density distribution with theoretical normal curve overlay:
              </p>
              <CodePlayground
                title="density-normal.tsx"
                initialCode={`import { Histogram } from '@/components/plexusui/histogram'

function App() {
  const measurements = generateNormalData(100, 50, 10);

  return (
    <Histogram
      data={measurements}
      bins="freedman-diaconis"
      showDensity={true}
      showNormal={{
        mean: 50,
        stdDev: 10,
        color: "#ef4444"
      }}
      xAxis={{ label: "Value" }}
      yAxis={{ label: "Density" }}
      color="#3b82f6"
      showLegend={true}
    />
  )
}`}
              />
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Binning Algorithms
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Choose from scientifically-validated binning methods:
              </p>
              <CodePlayground
                title="binning-methods.tsx"
                initialCode={`import { Histogram } from '@/components/plexusui/histogram'

function App() {
  const data = generateData();

  return (
    <Histogram
      data={data}
      bins="sturges"  // "auto" | "sturges" | "scott" | "freedman-diaconis" | "sqrt" | number
      xAxis={{ label: "Value" }}
      yAxis={{ label: "Count" }}
    />
  )
}

// Binning algorithms:
// - "sturges": Good for normal data, k = ceil(log2(n) + 1)
// - "scott": Scott's rule, optimal for normal data
// - "freedman-diaconis": Robust to outliers, uses IQR
// - "sqrt": Simple rule, k = sqrt(n)
// - "auto": Chooses best method based on data size
// - number: Specify exact bin count`}
              />
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Cumulative Distribution
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Show cumulative distribution function (CDF):
              </p>
              <CodePlayground
                title="cumulative.tsx"
                initialCode={`import { Histogram } from '@/components/plexusui/histogram'

function App() {
  const data = generateData();

  return (
    <Histogram
      data={data}
      bins={20}
      cumulative={true}
      normalize={true}
      xAxis={{ label: "Value" }}
      yAxis={{ label: "Cumulative Probability" }}
      color="#10b981"
    />
  )
}`}
              />
            </section>
          </>
        )}

        {/* Additional Examples for heatmap */}
        {componentId === "heatmap" && (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                With Values Displayed
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Display numeric values directly in cells with automatic text
                color adjustment:
              </p>
              <CodePlayground
                title="show-values.tsx"
                initialCode={`import { Heatmap } from '@/components/plexusui/heatmap'

function App() {
  // Quality control data (defect rates %)
  const defectData = [
    [0.5, 0.8, 1.2, 0.9, 0.6],
    [1.1, 1.5, 1.8, 1.3, 1.0],
    [0.3, 0.4, 0.7, 0.5, 0.4],
    [2.1, 2.4, 2.8, 2.5, 2.2],
  ];

  const shifts = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const lines = ["Line 1", "Line 2", "Line 3", "Line 4"];

  return (
    <Heatmap
      data={defectData}
      xLabels={shifts}
      yLabels={lines}
      xAxisLabel="Day of Week"
      yAxisLabel="Production Line"
      showValues
      valueFormat=".1f"
      showColorScale
    />
  )
}`}
              />
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Custom Value Formatting
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Format cell values with custom functions or format strings:
              </p>
              <CodePlayground
                title="formatting.tsx"
                initialCode={`import { Heatmap } from '@/components/plexusui/heatmap'

function App() {
  // Power consumption data (kW)
  const powerData = [
    [2.3, 3.1, 5.2, 8.4, 12.1, 14.8, 13.2, 9.5, 6.8, 4.2, 3.1, 2.5],
    [1.8, 2.5, 4.8, 7.9, 11.5, 14.2, 12.8, 9.1, 6.3, 3.9, 2.8, 2.1],
    [2.1, 2.9, 5.0, 8.1, 11.8, 14.5, 13.0, 9.3, 6.5, 4.0, 3.0, 2.3],
  ];

  const hours = ["12a", "2a", "4a", "6a", "8a", "10a", "12p", "2p", "4p", "6p", "8p", "10p"];
  const buildings = ["Building A", "Building B", "Building C"];

  return (
    <Heatmap
      data={powerData}
      xLabels={hours}
      yLabels={buildings}
      xAxisLabel="Time of Day"
      yAxisLabel="Facility"
      showValues
      valueFormat={(val) => \`\${val.toFixed(1)}kW\`}
      width={900}
    />
  )
}`}
              />
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Large Dataset
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Efficiently visualize large 2D datasets with adjustable cell
                padding:
              </p>
              <CodePlayground
                title="large-dataset.tsx"
                initialCode={`import { Heatmap } from '@/components/plexusui/heatmap'

function App() {
  // Generate 20x30 spatial distribution
  const spatialData = Array.from({ length: 20 }, (_, i) =>
    Array.from({ length: 30 }, (_, j) => {
      const x = j / 30;
      const y = i / 20;
      return Math.exp(-((x - 0.5) ** 2 + (y - 0.5) ** 2) / 0.1) * 100;
    })
  );

  return (
    <Heatmap
      data={spatialData}
      showColorScale
      showValues={false}
      cellPadding={1}  // Minimal padding for dense data
      width={900}
      height={600}
    />
  )
}`}
              />
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Adjustable Cell Spacing
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                Control the spacing between cells for different visual styles:
              </p>
              <CodePlayground
                title="cell-spacing.tsx"
                initialCode={`import { Heatmap } from '@/components/plexusui/heatmap'

function App() {
  // Network latency matrix (ms)
  const latencyData = [
    [0, 12, 45, 78, 102],
    [12, 0, 34, 67, 91],
    [45, 34, 0, 29, 58],
    [78, 67, 29, 0, 33],
    [102, 91, 58, 33, 0],
  ];

  const nodes = ["Node 1", "Node 2", "Node 3", "Node 4", "Node 5"];

  return (
    <Heatmap
      data={latencyData}
      xLabels={nodes}
      yLabels={nodes}
      xAxisLabel="Destination"
      yAxisLabel="Source"
      showValues
      valueFormat=".0f"
      cellPadding={4}  // More spacing for clearer separation
      showColorScale
    />
  )
}`}
              />
            </section>
          </>
        )}

        {componentId !== "line-chart" &&
          componentId !== "xy-plot" &&
          componentId !== "polar-plot" &&
          componentId !== "histogram" &&
          componentId !== "heatmap" && (
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
        {componentId !== "gantt" &&
        componentId !== "line-chart" &&
        componentId !== "xy-plot" &&
        componentId !== "histogram" ? (
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
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string
                          </td>
                          <td className="p-3 text-zinc-500">optional</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Day texture URL
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">cloudsMapUrl</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string
                          </td>
                          <td className="p-3 text-zinc-500">optional</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Clouds texture URL
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">
                            enableRotation
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Enable realistic 24h rotation
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">
                            rotationSpeed
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
                          <td className="p-3 text-zinc-500">realistic</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Rotation speed (rad/sec)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">axialTilt</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
                          <td className="p-3 text-zinc-500">23.4397°</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Earth's axial tilt
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">sunPosition</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            [x,y,z]
                          </td>
                          <td className="p-3 text-zinc-500">[150000,0,0]</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Sun light position
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 text-emerald-400">brightness</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
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
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            PolarSeries[]
                          </td>
                          <td className="p-3 text-zinc-500">required</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Array of polar data series
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">radialAxis</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            RadialAxis
                          </td>
                          <td className="p-3 text-zinc-500">{"{}"}</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Radial axis config (label, domain, scale)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">angularAxis</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            AngularAxis
                          </td>
                          <td className="p-3 text-zinc-500">{"{}"}</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Angular axis config (unit, startAngle, direction)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">showGrid</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean | GridConfig
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Show grid (radial, angular, or both)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">showLegend</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Show legend
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">animate</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Enable animations
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">symmetry</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            SymmetryType
                          </td>
                          <td className="p-3 text-zinc-500">"none"</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            none | mirror | rotational
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 text-emerald-400">
                            width / height
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
                          <td className="p-3 text-zinc-500">600 / 600</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Plot dimensions in pixels
                          </td>
                        </tr>
                      </>
                    ) : componentId === "heatmap" ? (
                      <>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">data</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number[][]
                          </td>
                          <td className="p-3 text-zinc-500">required</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            2D array of values (rows × columns)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">xLabels</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string[]
                          </td>
                          <td className="p-3 text-zinc-500">optional</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            X-axis labels (one per column)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">yLabels</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string[]
                          </td>
                          <td className="p-3 text-zinc-500">optional</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Y-axis labels (one per row)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">xAxisLabel</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string
                          </td>
                          <td className="p-3 text-zinc-500">optional</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            X-axis title
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">yAxisLabel</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string
                          </td>
                          <td className="p-3 text-zinc-500">optional</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Y-axis title
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">colormap</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            "greens"
                          </td>
                          <td className="p-3 text-zinc-500">"greens"</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Green gradient colormap (light to dark green)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">cellPadding</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
                          <td className="p-3 text-zinc-500">2</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Padding between cells in pixels
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">showValues</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">false</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Display values in cells
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">valueFormat</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string | function
                          </td>
                          <td className="p-3 text-zinc-500">auto</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Value format (".2f", ".1e") or custom function
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">
                            showColorScale
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Show color scale legend
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">domain</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            [number, number] | "auto"
                          </td>
                          <td className="p-3 text-zinc-500">"auto"</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Min/max values for color scaling
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">
                            cellBorderWidth
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
                          <td className="p-3 text-zinc-500">0</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Cell border width in pixels
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">
                            cellBorderColor
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string
                          </td>
                          <td className="p-3 text-zinc-500">
                            "rgba(255,255,255,0.1)"
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Cell border color
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">animate</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Enable animations
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 text-emerald-400">
                            width / height
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
                          <td className="p-3 text-zinc-500">800 / 500</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Chart dimensions in pixels
                          </td>
                        </tr>
                      </>
                    ) : componentId === "histogram" ? (
                      <>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">data</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number[]
                          </td>
                          <td className="p-3 text-zinc-500">required</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Array of numeric data values
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">bins</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            BinningMethod
                          </td>
                          <td className="p-3 text-zinc-500">"auto"</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            "auto" | "sturges" | "scott" | "freedman-diaconis" |
                            "sqrt" | number
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">showDensity</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">false</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Show density instead of counts
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">showNormal</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            NormalOverlay
                          </td>
                          <td className="p-3 text-zinc-500">undefined</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Normal distribution overlay {"{"}mean, stdDev, color
                            {"}"}
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">cumulative</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">false</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Show cumulative distribution
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">normalize</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">false</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Normalize counts to sum to 1
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">xAxis</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Axis
                          </td>
                          <td className="p-3 text-zinc-500">{"{}"}</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            X-axis config (label, domain, formatter)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">yAxis</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Axis
                          </td>
                          <td className="p-3 text-zinc-500">{"{}"}</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Y-axis config (label, domain, formatter)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">color</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string
                          </td>
                          <td className="p-3 text-zinc-500">"#3b82f6"</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Bar color
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">showGrid</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Show grid lines
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">showLegend</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">false</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Show legend
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">animate</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Enable animations
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 text-emerald-400">
                            width / height
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
                          <td className="p-3 text-zinc-500">800 / 400</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Chart dimensions in pixels
                          </td>
                        </tr>
                      </>
                    ) : componentId === "xy-plot" ? (
                      <>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">data</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Point[]
                          </td>
                          <td className="p-3 text-zinc-500">required</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Array of {"{"} x, y {"}"} points
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">xAxis</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Axis
                          </td>
                          <td className="p-3 text-zinc-500">{"{}"}</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            X-axis config (label, domain, scale)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">yAxis</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Axis
                          </td>
                          <td className="p-3 text-zinc-500">{"{}"}</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Y-axis config (label, domain, scale)
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">pointStyle</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            PointStyle
                          </td>
                          <td className="p-3 text-zinc-500">"circle"</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            circle | cross | plus | square | diamond | triangle
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">pointSize</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
                          <td className="p-3 text-zinc-500">3</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Point size in pixels
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">color</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            ColorMapping
                          </td>
                          <td className="p-3 text-zinc-500">"#3b82f6"</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string | "density" | function
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">
                            showTrendline
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean | Trendline
                          </td>
                          <td className="p-3 text-zinc-500">false</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Show linear regression trendline
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">showGrid</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Show grid lines
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">animate</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Enable animations
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 text-emerald-400">
                            width / height
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
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
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            string
                          </td>
                          <td className="p-3 text-zinc-500">required</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            URL to texture
                          </td>
                        </tr>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <td className="p-3 text-emerald-400">
                            enableRotation
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            boolean
                          </td>
                          <td className="p-3 text-zinc-500">true</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            Enable auto-rotation
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 text-emerald-400">brightness</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            number
                          </td>
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
  );
}
