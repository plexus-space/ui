"use client";

import { ComponentPreview } from "@/components/component-preview";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { OrbitTransferPlanner } from "@plexusui/components-pro/orbit-transfer-planner";
import { Sphere } from "@plexusui/components/primitives/sphere";
import { EARTH_RADIUS } from "@plexusui/components-pro/orbit-propagator";

export const OrbitTransferPlannerExamples = () => {
  return (
    <div className="space-y-12">
      {/* Hohmann Transfer - LEO to GEO */}
      <ComponentPreview
        title="Hohmann Transfer: LEO to GEO"
        description="Classic Hohmann transfer from Low Earth Orbit (400 km) to Geostationary Orbit (35,786 km). This two-impulse maneuver is the most fuel-efficient way to transfer between circular orbits when the radius ratio is less than 11.94. The transfer takes approximately 5.25 hours and requires ~3,900 m/s total delta-V."
        code={`<Canvas>
  <Sphere radius={6378} textureUrl="/day.jpg" />

  <OrbitTransferPlanner
    initialRadius={6778}    // LEO (400 km altitude)
    finalRadius={42164}     // GEO (35,786 km altitude)
    transferType="hohmann"
    showStats
    showBurns
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
                position={[50000, 30000, 50000]}
                fov={45}
                near={100}
                far={200000}
              />

              <ambientLight intensity={0.5} />
              <directionalLight position={[50000, 50000, 50000]} intensity={1.5} />

              <Sphere
                radius={EARTH_RADIUS}
                textureUrl="/day.jpg"
                segments={64}
              />

              <OrbitTransferPlanner
                initialRadius={6778}
                finalRadius={42164}
                transferType="hohmann"
                initialColor="#3b82f6"
                transferColor="#fbbf24"
                finalColor="#10b981"
                showStats
                showBurns
                lineWidth={2}
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

      {/* Hohmann Transfer - ISS to GPS */}
      <ComponentPreview
        title="Hohmann Transfer: ISS to GPS Altitude"
        description="Transfer from ISS orbit (~400 km) to GPS orbit altitude (~20,200 km). This demonstrates a medium-range Hohmann transfer with a radius ratio of about 3.9. Requires approximately 2,600 m/s delta-V and takes about 2.5 hours."
        code={`<OrbitTransferPlanner
  initialRadius={6778}     // ISS altitude
  finalRadius={26560}      // GPS altitude
  transferType="hohmann"
  showStats
/>`}
        preview={
          <div style={{ width: "100%", height: "600px" }}>
            <Canvas
              gl={{ antialias: false, alpha: false }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={["#000000"]} />

              <PerspectiveCamera
                makeDefault
                position={[35000, 20000, 35000]}
                fov={45}
                near={100}
                far={200000}
              />

              <ambientLight intensity={0.5} />
              <directionalLight position={[50000, 50000, 50000]} intensity={1.5} />

              <Sphere
                radius={EARTH_RADIUS}
                textureUrl="/day.jpg"
                segments={64}
              />

              <OrbitTransferPlanner
                initialRadius={6778}
                finalRadius={26560}
                transferType="hohmann"
                initialColor="#3b82f6"
                transferColor="#f59e0b"
                finalColor="#8b5cf6"
                showStats
                showBurns
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

      {/* Bi-Elliptic Transfer */}
      <ComponentPreview
        title="Bi-Elliptic Transfer: LEO to High Orbit"
        description="Bi-elliptic transfer from LEO to a very high orbit. When the radius ratio exceeds 11.94, a bi-elliptic transfer can be more fuel-efficient than Hohmann, despite taking longer. This three-impulse maneuver goes through an intermediate high apoapsis before reaching the final orbit. Notice the additional burn and longer transfer time."
        code={`<OrbitTransferPlanner
  initialRadius={6778}
  finalRadius={84328}       // 2x GEO altitude
  transferType="bi-elliptic"
  intermediateRadius={100000}  // High intermediate apoapsis
  showStats
  showBurns
/>`}
        preview={
          <div style={{ width: "100%", height: "600px" }}>
            <Canvas
              gl={{ antialias: false, alpha: false }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={["#000000"]} />

              <PerspectiveCamera
                makeDefault
                position={[100000, 60000, 100000]}
                fov={45}
                near={100}
                far={300000}
              />

              <ambientLight intensity={0.5} />
              <directionalLight position={[50000, 50000, 50000]} intensity={1.5} />

              <Sphere
                radius={EARTH_RADIUS}
                textureUrl="/day.jpg"
                segments={64}
              />

              <OrbitTransferPlanner
                initialRadius={6778}
                finalRadius={84328}
                transferType="bi-elliptic"
                intermediateRadius={120000}
                initialColor="#3b82f6"
                transferColor="#ef4444"
                finalColor="#8b5cf6"
                showStats
                showBurns
              />

              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={10000}
                maxDistance={250000}
              />
            </Canvas>
          </div>
        }
      />

      {/* Small Orbit Raise */}
      <ComponentPreview
        title="Small Orbit Raise: Station Keeping"
        description="Small Hohmann transfer for station keeping maneuvers. Raising orbit from 400 km to 420 km requires only about 8 m/s delta-V. This type of maneuver is performed regularly on satellites to maintain their desired orbit altitude."
        code={`<OrbitTransferPlanner
  initialRadius={6778}
  finalRadius={6798}        // 20 km raise
  transferType="hohmann"
  showStats
/>`}
        preview={
          <div style={{ width: "100%", height: "600px" }}>
            <Canvas
              gl={{ antialias: false, alpha: false }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={["#000000"]} />

              <PerspectiveCamera
                makeDefault
                position={[0, 0, 20000]}
                fov={45}
                near={100}
                far={100000}
              />

              <ambientLight intensity={0.5} />
              <directionalLight position={[50000, 50000, 50000]} intensity={1.5} />

              <Sphere
                radius={EARTH_RADIUS}
                textureUrl="/day.jpg"
                normalMapUrl="/bump.jpg"
                segments={64}
              />

              <OrbitTransferPlanner
                initialRadius={6778}
                finalRadius={6798}
                transferType="hohmann"
                initialColor="#10b981"
                transferColor="#fbbf24"
                finalColor="#3b82f6"
                showStats
                showBurns
                lineWidth={3}
              />

              <OrbitControls
                enableDamping
                dampingFactor={0.05}
                minDistance={8000}
                maxDistance={50000}
              />
            </Canvas>
          </div>
        }
      />
    </div>
  );
};
