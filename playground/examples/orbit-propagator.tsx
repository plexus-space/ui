"use client";

import { ComponentPreview } from "@/components/component-preview";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import {
  OrbitPropagator,
  type InitialOrbit,
  EARTH_RADIUS,
} from "@plexusui/components-pro/orbit-propagator";
import { Sphere, Clouds } from "@plexusui/components/primitives/sphere";

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
        title="Multi-Satellite Constellation"
        description="Real-time orbit propagation at 1x speed showing ISS, GPS, and GEO satellites with different orbital characteristics. Features J2 perturbation modeling for scientifically accurate orbital mechanics. Compose the OrbitPropagator primitive with Earth, clouds, and camera controls."
        code={`<Canvas>
  <PerspectiveCamera
    makeDefault
    position={[0, 20000, 35000]}
    fov={45}
    near={100}
    far={200000}
  />

  {/* Lighting */}
  <ambientLight intensity={0.5} />
  <directionalLight position={[50000, 50000, 50000]} intensity={1.5} />

  {/* Earth with textures */}
  <Sphere
    radius={EARTH_RADIUS}
    textureUrl="/day.jpg"
    normalMapUrl="/bump.jpg"
    specularMapUrl="/ocean.png"
    emissiveMapUrl="/night.jpg"
    rotationSpeed={0.0001}
    segments={96}
  />

  {/* Cloud layer */}
  <Clouds
    radius={EARTH_RADIUS}
    textureUrl="/clouds.jpg"
    height={1.006}
    opacity={0.5}
    rotationSpeed={0.00012}
  />

  {/* Orbit propagation primitive */}
  <OrbitPropagator
    satellites={[issOrbit, gpsOrbit, geoOrbit]}
    propagatorType="j2"
    timeMultiplier={1}
    maxTrailLength={300}
  />

  <OrbitControls
    enableDamping
    dampingFactor={0.05}
    minDistance={8000}
    maxDistance={100000}
  />
</Canvas>`}
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

              {/* Orbits - the core primitive */}
              <OrbitPropagator
                satellites={[issOrbit, gpsOrbit, geoOrbit]}
                propagatorType="j2"
                timeMultiplier={1}
                maxTrailLength={300}
                showOrbitPaths={true}
                showTrails={true}
                markerSize={200}
                orbitPathOpacity={0.3}
                trailOpacity={0.9}
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

      {/* Polar Constellation */}
      <ComponentPreview
        title="Polar Observation Satellite"
        description="Polar orbit demonstration showing near-vertical path over the poles. Perfect for Earth observation and reconnaissance missions. Compose multiple primitives for a complete scene."
        code={`<Canvas>
  <Sphere radius={EARTH_RADIUS} textureUrl="/day.jpg" />
  <Clouds radius={EARTH_RADIUS} textureUrl="/clouds.jpg" />
  <OrbitPropagator
    satellites={[polarOrbit]}
    propagatorType="two-body"
    timeMultiplier={100}
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
                position={[25000, 0, 0]}
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
                specularMapUrl="/ocean.png"
                rotationSpeed={0.0001}
                segments={96}
              />

              <Clouds
                radius={EARTH_RADIUS}
                textureUrl="/clouds.jpg"
                height={1.006}
                opacity={0.5}
                rotationSpeed={0.00012}
              />

              <OrbitPropagator
                satellites={[polarOrbit]}
                propagatorType="two-body"
                timeMultiplier={100}
                maxTrailLength={300}
                showOrbitPaths={true}
                showTrails={true}
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
    </div>
  );
};
