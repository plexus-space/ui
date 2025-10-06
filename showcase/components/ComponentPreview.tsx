"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Suspense, useState } from "react";
import { Earth, EARTH_RADIUS } from "@plexusui/earth";
import { MarsSphereRoot, MARS_RADIUS } from "@plexusui/mars";
import { MercurySphereRoot, MERCURY_RADIUS } from "@plexusui/mercury";
import { VenusSphereRoot, VENUS_RADIUS } from "@plexusui/venus";
import { MoonSphereRoot, MOON_RADIUS } from "@plexusui/moon";
import { JupiterSphereRoot, JUPITER_RADIUS } from "@plexusui/jupiter";
import { SaturnSphereRoot, SATURN_RADIUS } from "@plexusui/saturn";
import { UranusSphereRoot, URANUS_RADIUS } from "@plexusui/uranus";
import { NeptuneSphereRoot, NEPTUNE_RADIUS } from "@plexusui/neptune";
import { Gantt, type GanttGroup } from "@plexusui/gantt";
import { OrbitalPathRoot } from "@plexusui/orbital-path";
import { GroundTrackRoot, GroundTrackUtils } from "@plexusui/ground-track";
import { TrajectoryRoot } from "@plexusui/trajectory";
import { TransferOrbitRoot } from "@plexusui/transfer-orbit";
import { LaGrangePointsRoot } from "@plexusui/lagrange-points";

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

function GanttPreview() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>();

  const now = Date.now();
  const groups: GanttGroup[] = [
    {
      id: "alaska",
      label: "Alaska Ground Station",
      sublabel: "Fairbanks",
      tasks: [
        {
          id: "iss-1",
          label: "ISS",
          startTime: now + 1000 * 60 * 30,
          endTime: now + 1000 * 60 * 45,
          priority: "critical",
        },
        {
          id: "starlink-1",
          label: "Starlink-52",
          startTime: now + 1000 * 60 * 120,
          endTime: now + 1000 * 60 * 135,
          priority: "high",
        },
      ],
    },
    {
      id: "hawaii",
      label: "Hawaii Ground Station",
      sublabel: "Maui",
      tasks: [
        {
          id: "hubble-1",
          label: "Hubble",
          startTime: now + 1000 * 60 * 60,
          endTime: now + 1000 * 60 * 75,
          priority: "medium",
        },
      ],
    },
    {
      id: "chile",
      label: "Chile Ground Station",
      sublabel: "Santiago",
      tasks: [
        {
          id: "landsat-1",
          label: "Landsat 9",
          startTime: now + 1000 * 60 * 180,
          endTime: now + 1000 * 60 * 195,
          priority: "low",
        },
        {
          id: "sentinel-1",
          label: "Sentinel-2",
          startTime: now + 1000 * 60 * 240,
          endTime: now + 1000 * 60 * 255,
          priority: "medium",
        },
      ],
    },
  ];

  return (
    <div className="w-full h-full bg-zinc-950 p-6">
      <Gantt
        groups={groups}
        timeWindowStart={now}
        timeWindowDuration={12 * 60 * 60 * 1000}
        selectedTaskId={selectedTaskId}
        onTaskClick={setSelectedTaskId}
      />
    </div>
  );
}

function GroundTrackPreview() {
  // Generate ISS-like ground track using library utilities
  const groundTrackPoints = GroundTrackUtils.generateFromOrbit(
    EARTH_RADIUS * 1000 + 420, // ISS altitude (convert to km)
    (51.6 * Math.PI) / 180, // ISS inclination (convert to radians)
    100,
    EARTH_RADIUS * 1000 // Earth radius in km
  );

  return (
    <div className="w-full h-full bg-black">
      <Canvas gl={{ antialias: true }}>
        <color attach="background" args={["#000000"]} />
        <PerspectiveCamera
          makeDefault
          position={[0, 0, EARTH_RADIUS * 2.5]}
          fov={45}
        />

        <ambientLight intensity={0.8} />
        <directionalLight
          position={[EARTH_RADIUS * 20, 0, 0]}
          intensity={1.5}
        />

        <Suspense fallback={null}>
          {/* Use library Earth component */}
          <Earth dayMapUrl="/day.jpg" enableRotation timeScale={100} />

          {/* Use library GroundTrack primitive */}
          <GroundTrackRoot
            points={groundTrackPoints}
            planetRadius={EARTH_RADIUS * 1000}
            color="#ffff00"
            offset={50}
          />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={true}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}

function LagrangePointsPreview() {
  return (
    <div className="w-full h-full bg-black">
      <Canvas gl={{ antialias: true }}>
        <color attach="background" args={["#000000"]} />
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={45} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <Suspense fallback={null}>
          {/* Use library LaGrangePoints primitive */}
          <LaGrangePointsRoot
            system={{
              primaryMass: 5.972e24, // Earth
              secondaryMass: 7.342e22, // Moon
              distance: 384400, // Earth-Moon distance in km
            }}
            showLabels={false}
          />
        </Suspense>

        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  );
}

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

function TrajectoryPreview() {
  // Generate trajectory waypoints
  const waypoints: Array<{ position: [number, number, number] }> = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const x = t * 8 - 4;
    const y = Math.sin(t * Math.PI * 2) * 2;
    const z = Math.cos(t * Math.PI) * 1;
    waypoints.push({ position: [x, y, z] });
  }

  return (
    <div className="w-full h-full bg-black">
      <Canvas gl={{ antialias: true }}>
        <color attach="background" args={["#000000"]} />
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={45} />

        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />

        <Suspense fallback={null}>
          {/* Use library Trajectory primitive */}
          <TrajectoryRoot
            waypoints={waypoints}
            color="#ff00ff"
            showWaypoints
            waypointSize={0.2}
          />
        </Suspense>

        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  );
}

function TransferOrbitPreview() {
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
            <meshStandardMaterial color="#ffaa00" />
          </mesh>

          {/* Use library TransferOrbit primitive */}
          <TransferOrbitRoot
            config={{
              initialRadius: 2,
              finalRadius: 4,
              type: "hohmann",
            }}
            showBurns
          />
        </Suspense>

        <OrbitControls enableZoom={true} enablePan={true} />
      </Canvas>
    </div>
  );
}

export default function ComponentPreview({
  componentId,
}: ComponentPreviewProps) {
  // Gantt chart component (2D, no Canvas needed)
  if (componentId === "gantt") {
    return <GanttPreview />;
  }

  // Orbital mechanics components
  if (componentId === "ground-track") {
    return <GroundTrackPreview />;
  }
  if (componentId === "lagrange-points") {
    return <LagrangePointsPreview />;
  }
  if (componentId === "orbital-path") {
    return <OrbitalPathPreview />;
  }
  if (componentId === "trajectory") {
    return <TrajectoryPreview />;
  }
  if (componentId === "transfer-orbit") {
    return <TransferOrbitPreview />;
  }

  // Special case: Earth with full features
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
            autoRotate
            autoRotateSpeed={0.5}
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
