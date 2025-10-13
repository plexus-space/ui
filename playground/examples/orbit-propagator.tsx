"use client";

import { ComponentPreview } from "@/components/component-preview";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  useOrbitalPropagation,
  type InitialOrbit,
  EARTH_RADIUS,
} from "@plexusui/hooks/use-orbital-propagation";
import { Sphere, Clouds } from "@plexusui/components/primitives/sphere";
import { Marker } from "@plexusui/components/primitives/marker";
import { OrbitPath } from "@plexusui/components/primitives/orbit-path";
import { Trail } from "@plexusui/components/primitives/trail";
import * as React from "react";

export const OrbitPropagatorExamples = () => {
  // ISS-like orbit
  const issOrbit: InitialOrbit = {
    id: "iss",
    name: "ISS",
    semiMajorAxis: 6778, // ~400 km altitude
    eccentricity: 0.0003,
    inclination: 51.6,
    longitudeOfAscendingNode: 0,
    argumentOfPeriapsis: 0,
    trueAnomaly: 0,
    color: "#3b82f6",
  };

  // GPS-like orbit
  const gpsOrbit: InitialOrbit = {
    id: "gps",
    name: "GPS",
    semiMajorAxis: 26560, // MEO orbit
    eccentricity: 0.01,
    inclination: 55,
    longitudeOfAscendingNode: 30,
    argumentOfPeriapsis: 0,
    trueAnomaly: 0,
    color: "#10b981",
  };

  // GEO orbit
  const geoOrbit: InitialOrbit = {
    id: "geo",
    name: "GEO Satellite",
    semiMajorAxis: 42164, // Geostationary
    eccentricity: 0.0001,
    inclination: 0,
    longitudeOfAscendingNode: 0,
    argumentOfPeriapsis: 0,
    trueAnomaly: 0,
    color: "#f59e0b",
  };

  // Polar orbit
  const polarOrbit: InitialOrbit = {
    id: "polar",
    name: "Polar Observation",
    semiMajorAxis: 7178, // ~800 km altitude
    eccentricity: 0.001,
    inclination: 98,
    longitudeOfAscendingNode: 90,
    argumentOfPeriapsis: 0,
    trueAnomaly: 0,
    color: "#8b5cf6",
  };

  return (
    <div className="space-y-12">
      {/* Multi-Satellite Constellation */}
      <ComponentPreview
        title="Orbital Propagation with Primitives"
        description="Real-time orbit propagation using composable primitives: useOrbitalPropagation hook + Marker, OrbitPath, and Trail primitives. Features J2 perturbation modeling for scientifically accurate orbital mechanics. This primitive-first architecture allows complete customization of visualization."
        code={`const { satellites } = useOrbitalPropagation({
  satellites: [issOrbit, gpsOrbit, geoOrbit],
  propagatorType: "j2",
  timeMultiplier: 1,
});

return (
  <>
    {satellites.map((sat) => {
      const orbit = [issOrbit, gpsOrbit, geoOrbit].find(o => o.id === sat.id)!;
      return (
        <React.Fragment key={sat.id}>
          {/* Satellite marker */}
          <Marker position={sat.position} color={sat.color} size={200} />

          {/* Static orbit path */}
          <OrbitPath orbit={orbit} color={sat.color} opacity={0.3} />

          {/* Dynamic trail */}
          <Trail
            position={sat.position}
            maxLength={300}
            color={sat.color}
            width={2}
            opacity={0.9}
          />
        </React.Fragment>
      );
    })}
  </>
);`}
        preview={
          <div style={{ width: "100%", height: "600px" }}>
            <Canvas
              gl={{
                antialias: false,
                alpha: false,
                powerPreference: "high-performance",
              }}
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

              {/* Lighting */}
              <ambientLight intensity={0.5} />
              <directionalLight
                position={[50000, 50000, 50000]}
                intensity={1.5}
              />

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

              {/* Orbits - composable primitives */}
              <OrbitPropagatorPrimitives
                satellites={[issOrbit, gpsOrbit, geoOrbit]}
                timeMultiplier={1}
              />

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
    </div>
  );
};

/**
 * Composable Orbital Propagation Primitives
 * Demonstrates the new primitive-first architecture
 */
function OrbitPropagatorPrimitives({
  satellites,
  timeMultiplier = 1,
}: {
  satellites: InitialOrbit[];
  timeMultiplier?: number;
}) {
  const { satellites: states } = useOrbitalPropagation({
    satellites,
    propagatorType: "j2",
    timeMultiplier,
    onError: (error, satelliteId, context) => {
      console.error(`Error in ${context} for ${satelliteId}:`, error);
    },
  });

  return (
    <>
      {states.map((sat) => {
        const orbit = satellites.find((o) => o.id === sat.id)!;
        return (
          <React.Fragment key={sat.id}>
            {/* Satellite marker */}
            <Marker position={sat.position} color={sat.color} size={200} />

            {/* Static orbit path */}
            <OrbitPath orbit={orbit} color={sat.color} opacity={0.3} />

            {/* Dynamic trail */}
            <Trail
              position={sat.position}
              maxLength={300}
              color={sat.color}
              width={2}
              opacity={0.9}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}
