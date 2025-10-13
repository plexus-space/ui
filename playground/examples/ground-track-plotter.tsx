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
import { GroundTrackPlotter } from "@plexusui/components-pro/ground-track-plotter";
import { Sphere, Clouds } from "@plexusui/components/primitives/sphere";

export const GroundTrackPlotterExamples = () => {
  const [satelliteStates, setSatelliteStates] = useState<SatelliteState[]>([]);

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

  // Polar orbit
  const polarOrbit: InitialOrbit = {
    id: "polar",
    name: "Polar Satellite",
    semiMajorAxis: 7178, // ~800 km altitude
    eccentricity: 0.001,
    inclination: 98, // Sun-synchronous
    longitudeOfAscendingNode: 0,
    argumentOfPeriapsis: 0,
    trueAnomaly: 0,
    color: "#10b981",
  };

  // GPS orbit
  const gpsOrbit: InitialOrbit = {
    id: "gps",
    name: "GPS",
    semiMajorAxis: 26560,
    eccentricity: 0.01,
    inclination: 55,
    longitudeOfAscendingNode: 0,
    argumentOfPeriapsis: 0,
    trueAnomaly: 0,
    color: "#f59e0b",
  };

  return (
    <div className="space-y-12">
      {/* ISS Ground Track */}
      <ComponentPreview
        title="ISS Ground Track Visualization"
        description="Real-time ground track of the International Space Station showing the sub-satellite point path on Earth's surface. The green line traces where the satellite passes directly overhead. Notice how the track moves westward due to Earth's rotation."
        code={`const [satelliteStates, setSatelliteStates] = useState([]);

const issOrbit = {
  id: "iss",
  semiMajorAxis: 6778,
  eccentricity: 0.0003,
  inclination: 51.6,
  color: "#3b82f6"
};

<Canvas>
  <Sphere radius={6378} textureUrl="/day.jpg" />
  <Clouds radius={6378} textureUrl="/clouds.jpg" />

  <OrbitPropagator
    satellites={[issOrbit]}
    onUpdate={setSatelliteStates}
    timeMultiplier={50}
  />

  <GroundTrackPlotter
    satellitePosition={satelliteStates[0]?.state.position}
    maxPoints={500}
    color="#00ff00"
    showNodes
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
                position={[0, 0, 25000]}
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

              <Clouds
                radius={EARTH_RADIUS}
                textureUrl="/clouds.jpg"
                height={1.006}
                opacity={0.5}
                rotationSpeed={0.00012}
              />

              <OrbitPropagator
                satellites={[issOrbit]}
                propagatorType="j2"
                timeMultiplier={50}
                maxTrailLength={200}
                onUpdate={setSatelliteStates}
                showOrbitPaths={false}
              />

              <GroundTrackPlotter
                satellitePosition={satelliteStates[0]?.state.position}
                maxPoints={500}
                color="#00ff00"
                showNodes
                heightOffset={20}
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

      {/* Polar Orbit Ground Track */}
      <ComponentPreview
        title="Polar Orbit Ground Track"
        description="Ground track for a sun-synchronous polar orbit. The track covers the entire Earth surface over time, making it ideal for Earth observation and remote sensing. Green markers show ascending nodes (crossing equator northward) and red markers show descending nodes (southward)."
        code={`const polarOrbit = {
  id: "polar",
  semiMajorAxis: 7178,
  inclination: 98,  // Sun-synchronous
  color: "#10b981"
};

<Canvas>
  <Sphere radius={6378} textureUrl="/day.jpg" />
  <OrbitPropagator satellites={[polarOrbit]} />
  <GroundTrackPlotter
    satellitePosition={states[0]?.state.position}
    color="#10b981"
    showNodes  // Show equator crossings
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
                position={[0, 25000, 0]}
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
                satellites={[polarOrbit]}
                propagatorType="two-body"
                timeMultiplier={100}
                maxTrailLength={300}
                onUpdate={(states) => {
                  if (states.length > 0) {
                    setSatelliteStates(states);
                  }
                }}
                showOrbitPaths={true}
              />

              <GroundTrackPlotter
                satellitePosition={satelliteStates[0]?.state.position}
                maxPoints={600}
                color="#10b981"
                showNodes
                heightOffset={20}
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

      {/* Multi-Satellite Ground Tracks */}
      <ComponentPreview
        title="GPS Constellation Ground Tracks"
        description="Multiple ground tracks showing a GPS satellite's global coverage pattern. MEO orbits like GPS have longer periods than LEO, resulting in different ground track patterns."
        code={`const gpsOrbit = {
  id: "gps",
  semiMajorAxis: 26560,  // MEO
  inclination: 55,
  color: "#f59e0b"
};

<Canvas>
  <Sphere radius={6378} textureUrl="/day.jpg" />
  <OrbitPropagator satellites={[gpsOrbit]} />
  <GroundTrackPlotter
    satellitePosition={states[0]?.state.position}
    maxPoints={800}
    color="#f59e0b"
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
                position={[0, 0, 60000]}
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
                satellites={[gpsOrbit]}
                propagatorType="two-body"
                timeMultiplier={30}
                maxTrailLength={400}
                onUpdate={(states) => {
                  if (states.length > 0) {
                    setSatelliteStates(states);
                  }
                }}
              />

              <GroundTrackPlotter
                satellitePosition={satelliteStates[0]?.state.position}
                maxPoints={800}
                color="#f59e0b"
                heightOffset={20}
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
