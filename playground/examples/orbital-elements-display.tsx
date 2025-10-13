"use client";

import { ComponentPreview } from "@/components/component-preview";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useState } from "react";
import {
  OrbitPropagator,
  type InitialOrbit,
  type SatelliteState,
  EARTH_RADIUS,
} from "@plexusui/components-pro/orbit-propagator";
import { OrbitalElementsDisplay } from "@plexusui/components-pro/orbital-elements-display";
import { Sphere } from "@plexusui/components/primitives/sphere";

export const OrbitalElementsDisplayExamples = () => {
  const [satelliteStates, setSatelliteStates] = useState<SatelliteState[]>([]);

  // ISS orbit
  const issOrbit: InitialOrbit = {
    id: "iss",
    name: "International Space Station",
    semiMajorAxis: 6778,
    eccentricity: 0.0003,
    inclination: 51.6,
    longitudeOfAscendingNode: 45,
    argumentOfPeriapsis: 0,
    trueAnomaly: 0,
    color: "#3b82f6",
  };

  // Molniya orbit (highly elliptical)
  const molniyaOrbit: InitialOrbit = {
    id: "molniya",
    name: "Molniya Satellite",
    semiMajorAxis: 26560,
    eccentricity: 0.72,
    inclination: 63.4,
    longitudeOfAscendingNode: 90,
    argumentOfPeriapsis: 270,
    trueAnomaly: 0,
    color: "#ef4444",
  };

  return (
    <div className="space-y-12">
      {/* ISS with Orbital Elements Display */}
      <ComponentPreview
        title="ISS Orbital Elements Display"
        description="Real-time display of the International Space Station's orbital elements. Shows classical Keplerian parameters including semi-major axis, eccentricity, inclination, RAAN, argument of periapsis, and true anomaly. Also displays derived parameters like period, apoapsis, and periapsis."
        code={`const [satelliteStates, setSatelliteStates] = useState([]);

const issOrbit = {
  id: "iss",
  name: "International Space Station",
  semiMajorAxis: 6778,  // ~400 km altitude
  eccentricity: 0.0003,
  inclination: 51.6,
  color: "#3b82f6"
};

<Canvas>
  <Sphere radius={6378} textureUrl="/day.jpg" />

  <OrbitPropagator
    satellites={[issOrbit]}
    propagatorType="j2"
    timeMultiplier={100}
    onUpdate={setSatelliteStates}
  />

  <OrbitalElementsDisplay
    elements={satelliteStates[0]?.elements}
    name={issOrbit.name}
    position="top-left"
    showDerived
  />

  <OrbitControls />
</Canvas>`}
        preview={
          <div style={{ width: "100%", height: "600px" }}>
            <Canvas
              gl={{ antialias: false, alpha: false }}
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

              <Sphere
                radius={EARTH_RADIUS}
                textureUrl="/day.jpg"
                normalMapUrl="/bump.jpg"
                rotationSpeed={0.0001}
                segments={64}
              />

              <OrbitPropagator
                satellites={[issOrbit]}
                propagatorType="j2"
                timeMultiplier={100}
                maxTrailLength={200}
                onUpdate={setSatelliteStates}
              />

              <OrbitalElementsDisplay
                elements={satelliteStates[0]?.elements}
                name={issOrbit.name}
                position="top-left"
                showDerived
              />

              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={8000}
                maxDistance={100000}
              />
            </Canvas>
          </div>
        }
      />

      {/* Molniya Orbit - Highly Elliptical */}
      <ComponentPreview
        title="Molniya Orbit - Highly Elliptical"
        description="Displays orbital elements for a highly elliptical Molniya orbit. This type of orbit is used for communications satellites covering high latitudes. Note the high eccentricity (0.72) which creates a large difference between apoapsis and periapsis."
        code={`const molniyaOrbit = {
  id: "molniya",
  name: "Molniya Satellite",
  semiMajorAxis: 26560,
  eccentricity: 0.72,      // Highly elliptical
  inclination: 63.4,        // Critical inclination
  argumentOfPeriapsis: 270, // Apogee over northern hemisphere
  color: "#ef4444"
};

<Canvas>
  <Sphere radius={6378} />
  <OrbitPropagator satellites={[molniyaOrbit]} />
  <OrbitalElementsDisplay
    elements={states[0]?.elements}
    name="Molniya"
    position="top-right"
  />
</Canvas>`}
        preview={
          <div style={{ width: "100%", height: "600px" }}>
            <Canvas
              gl={{ antialias: false, alpha: false }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={["#000000"]} />

              <PerspectiveCamera
                makeDefault
                position={[40000, 30000, 40000]}
                fov={45}
                near={100}
                far={200000}
              />

              <ambientLight intensity={0.5} />
              <directionalLight position={[50000, 50000, 50000]} intensity={1.5} />

              <Sphere
                radius={EARTH_RADIUS}
                textureUrl="/day.jpg"
                rotationSpeed={0.0001}
                segments={64}
              />

              <OrbitPropagator
                satellites={[molniyaOrbit]}
                propagatorType="two-body"
                timeMultiplier={50}
                maxTrailLength={300}
                onUpdate={(states) => {
                  if (states.length > 0) {
                    setSatelliteStates(states);
                  }
                }}
              />

              <OrbitalElementsDisplay
                elements={satelliteStates[0]?.elements}
                name={molniyaOrbit.name}
                position="top-right"
                showDerived
              />

              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={8000}
                maxDistance={150000}
              />
            </Canvas>
          </div>
        }
      />
    </div>
  );
};
