"use client";

import { ComponentPreview } from "@/components/component-preview";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Sphere, Clouds } from "@plexusui/components/primitives/sphere";
import { Marker, Trail, OrbitPath } from "@plexusui/components/primitives";
import { LineRenderer } from "@plexusui/components/primitives/gpu-line-renderer";
import {
  useOrbitalPropagation,
  useGroundTrack,
  EARTH_RADIUS,
  type InitialOrbit,
} from "@plexusui/hooks";

/**
 * ORBIT PRIMITIVES EXAMPLE
 *
 * This example showcases the NEW primitive-first architecture.
 *
 * **Shadcn Philosophy:**
 * 1. Hooks provide PURE DATA (no rendering)
 * 2. Primitives provide PURE RENDERING (composable)
 * 3. You compose them however you want
 *
 * **Compare to old approach:**
 * OLD: <OrbitPropagator satellites={...} /> (does everything, not composable)
 * NEW: useOrbitalPropagation() + <Marker> + <Trail> + <OrbitPath> (composable!)
 */

function OrbitVisualization() {
  // ISS orbit
  const issOrbit: InitialOrbit = {
    id: "iss",
    name: "ISS",
    semiMajorAxis: 6778,
    eccentricity: 0.0003,
    inclination: 51.6,
    longitudeOfAscendingNode: 0,
    argumentOfPeriapsis: 0,
    trueAnomaly: 0,
    color: "#3b82f6",
  };

  // GPS orbit
  const gpsOrbit: InitialOrbit = {
    id: "gps",
    name: "GPS",
    semiMajorAxis: 26560,
    eccentricity: 0.01,
    inclination: 55,
    longitudeOfAscendingNode: 30,
    argumentOfPeriapsis: 0,
    trueAnomaly: 0,
    color: "#10b981",
  };

  // HOOK: Get orbital data (pure physics, no rendering)
  const { satellites } = useOrbitalPropagation({
    satellites: [issOrbit, gpsOrbit],
    propagatorType: "j2",
    timeMultiplier: 50,
  });

  // HOOK: Get ground track for ISS (pure coordinate transform, no rendering)
  const issGroundTrack = useGroundTrack({
    satellitePosition: satellites[0]?.position,
    simulationTime: satellites[0]?.simulationTime,
    maxPoints: 500,
  });

  return (
    <group>
      {/* Render static orbit paths */}
      <OrbitPath orbit={issOrbit} color="#3b82f6" opacity={0.3} />
      <OrbitPath orbit={gpsOrbit} color="#10b981" opacity={0.3} />

      {/* Render satellites with markers + trails */}
      {satellites.map((sat) => (
        <group key={sat.id}>
          <Marker position={sat.position} size={200} color={sat.color} />
          <Trail
            position={sat.position}
            maxLength={200}
            color={sat.color}
            opacity={0.9}
          />
        </group>
      ))}

      {/* Render ground track with LineRenderer */}
      {issGroundTrack.points.length > 1 && (
        <LineRenderer
          points={issGroundTrack.points.map((p) => p.position)}
          color="#00ff00"
          opacity={0.8}
          width={2}
        />
      )}

      {/* Render node crossings */}
      {issGroundTrack.ascendingNodes.map((node, i) => (
        <Marker
          key={`asc-${i}`}
          position={node.position}
          size={50}
          color="#00ff00"
        />
      ))}
      {issGroundTrack.descendingNodes.map((node, i) => (
        <Marker
          key={`desc-${i}`}
          position={node.position}
          size={50}
          color="#ff0000"
        />
      ))}
    </group>
  );
}

export const OrbitPrimitivesExamples = () => {
  return (
    <div className="space-y-12">
      {/* Primitive-First Orbit Visualization */}
      <ComponentPreview
        title="Primitive-First Orbit Visualization (NEW)"
        description="The NEW shadcn-style architecture: pure data hooks + composable rendering primitives. You have full control over rendering while the hooks handle the physics. Mix and match primitives however you want!"
        code={`// 1. HOOKS: Get pure data (no rendering)
const { satellites } = useOrbitalPropagation({
  satellites: [issOrbit, gpsOrbit],
  propagatorType: "j2",
  timeMultiplier: 50,
});

const groundTrack = useGroundTrack({
  satellitePosition: satellites[0]?.position,
  simulationTime: satellites[0]?.simulationTime,
});

// 2. COMPOSE: Use any primitives you want
return (
  <>
    {/* Static orbit paths */}
    <OrbitPath orbit={issOrbit} color="#3b82f6" />

    {/* Dynamic markers + trails */}
    {satellites.map(sat => (
      <>
        <Marker position={sat.position} size={200} color={sat.color} />
        <Trail position={sat.position} maxLength={200} />
      </>
    ))}

    {/* Ground track with LineRenderer */}
    <LineRenderer
      points={groundTrack.points.map(p => p.position)}
      color="#00ff00"
    />
  </>
);`}
        preview={
          <div style={{ width: "100%", height: "600px" }}>
            <Canvas
              gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={["#000000"]} />

              <PerspectiveCamera
                makeDefault
                position={[0, 20000, 35000]}
                fov={45}
                near={100}
                far={200000}
              />

              <ambientLight intensity={0.5} />
              <directionalLight position={[50000, 50000, 50000]} intensity={1.5} />

              {/* Earth - compose with Sphere primitive */}
              <Sphere
                radius={EARTH_RADIUS}
                textureUrl="/day.jpg"
                normalMapUrl="/bump.jpg"
                specularMapUrl="/ocean.png"
                emissiveMapUrl="/night.jpg"
                rotationSpeed={0.0001}
                segments={96}
              />

              {/* Clouds - compose with Clouds primitive */}
              <Clouds
                radius={EARTH_RADIUS}
                textureUrl="/clouds.jpg"
                height={1.006}
                opacity={0.5}
                rotationSpeed={0.00012}
              />

              {/* Our composed orbit visualization */}
              <OrbitVisualization />

              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={8000}
                maxDistance={100000}
                rotateSpeed={0.5}
                zoomSpeed={0.8}
              />
            </Canvas>
          </div>
        }
      />

      {/* Benefits Explanation */}
      <ComponentPreview
        title="Why Primitive-First?"
        description="The new architecture separates data from rendering. Hooks provide pure physics, primitives provide pure rendering. You compose them yourself for maximum flexibility."
        code={`// ✅ GOOD: Primitive-First (NEW)
const { satellites } = useOrbitalPropagation({ ... });
return <Marker position={satellites[0].position} />;

// ❌ OLD: Monolithic Component
<OrbitPropagator satellites={...} />  // Does everything, can't customize

// Benefits:
// 1. REUSABLE: Use physics in 2D, 3D, or data export
// 2. COMPOSABLE: Mix primitives however you want
// 3. TESTABLE: Test physics separate from rendering
// 4. FLEXIBLE: Full control over visualization
// 5. SHADCN-LIKE: Copy/paste/modify primitives`}
        preview={
          <div className="rounded-lg border border-white/10 bg-black/50 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Architecture Comparison</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="mb-2 text-sm font-medium text-red-400">❌ Old Approach</h4>
                <pre className="text-xs text-white/60">
{`<OrbitPropagator
  satellites={[...]}
  showTrails={true}
  showMarkers={true}
  markerSize={200}
/>

// Problem: Tightly coupled
// Can't customize rendering
// Can't reuse physics alone`}
                </pre>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-green-400">✅ New Approach</h4>
                <pre className="text-xs text-white/60">
{`const { satellites } = useOrbitalPropagation([...]);

return satellites.map(sat => (
  <>
    <Marker position={sat.position} />
    <Trail position={sat.position} />
  </>
));

// Benefit: Fully composable
// Full rendering control
// Physics reusable anywhere`}
                </pre>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
};
