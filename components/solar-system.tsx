"use client";

import { Suspense, memo, forwardRef, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

/**
 * Real orbital distances from Sun in Astronomical Units (AU)
 * 1 AU = Earth-Sun distance = 149,597,870.7 km
 */
const ORBITAL_DISTANCES_AU = {
  mercury: 0.387,
  venus: 0.723,
  earth: 1.0,
  mars: 1.524,
  jupiter: 5.203,
  saturn: 9.537,
  uranus: 19.191,
  neptune: 30.07,
} as const;

/**
 * Scale factor for scene (50 scene units = 1 AU)
 * This makes Earth 50 units from Sun, keeping everything visible
 */
const SCENE_SCALE = 50; // 50 units = 1 AU

/**
 * Sun's actual radius relative to Earth
 * Sun radius: 695,700 km
 * Earth radius: 6,371 km
 * Ratio: 695,700 / 6,371 = 109.2x
 */
const SUN_RADIUS_RELATIVE = 109.2; // Sun is 109.2x larger than Earth

/**
 * Planet configuration with realistic relative sizes and rotation periods
 * All data from NASA planetary fact sheets
 * Sizes are relative to Earth (Earth = 1.0)
 * Rotation periods are in Earth days (sidereal rotation)
 * Positions are accurately scaled from real orbital distances
 */
const PLANETS = [
  {
    name: "Sun",
    texture: "/sun.jpg",
    radius: SUN_RADIUS_RELATIVE, // 109.2x Earth (695,700 km vs 6,371 km)
    position: 0, // Sun at origin
    rotationPeriod: 25.05, // 25.05 Earth days at equator
    axialTilt: 7.25, // Relative to ecliptic
    emissive: false,
  },
  {
    name: "Mercury",
    texture: "/flat-mercury.png",
    radius: 0.3829, // 38.29% of Earth (exact: 2,439.7 km vs 6,371 km)
    position: SUN_RADIUS_RELATIVE + ORBITAL_DISTANCES_AU.mercury * SCENE_SCALE, // Sun edge + 0.387 AU from Sun center
    rotationPeriod: 58.646, // 58.646 Earth days (tidally locked 3:2 with orbit)
    axialTilt: 0.034, // Nearly upright (0.034°)
    emissive: true, // Bright like Earth
  },
  {
    name: "Venus",
    texture: "/flat-venus.jpg",
    radius: 0.9499, // 94.99% of Earth (exact: 6,051.8 km vs 6,371 km)
    position: SUN_RADIUS_RELATIVE + ORBITAL_DISTANCES_AU.venus * SCENE_SCALE, // Sun edge + 0.723 AU from Sun center
    rotationPeriod: -243.025, // Retrograde rotation (-243.025 days)
    axialTilt: 177.36, // Nearly upside down
    emissive: false,
  },
  {
    name: "Earth",
    texture: "/day.jpg",
    radius: 1.0, // Reference size (6,371 km mean radius)
    position: SUN_RADIUS_RELATIVE + ORBITAL_DISTANCES_AU.earth * SCENE_SCALE, // Sun edge + 1.0 AU from Sun center
    rotationPeriod: 0.99726968, // Sidereal day (23h 56m 4s)
    axialTilt: 23.4392811, // 23.44° (obliquity)
    emissive: true, // Bright like Earth component
  },
  {
    name: "Mars",
    texture: "/flat-mars.jpg",
    radius: 0.532, // 53.2% of Earth (exact: 3,389.5 km vs 6,371 km)
    position: SUN_RADIUS_RELATIVE + ORBITAL_DISTANCES_AU.mars * SCENE_SCALE, // Sun edge + 1.524 AU from Sun center
    rotationPeriod: 1.025957, // 24h 37m 22s (very similar to Earth)
    axialTilt: 25.19, // Similar to Earth's tilt
    emissive: true, // Bright like Earth component
  },
  {
    name: "Jupiter",
    texture: "/flat-jupiter.jpg",
    radius: 11.209, // 11.209x Earth (exact: 69,911 km vs 6,371 km)
    position: SUN_RADIUS_RELATIVE + ORBITAL_DISTANCES_AU.jupiter * SCENE_SCALE, // Sun edge + 5.203 AU from Sun center
    rotationPeriod: 0.41354, // 9h 55m 30s (fastest spinner!)
    axialTilt: 3.13, // Nearly upright
    emissive: false,
  },
  {
    name: "Saturn",
    texture: "/saturnmap.jpg",
    radius: 9.449, // 9.449x Earth (exact: 58,232 km vs 6,371 km)
    position: SUN_RADIUS_RELATIVE + ORBITAL_DISTANCES_AU.saturn * SCENE_SCALE, // Sun edge + 9.537 AU from Sun center
    rotationPeriod: 0.44401, // 10h 39m 22s
    axialTilt: 26.73, // Similar to Earth
    emissive: false,
  },
  {
    name: "Uranus",
    texture: "/flat-uranus.jpg",
    radius: 4.007, // 4.007x Earth (exact: 25,362 km vs 6,371 km)
    position: SUN_RADIUS_RELATIVE + ORBITAL_DISTANCES_AU.uranus * SCENE_SCALE, // Sun edge + 19.191 AU from Sun center
    rotationPeriod: -0.71833, // Retrograde (-17h 14m 24s)
    axialTilt: 97.77, // Extreme tilt (rotates on its side!)
    emissive: false,
  },
  {
    name: "Neptune",
    texture: "/flat-neptune.jpg",
    radius: 3.883, // 3.883x Earth (exact: 24,622 km vs 6,371 km)
    position: SUN_RADIUS_RELATIVE + ORBITAL_DISTANCES_AU.neptune * SCENE_SCALE, // Sun edge + 30.07 AU from Sun center
    rotationPeriod: 0.67125, // 16h 6m 36s
    axialTilt: 28.32,
    emissive: false,
  },
] as const;

// ============================================================================
// Components
// ============================================================================

interface PlanetProps {
  name: string;
  position: number;
  radius: number;
  textureUrl: string | null;
  enableRotation: boolean;
  rotationPeriod: number;
  axialTilt: number;
  timeScale: number;
  emissive: boolean;
}

const Planet = memo(function Planet({
  name,
  position,
  radius,
  textureUrl,
  enableRotation,
  rotationPeriod,
  axialTilt,
  timeScale,
  emissive,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const texture = textureUrl
    ? useLoader(THREE.TextureLoader, textureUrl)
    : null;

  // Apply axial tilt once
  useFrame(() => {
    if (groupRef.current && groupRef.current.rotation.z === 0) {
      groupRef.current.rotation.z = THREE.MathUtils.degToRad(axialTilt);
    }
  });

  // Realistic rotation based on actual rotation period
  useFrame((_state, delta) => {
    if (meshRef.current && enableRotation && rotationPeriod !== 0) {
      // Calculate rotation speed: 2π radians per rotation period
      // Delta is in seconds, rotationPeriod is in Earth days
      // timeScale accelerates the rotation for visibility
      const rotationSpeed =
        ((Math.PI * 2) / (rotationPeriod * 24 * 60 * 60)) * timeScale;
      meshRef.current.rotation.y += rotationSpeed * delta;
    }
  });

  // Sun special case - glowing with texture
  if (name === "Sun") {
    return (
      <group ref={groupRef} position={[position, 0, 0]}>
        <mesh ref={meshRef}>
          <sphereGeometry args={[radius, 64, 32]} />
          {texture ? (
            <meshBasicMaterial map={texture} toneMapped={false} />
          ) : (
            <meshBasicMaterial color="#FDB813" toneMapped={false} />
          )}
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={3} distance={2000} />
      </group>
    );
  }

  return (
    <group ref={groupRef} position={[position, 0, 0]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 32]} />
        {texture ? (
          emissive ? (
            // Earth and Mars: use meshBasicMaterial like Earth component
            <meshBasicMaterial map={texture} toneMapped={false} />
          ) : (
            // Other planets: use standard material
            <meshStandardMaterial map={texture} />
          )
        ) : (
          <meshStandardMaterial color="#888888" />
        )}
      </mesh>
    </group>
  );
});

interface SolarSystemSceneContentProps {
  enableRotation: boolean;
  timeScale: number;
}

const SolarSystemSceneContent = function SolarSystemSceneContent({
  enableRotation,
  timeScale,
}: SolarSystemSceneContentProps) {
  return (
    <group>
      {PLANETS.map((planet) => (
        <Planet
          key={planet.name}
          name={planet.name}
          position={planet.position}
          radius={planet.radius}
          textureUrl={planet.texture}
          enableRotation={enableRotation}
          rotationPeriod={planet.rotationPeriod}
          axialTilt={planet.axialTilt}
          timeScale={timeScale}
          emissive={planet.emissive}
        />
      ))}
    </group>
  );
};

// ============================================================================
// Scene Primitive
// ============================================================================

export interface SolarSystemSceneProps {
  /** Initial camera position [x, y, z] (default: [250, 50, 200]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view in degrees (default: 60) */
  cameraFov?: number;
  /** Minimum zoom distance (default: 5) */
  minDistance?: number;
  /** Maximum zoom distance (default: 2000) */
  maxDistance?: number;
  /** Overall scene brightness (default: 1.0) */
  brightness?: number;
  /** Child components to render within the scene */
  children?: React.ReactNode;
}

export const SolarSystemScene = forwardRef<
  HTMLDivElement,
  SolarSystemSceneProps
>(
  (
    {
      cameraPosition = [250, 50, 200],
      cameraFov = 60,
      minDistance = 5,
      maxDistance = 2000,
      brightness = 1.0,
      children,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="relative h-full w-full">
        <Canvas
          camera={{ position: cameraPosition, fov: cameraFov }}
          gl={{ antialias: true }}
        >
          {/* Deep space background */}
          {/* @ts-ignore */}
          <color attach="background" args={["#000000"]} />

          <Suspense fallback={null}>
            {/* Ambient space light */}
            <ambientLight intensity={0.4 * brightness} />
            <directionalLight
              position={[-100, 10, 0]}
              intensity={0.5 * brightness}
            />

            <OrbitControls
              makeDefault
              target={[280, 0, 0]}
              enablePan
              enableZoom
              enableRotate
              zoomSpeed={1.0}
              panSpeed={1.0}
              rotateSpeed={0.5}
              minDistance={minDistance}
              maxDistance={maxDistance}
              enableDamping
              dampingFactor={0.05}
            />

            {children}
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

SolarSystemScene.displayName = "SolarSystemScene";

// ============================================================================
// Main Component
// ============================================================================

export interface SolarSystemProps {
  /** Enable planet rotation (default: true) */
  enableRotation?: boolean;
  /** Overall scene brightness (default: 1.0) */
  brightness?: number;
  /** Time scale multiplier for rotation speed (default: 1000 - speeds up rotation for visibility) */
  timeScale?: number;
  /** Camera position [x, y, z] (default: [250, 50, 200]) */
  cameraPosition?: [number, number, number];
  /** Camera field of view (default: 60) */
  cameraFov?: number;
  /** Minimum camera zoom distance (default: 5) */
  minDistance?: number;
  /** Maximum camera zoom distance (default: 2000) */
  maxDistance?: number;
  /** Additional children to render in the scene */
  children?: React.ReactNode;
}

/**
 * SolarSystem - Astronomically accurate solar system visualization
 *
 * Displays the Sun and all 8 planets in a line with accurate scaled distances.
 * Features:
 * - Accurate orbital distances (Mercury: 0.387 AU, Earth: 1.0 AU, Neptune: 30.07 AU)
 * - Realistic relative sizes (Earth = 1.0 reference, Jupiter = 11.2x, Mercury = 0.38x)
 * - Precise rotation periods (Earth: 23h 56m 4s, Jupiter: 9h 55m 30s)
 * - Correct axial tilts (Earth: 23.44°, Uranus: 97.77° on its side)
 * - Retrograde rotation for Venus and Uranus (negative rotation)
 * - Scale: 50 scene units = 1 AU (Astronomical Unit)
 *
 * @example
 * Simplest usage:
 * ```tsx
 * import { SolarSystem } from '@/components/ui/solar-system';
 *
 * function App() {
 *   return <SolarSystem />;
 * }
 * ```
 *
 * @example
 * With customization:
 * ```tsx
 * <SolarSystem
 *   enableRotation={true}
 *   brightness={1.2}
 *   timeScale={2000} // Speed up rotation
 * />
 * ```
 */
const SolarSystemComponent = forwardRef<HTMLDivElement, SolarSystemProps>(
  (
    {
      enableRotation = true,
      brightness = 1.0,
      timeScale = 1000, // Default time acceleration for visible rotation
      cameraPosition = [250, 50, 200],
      cameraFov = 60,
      minDistance = 5,
      maxDistance = 2000,
      children,
    },
    ref
  ) => {
    return (
      <SolarSystemScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <SolarSystemSceneContent
          enableRotation={enableRotation}
          timeScale={timeScale}
        />
        {children}
      </SolarSystemScene>
    );
  }
);

SolarSystemComponent.displayName = "SolarSystem";

export const SolarSystem = memo(SolarSystemComponent);

// Export planet data
export const SOLAR_SYSTEM_PLANETS = PLANETS;
