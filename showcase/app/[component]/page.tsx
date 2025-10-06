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
    package: "@plexusui/earth",
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
    package: "@plexusui/mars",
    category: "Planetary Bodies",
    textures: ["/flat-mars.jpg"],
  },
  {
    id: "mercury",
    name: "Mercury",
    package: "@plexusui/mercury",
    category: "Planetary Bodies",
    textures: ["/flat-mercury.png"],
  },
  {
    id: "venus",
    name: "Venus",
    package: "@plexusui/venus",
    category: "Planetary Bodies",
    textures: ["/flat-venus.jpg"],
  },
  {
    id: "moon",
    name: "Moon",
    package: "@plexusui/moon",
    category: "Planetary Bodies",
    textures: ["/moon.jpg"],
  },
  {
    id: "jupiter",
    name: "Jupiter",
    package: "@plexusui/jupiter",
    category: "Planetary Bodies",
    textures: ["/flat-jupiter.jpg"],
  },
  {
    id: "saturn",
    name: "Saturn",
    package: "@plexusui/saturn",
    category: "Planetary Bodies",
    textures: ["/saturnmap.jpg"],
  },
  {
    id: "uranus",
    name: "Uranus",
    package: "@plexusui/uranus",
    category: "Planetary Bodies",
    textures: ["/flat-uranus.jpg"],
  },
  {
    id: "neptune",
    name: "Neptune",
    package: "@plexusui/neptune",
    category: "Planetary Bodies",
    textures: ["/flat-neptune.jpg"],
  },
  {
    id: "ground-track",
    name: "Ground Track",
    package: "@plexusui/ground-track",
    category: "Orbital Mechanics",
    description:
      "Visualize satellite paths over Earth's surface. Shows where a satellite passes overhead as it orbits, like drawing its flight path on a map.",
    textures: [],
  },
  {
    id: "lagrange-points",
    name: "Lagrange Points",
    package: "@plexusui/lagrange-points",
    category: "Orbital Mechanics",
    description:
      "Show the five special 'parking spots' in space where gravitational forces balance out. Perfect for placing space telescopes like the James Webb.",
    textures: [],
  },
  {
    id: "orbital-path",
    name: "Orbital Path",
    package: "@plexusui/orbital-path",
    category: "Orbital Mechanics",
    description:
      "Draw elliptical orbits around planets using real Keplerian orbital elements. Essential for visualizing satellite trajectories.",
    textures: [],
  },
  {
    id: "trajectory",
    name: "Trajectory",
    package: "@plexusui/trajectory",
    category: "Orbital Mechanics",
    description:
      "Plot complex flight paths with waypoints and engine burn markers. Shows exactly where spacecraft fire their engines to change course.",
    textures: [],
  },
  {
    id: "transfer-orbit",
    name: "Transfer Orbit",
    package: "@plexusui/transfer-orbit",
    category: "Orbital Mechanics",
    description:
      "Visualize Hohmann transfers - the fuel-efficient way to move between two circular orbits. How we get spacecraft from Earth to Mars.",
    textures: [],
  },
  {
    id: "gantt",
    name: "Gantt",
    package: "@plexusui/gantt",
    category: "Mission Planning",
    description:
      "Timeline view for scheduling satellite passes over ground stations. Shows when you can communicate with spacecraft.",
    textures: [],
  },
];

export default function ComponentPage() {
  const params = useParams();
  const componentId = params.component as string;
  const component = components.find((c) => c.id === componentId);
  const activeComponent = component || components[0];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-950">
        <div className="p-4 border-b border-zinc-800">
          <h1 className="text-lg font-bold">Plexus UI</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50 transition-colors"
            >
              Getting Started
            </Link>

            {["Planetary Bodies", "Orbital Mechanics", "Mission Planning"].map(
              (category) => (
                <div key={category}>
                  <div className="mt-6 mb-2 px-3 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
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
                            ? "bg-zinc-800 text-zinc-50 font-medium"
                            : "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50"
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

      <main className="flex-1 overflow-y-auto bg-zinc-950">
        <div className="max-w-5xl mx-auto p-8">
          <h1 className="text-4xl font-bold mb-2 text-zinc-50">
            {activeComponent.name}
          </h1>
          <p className="text-zinc-400 mb-2">{activeComponent.package}</p>
          <p className="text-zinc-300 mb-8 text-lg leading-relaxed">
            {activeComponent?.description || ""}
          </p>

          <section className="mb-12">
            <div className="bg-zinc-900 border border-zinc-800 overflow-hidden h-[500px]">
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
              <h2 className="text-2xl font-bold mb-4 text-zinc-50">Textures</h2>
              <p className="text-zinc-400 mb-4">
                Download the texture maps for {activeComponent.name}:
              </p>
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeComponent.textures.map((texture) => (
                    <a
                      key={texture}
                      href={texture}
                      download
                      className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm text-zinc-300 hover:text-zinc-50 transition-colors"
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
            <h2 className="text-2xl font-bold mb-4 text-zinc-50">
              Installation
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 p-4">
              <pre className="text-sm text-emerald-400">
                npm install {activeComponent.package}
              </pre>
            </div>
          </section>

          {/* Basic Usage */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-zinc-50">
              Composable Primitives
            </h2>
            <p className="text-zinc-400 mb-4">
              Components are built from composable primitives - use the
              high-level component or mix and match the building blocks:
            </p>
            <CodePlayground
              title="basic-usage.tsx"
              initialCode={
                componentId === "gantt"
                  ? `import { Gantt } from '${activeComponent.package}'

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
                  ? `import { Earth, calculateSunPosition } from '${activeComponent.package}'

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
                  : `import { ${activeComponent.name} } from '${activeComponent.package}'

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

          {/* Using Root Primitives */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-zinc-50">
              Using Root Primitives
            </h2>
            <p className="text-zinc-400 mb-4">
              For maximum control, use the root primitive with your own scene
              setup:
            </p>
            <CodePlayground
              title="root-primitives.tsx"
              initialCode={
                componentId === "gantt"
                  ? `import { GanttTimelineRoot, GanttHeaderRoot } from '${activeComponent.package}'

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
                    }SphereRoot, ${activeComponent.name.toUpperCase()}_RADIUS } from '${
                      activeComponent.package
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
            <h2 className="text-2xl font-bold mb-4 text-zinc-50">
              Using Scene Primitives
            </h2>
            <p className="text-zinc-400 mb-4">
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
                  ? `import { GanttScene, GanttTimelineRoot } from '${activeComponent.package}'

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
                  : `import { ${activeComponent.name}Scene, ${activeComponent.name}SphereRoot } from '${activeComponent.package}'

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

          {/* Physical Constants / Utilities */}
          {componentId !== "gantt" ? (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-zinc-50">
                {componentId === "earth"
                  ? "Constants & Utilities"
                  : "Physical Constants"}
              </h2>
              <p className="text-zinc-400 mb-4">
                {componentId === "earth"
                  ? "Astronomical constants and utility functions for realistic simulations:"
                  : "Each package exports real astronomical data:"}
              </p>
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <pre className="text-sm overflow-x-auto text-zinc-300">
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
} from '${activeComponent.package}'`}
                  </code>
                </pre>
              </div>
            </section>
          ) : (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4 text-zinc-50">
                Utilities
              </h2>
              <p className="text-zinc-400 mb-4">
                The package exports helpful utility functions:
              </p>
              <div className="bg-zinc-900 border border-zinc-800 p-4">
                <pre className="text-sm overflow-x-auto text-zinc-300">
                  <code>{`import { GanttUtils } from '${activeComponent.package}'

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
            <h2 className="text-2xl font-bold mb-4 text-zinc-50">Props</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">
                  {activeComponent.name} Component Props
                </h3>
                <div className="bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-black/50">
                      <tr className="border-b border-zinc-800">
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
                          <tr className="border-b border-zinc-800">
                            <td className="p-3 text-emerald-400">dayMapUrl</td>
                            <td className="p-3 text-zinc-400">string</td>
                            <td className="p-3 text-zinc-500">optional</td>
                            <td className="p-3 text-zinc-400">
                              Day texture URL
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-800">
                            <td className="p-3 text-emerald-400">
                              cloudsMapUrl
                            </td>
                            <td className="p-3 text-zinc-400">string</td>
                            <td className="p-3 text-zinc-500">optional</td>
                            <td className="p-3 text-zinc-400">
                              Clouds texture URL
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-800">
                            <td className="p-3 text-emerald-400">
                              enableRotation
                            </td>
                            <td className="p-3 text-zinc-400">boolean</td>
                            <td className="p-3 text-zinc-500">true</td>
                            <td className="p-3 text-zinc-400">
                              Enable realistic 24h rotation
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-800">
                            <td className="p-3 text-emerald-400">
                              rotationSpeed
                            </td>
                            <td className="p-3 text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">realistic</td>
                            <td className="p-3 text-zinc-400">
                              Rotation speed (rad/sec)
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-800">
                            <td className="p-3 text-emerald-400">axialTilt</td>
                            <td className="p-3 text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">23.4397°</td>
                            <td className="p-3 text-zinc-400">
                              Earth's axial tilt
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-800">
                            <td className="p-3 text-emerald-400">
                              sunPosition
                            </td>
                            <td className="p-3 text-zinc-400">[x,y,z]</td>
                            <td className="p-3 text-zinc-500">[150000,0,0]</td>
                            <td className="p-3 text-zinc-400">
                              Sun light position
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 text-emerald-400">brightness</td>
                            <td className="p-3 text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">1.2</td>
                            <td className="p-3 text-zinc-400">
                              Scene brightness
                            </td>
                          </tr>
                        </>
                      ) : (
                        <>
                          <tr className="border-b border-zinc-800">
                            <td className="p-3 text-emerald-400">textureUrl</td>
                            <td className="p-3 text-zinc-400">string</td>
                            <td className="p-3 text-zinc-500">required</td>
                            <td className="p-3 text-zinc-400">
                              URL to texture
                            </td>
                          </tr>
                          <tr className="border-b border-zinc-800">
                            <td className="p-3 text-emerald-400">
                              enableRotation
                            </td>
                            <td className="p-3 text-zinc-400">boolean</td>
                            <td className="p-3 text-zinc-500">true</td>
                            <td className="p-3 text-zinc-400">
                              Enable auto-rotation
                            </td>
                          </tr>
                          <tr>
                            <td className="p-3 text-emerald-400">brightness</td>
                            <td className="p-3 text-zinc-400">number</td>
                            <td className="p-3 text-zinc-500">1.0</td>
                            <td className="p-3 text-zinc-400">
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
