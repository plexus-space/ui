"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useState, useMemo } from "react";
import { Earth, EARTH_RADIUS } from "../../components/earth";
import { MarsSphereRoot, MARS_RADIUS } from "../../components/mars";
import { MercurySphereRoot, MERCURY_RADIUS } from "../../components/mercury";
import { VenusSphereRoot, VENUS_RADIUS } from "../../components/venus";
import { MoonSphereRoot, MOON_RADIUS } from "../../components/moon";
import { JupiterSphereRoot, JUPITER_RADIUS } from "../../components/jupiter";
import { SaturnSphereRoot, SATURN_RADIUS } from "../../components/saturn";
import { UranusSphereRoot, URANUS_RADIUS } from "../../components/uranus";
import { NeptuneSphereRoot, NEPTUNE_RADIUS } from "../../components/neptune";
import { OrbitalPathRoot } from "../../components/orbital-path";
import { SolarSystem } from "../../components/solar-system";
import { LineChart } from "../../components/line-chart";
import { XYPlot } from "../../components/xy-plot";
import { PolarPlot } from "../../components/polar-plot";
import { Histogram } from "../../components/histogram";
import { Heatmap } from "../../components/heatmap";

interface ComponentPreviewProps {
  componentId: string;
}

// Planet configuration with realistic scales
const planetConfigs: Record<
  string,
  { radius: number; textureUrl: string; Component: any }
> = {
  earth: {
    radius: EARTH_RADIUS,
    textureUrl: "/day.jpg",
    Component: Earth,
  },
  mars: {
    radius: MARS_RADIUS,
    textureUrl: "/flat-mars.jpg",
    Component: MarsSphereRoot,
  },
  mercury: {
    radius: MERCURY_RADIUS,
    textureUrl: "/flat-mercury.png",
    Component: MercurySphereRoot,
  },
  venus: {
    radius: VENUS_RADIUS,
    textureUrl: "/flat-venus.jpg",
    Component: VenusSphereRoot,
  },
  moon: {
    radius: MOON_RADIUS,
    textureUrl: "/moon.jpg",
    Component: MoonSphereRoot,
  },
  jupiter: {
    radius: JUPITER_RADIUS,
    textureUrl: "/flat-jupiter.jpg",
    Component: JupiterSphereRoot,
  },
  saturn: {
    radius: SATURN_RADIUS,
    textureUrl: "/saturnmap.jpg",
    Component: SaturnSphereRoot,
  },
  uranus: {
    radius: URANUS_RADIUS,
    textureUrl: "/flat-uranus.jpg",
    Component: UranusSphereRoot,
  },
  neptune: {
    radius: NEPTUNE_RADIUS,
    textureUrl: "/flat-neptune.jpg",
    Component: NeptuneSphereRoot,
  },
};

function OrbitalPathPreview() {
  const orbitElements = {
    semiMajorAxis: 4,
    eccentricity: 0.3,
  };

  return (
    <div className="w-full h-full bg-black">
      <Canvas gl={{ antialias: true }}>
        <color attach="background" args={["#000000"]} />
        <PerspectiveCamera makeDefault position={[0, 8, 8]} fov={45} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <Suspense fallback={null}>
          {/* Central body */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#4488ff" />
          </mesh>

          {/* Use library OrbitalPath primitive */}
          <OrbitalPathRoot
            elements={orbitElements}
            color="#00ff00"
            showApoapsis
            showPeriapsis
          />
        </Suspense>

        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  );
}

function TimeSeriesPreview() {
  const [dataSize, setDataSize] = useState<number>(10000);
  const [renderer, setRenderer] = useState<"auto" | "svg" | "canvas">("auto");

  // Generate large dataset for demonstration
  const data = useMemo(() => {
    const result = [];
    for (let i = 0; i < dataSize; i++) {
      const x = i / 100;
      result.push({
        x,
        y: Math.sin(x) * Math.exp(-x / 100) * 3 + 2 + Math.random() * 0.2,
      });
    }
    return result;
  }, [dataSize]);

  const series = [
    {
      name: "Temperature",
      data,
      color: "#0ea5e9",
      strokeWidth: 2.5,
      filled: true,
    },
  ];

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-8 space-y-6">
      {/* Controls */}
      <div className="w-full max-w-4xl bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold mb-4 text-zinc-700 dark:text-zinc-300">
          Performance Controls
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Size Slider */}
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
              Data Points: {dataSize.toLocaleString()}
            </label>
            <input
              type="range"
              min="100"
              max="100000"
              step="100"
              value={dataSize}
              onChange={(e) => setDataSize(Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>100</span>
              <span>100K</span>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Auto-decimated to {Math.min(dataSize, 2000).toLocaleString()}{" "}
              points
            </p>
          </div>

          {/* Renderer Selection */}
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
              Renderer
            </label>
            <select
              value={renderer}
              onChange={(e) =>
                setRenderer(e.target.value as "auto" | "svg" | "canvas")
              }
              className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            >
              <option value="auto">Auto (SVG &lt;1k, Canvas &gt;1k)</option>
              <option value="svg">SVG (slower for large data)</option>
              <option value="canvas">Canvas (fast)</option>
            </select>
            <p className="text-xs text-zinc-500 mt-2">
              Using:{" "}
              {renderer === "auto"
                ? dataSize > 1000
                  ? "Canvas"
                  : "SVG"
                : renderer}
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center">
        <LineChart
          series={series}
          xAxis={{ label: "Time (s)" }}
          yAxis={{ label: "Temp (°C)" }}
          width={750}
          height={450}
          renderer={renderer}
          magneticCrosshair
          animate={false}
          className="text-zinc-800 dark:text-zinc-300"
        />
      </div>
    </div>
  );
}

function XYPlotPreview() {
  // Generate phase space data (damped oscillator)
  const data = [];
  for (let i = 0; i < 200; i++) {
    const t = (i / 200) * Math.PI * 6;
    const decay = Math.exp(-t / 8);
    data.push({
      x: Math.cos(t) * decay,
      y: -Math.sin(t) * decay,
    });
  }

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 flex items-center justify-center p-8">
      <XYPlot
        data={data}
        xAxis={{ label: "Position" }}
        yAxis={{ label: "Velocity" }}
        pointStyle="circle"
        pointSize={3}
        color="density"
        showTrendline={false}
        width={750}
        height={450}
        className="text-zinc-800 dark:text-zinc-300"
      />
    </div>
  );
}

function PolarPlotPreview() {
  // Generate antenna radiation pattern data
  const antennaData = [];
  for (let angle = 0; angle <= 360; angle += 10) {
    // Cardioid pattern: r = 1 + cos(θ)
    const theta = (angle * Math.PI) / 180;
    const gain = 10 * (1 + Math.cos(theta));
    antennaData.push({ angle, radius: gain });
  }

  const series = [
    {
      name: "Antenna Pattern",
      data: antennaData,
      color: "#0ea5e9",
      filled: true,
      strokeWidth: 2,
    },
  ];

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 flex items-center justify-center p-8">
      <PolarPlot
        series={series}
        radialAxis={{ label: "Gain (dBi)", scale: "linear" }}
        angularAxis={{ unit: "degrees" }}
        showGrid={{ radial: true, angular: true }}
        width={550}
        height={550}
        className="text-zinc-800 dark:text-zinc-300"
      />
    </div>
  );
}

function HistogramPreview() {
  // Generate normal distribution data with some outliers
  const data = [];
  const mean = 50;
  const stdDev = 10;

  // Generate 500 samples from normal distribution
  for (let i = 0; i < 500; i++) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    data.push(mean + z0 * stdDev);
  }

  // Add some outliers
  data.push(85, 88, 15, 12);

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 flex items-center justify-center p-8">
      <Histogram
        data={data}
        bins="auto"
        showDensity={true}
        showNormal={{ mean, stdDev, color: "#8b5cf6" }}
        xAxis={{ label: "Measurement Value" }}
        yAxis={{ label: "Density" }}
        color="#6366f1"
        width={750}
        height={450}
        showLegend={true}
        className="text-zinc-800 dark:text-zinc-300"
      />
    </div>
  );
}

function HeatmapPreview() {
  const [colormap, setColormap] = useState<string>("viridis");

  // Generate sensor array data
  const sensorData = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) =>
        Array.from({ length: 12 }, (_, j) => {
          return 20 + 15 * Math.sin((i + j) / 3) + Math.random() * 5;
        })
      ),
    []
  );

  const hours = [
    "00:00",
    "02:00",
    "04:00",
    "06:00",
    "08:00",
    "10:00",
    "12:00",
    "14:00",
    "16:00",
    "18:00",
    "20:00",
    "22:00",
  ];

  const sensors = [
    "Sensor 1",
    "Sensor 2",
    "Sensor 3",
    "Sensor 4",
    "Sensor 5",
    "Sensor 6",
    "Sensor 7",
    "Sensor 8",
  ];

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 flex flex-col items-center justify-center p-8 space-y-6">
      {/* Controls */}
      <div className="w-full max-w-4xl bg-zinc-100 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold mb-4 text-zinc-700 dark:text-zinc-300">
          Colormap Selection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colormap Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
              Scientific Colormap
            </label>
            <select
              value={colormap}
              onChange={(e) => setColormap(e.target.value)}
              className="w-full p-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            >
              <option value="viridis">Viridis (perceptually uniform)</option>
              <option value="plasma">Plasma (high contrast)</option>
              <option value="inferno">Inferno (warm tones)</option>
              <option value="magma">Magma (dark to light)</option>
              <option value="cividis">Cividis (colorblind-friendly)</option>
              <option value="turbo">Turbo (rainbow alternative)</option>
              <option value="coolwarm">Cool-Warm (diverging)</option>
              <option value="greens">Greens (sequential)</option>
              <option value="blues">Blues (sequential)</option>
              <option value="reds">Reds (sequential)</option>
            </select>
            <p className="text-xs text-zinc-500 mt-2">
              All colormaps are perceptually uniform and colorblind-friendly
            </p>
          </div>

          {/* Info */}
          <div className="flex items-center">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <p className="font-medium mb-2">🎨 Scientific Colormaps</p>
              <p className="text-xs">
                Based on research from matplotlib and scientific visualization
                best practices. Perceptually uniform colormaps ensure equal
                visual differences correspond to equal data differences.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 flex items-center justify-center">
        <Heatmap
          data={sensorData}
          xLabels={hours}
          yLabels={sensors}
          xAxisLabel="Time"
          yAxisLabel="Sensor Array"
          colormap={colormap as any}
          showColorScale
          width={750}
          height={450}
          className="text-zinc-800 dark:text-zinc-300"
        />
      </div>
    </div>
  );
}

export default function ComponentPreview({
  componentId,
}: ComponentPreviewProps) {
  if (componentId === "line-chart") {
    return <TimeSeriesPreview />;
  }

  if (componentId === "xy-plot") {
    return <XYPlotPreview />;
  }

  if (componentId === "polar-plot") {
    return <PolarPlotPreview />;
  }

  if (componentId === "histogram") {
    return <HistogramPreview />;
  }

  if (componentId === "heatmap") {
    return <HeatmapPreview />;
  }

  if (componentId === "orbital-path") {
    return <OrbitalPathPreview />;
  }

  if (componentId === "solar-system") {
    return (
      <div className="w-full h-full bg-black">
        <SolarSystem enableRotation={true} brightness={1.2} timeScale={500} />
      </div>
    );
  }

  if (componentId === "earth") {
    return (
      <div className="w-full h-full bg-black">
        <Earth
          dayMapUrl="/day.jpg"
          cloudsMapUrl="/clouds.jpg"
          enableRotation={true}
          brightness={1.5}
          timeScale={100}
          cameraPosition={[0, 0, EARTH_RADIUS * 3]}
          cameraFov={50}
          minDistance={EARTH_RADIUS * 1.5}
          maxDistance={EARTH_RADIUS * 10}
        />
      </div>
    );
  }

  // All other planets - use library primitives
  const planetConfig = planetConfigs[componentId];
  if (planetConfig) {
    const { radius, textureUrl, Component } = planetConfig;

    return (
      <div className="w-full h-full bg-black">
        <Canvas gl={{ antialias: true }}>
          <color attach="background" args={["#000000"]} />
          <PerspectiveCamera
            makeDefault
            position={[0, 0, radius * 3]}
            fov={45}
          />

          <ambientLight intensity={0.8} />
          <directionalLight
            position={[radius * 5, radius * 3, radius * 5]}
            intensity={1.5}
          />
          <hemisphereLight
            color="#b1e1ff"
            groundColor="#022c43"
            intensity={1}
          />

          <Suspense fallback={null}>
            {/* Use library planet primitive with texture */}
            <Component
              textureUrl={textureUrl}
              enableRotation
              brightness={1.2}
            />
          </Suspense>

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={radius * 1.5}
            maxDistance={radius * 10}
          />
        </Canvas>
      </div>
    );
  }

  // Fallback for unknown component
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <p className="text-white">Component "{componentId}" not found</p>
    </div>
  );
}
