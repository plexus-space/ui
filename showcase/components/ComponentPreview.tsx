"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense } from "react";
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
  // Simple example data
  const data = [];
  for (let i = 0; i <= 50; i++) {
    const x = i * 0.2;
    data.push({ x, y: Math.sin(x) * Math.exp(-x * 0.1) * 3 + 2 });
  }

  const series = [
    {
      name: "Temperature",
      data,
      color: "#0ea5e9",
      strokeWidth: 2.5,
    },
  ];

  return (
    <div className="w-full h-full bg-white dark:bg-zinc-950 flex items-center justify-center p-8">
      <LineChart
        series={series}
        xAxis={{ label: "Time (s)" }}
        yAxis={{ label: "Temp (°C)" }}
        width={750}
        height={450}
        className="text-zinc-800 dark:text-zinc-300"
      />
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
