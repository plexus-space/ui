"use client";

import {
  Suspense,
  memo,
  useRef,
  forwardRef,
  useEffect,
  useState,
  useMemo,
} from "react";
import { Canvas, useLoader, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// Constants - Astronomically Accurate Values
// ============================================================================

/**
 * Earth's radius in kilometers (mean radius)
 * @constant {number}
 */
const EARTH_RADIUS_KM = 6371.0;

/**
 * Scale factor for the scene (1 unit = 1000 km for manageable numbers)
 * @constant {number}
 */
const SCENE_SCALE = 0.001; // 1 scene unit = 1000 km

/**
 * Earth's radius in scene units
 * @constant {number}
 */
const EARTH_RADIUS = EARTH_RADIUS_KM * SCENE_SCALE;

/**
 * Earth's rotation period in seconds (sidereal day)
 * @constant {number}
 */
const EARTH_ROTATION_PERIOD_SECONDS = 86164.0905; // 23h 56m 4.0905s

/**
 * Earth's orbital period in days
 * @constant {number}
 */
const EARTH_ORBITAL_PERIOD_DAYS = 365.256363004; // Tropical year

/**
 * Earth's axial tilt in degrees (obliquity of the ecliptic)
 * @constant {number}
 */
const EARTH_AXIAL_TILT_DEG = 23.4392811; // Current value (changes slowly over time)

/**
 * Astronomical Unit in kilometers (mean Earth-Sun distance)
 * @constant {number}
 */
const ASTRONOMICAL_UNIT_KM = 149597870.7;

/**
 * Sun's radius in kilometers
 * @constant {number}
 */
const SUN_RADIUS_KM = 695700;

// ============================================================================
// Utility Functions - Astronomical Calculations
// ============================================================================

/**
 * Get current day of year and fraction of day
 * @returns {dayOfYear: number, fractionOfDay: number}
 */
function getCurrentDayOfYear(): { dayOfYear: number; fractionOfDay: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const fractionOfDay =
    (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;

  return { dayOfYear, fractionOfDay };
}


/**
 * Calculate Earth's rotation based on time
 * @param timeScale - Time acceleration factor (1 = real-time)
 * @returns Current rotation angle in radians
 */
function calculateEarthRotation(timeScale: number = 1): number {
  const { fractionOfDay } = getCurrentDayOfYear();
  // Earth rotates 360° per sidereal day
  // Starting position: Prime Meridian at noon
  return fractionOfDay * 2 * Math.PI * timeScale;
}

// ============================================================================
// Components
// ============================================================================

interface EarthSphereProps {
  radius: number;
  textureUrl?: string;
  cloudsMapUrl?: string;
  enableRotation: boolean;
  axialTilt: number;
  timeScale: number;
  showAxis?: boolean;
}

const EarthSphere = memo(function EarthSphere({
  radius,
  textureUrl,
  cloudsMapUrl,
  enableRotation,
  axialTilt,
  timeScale,
  showAxis = false,
}: EarthSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [initialRotation, setInitialRotation] = useState(0);

  // Load textures
  const dayMap = textureUrl ? useLoader(THREE.TextureLoader, textureUrl) : null;
  const cloudsTexture = cloudsMapUrl ? useLoader(THREE.TextureLoader, cloudsMapUrl) : null;

  // Set initial rotation based on current time
  useEffect(() => {
    setInitialRotation(calculateEarthRotation(1));
  }, []);

  // Apply axial tilt and rotation
  useFrame((_state) => {
    if (groupRef.current && groupRef.current.rotation.z === 0) {
      // Apply axial tilt (tilted away from orbital plane)
      groupRef.current.rotation.z = THREE.MathUtils.degToRad(axialTilt);
    }

    if (!enableRotation) return;

    // Realistic rotation rate
    const rotationPerSecond =
      ((2 * Math.PI) / EARTH_ROTATION_PERIOD_SECONDS) * timeScale;

    if (meshRef.current) {
      meshRef.current.rotation.y =
        initialRotation + _state.clock.elapsedTime * rotationPerSecond;
    }

    if (cloudsRef.current) {
      // Clouds rotate slightly differently due to atmospheric circulation
      cloudsRef.current.rotation.y =
        initialRotation + _state.clock.elapsedTime * rotationPerSecond * 1.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Earth sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 64, 32]} />
        {dayMap ? (
          <meshBasicMaterial
            map={dayMap}
            toneMapped={false}
          />
        ) : (
          <meshBasicMaterial color={new THREE.Color(0x2233ff)} />
        )}
      </mesh>

      {/* Cloud layer */}
      {cloudsTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[radius * 1.003, 64, 32]} />
          <meshBasicMaterial
            map={cloudsTexture}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {showAxis && <axesHelper args={[radius * 2]} />}
    </group>
  );
});


// ============================================================================
// Main Components
// ============================================================================

export interface EarthSceneProps {
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  minDistance?: number;
  maxDistance?: number;
  brightness?: number;
  children?: React.ReactNode;
}

export const EarthScene = forwardRef<HTMLDivElement, EarthSceneProps>(
  (
    {
      cameraPosition = [0, 5, 20],
      cameraFov = 45,
      minDistance = 8,
      maxDistance = 100,
      brightness = 1.0,
      children,
    },
    ref
  ) => {
    return (
      <div ref={ref} className="relative h-full w-full">
        <Canvas
          camera={{ position: cameraPosition, fov: cameraFov }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
        >
          {/* Deep space background */}
          <color attach="background" args={[0x000511]} />

          {/* Add fog for atmosphere effect */}
          <fog attach="fog" args={[0x000511, 50, 200]} />

          <Suspense fallback={null}>
            {/* Uniform lighting - no sun */}
            <ambientLight intensity={1.0 * brightness} color={0xffffff} />

            <OrbitControls
              makeDefault
              enablePan
              enableZoom
              enableRotate
              zoomSpeed={0.6}
              panSpeed={0.5}
              rotateSpeed={0.4}
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

EarthScene.displayName = "EarthScene";

export interface EarthProps {
  dayMapUrl?: string;
  cloudsMapUrl?: string;
  brightness?: number;
  enableRotation?: boolean;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  minDistance?: number;
  maxDistance?: number;
  timeScale?: number;
  showAxis?: boolean;
  children?: React.ReactNode;
}

const EarthComponent = forwardRef<HTMLDivElement, EarthProps>(
  (
    {
      dayMapUrl,
      cloudsMapUrl,
      brightness = 1.0,
      enableRotation = true,
      cameraPosition = [0, 5, 20],
      cameraFov = 45,
      minDistance = 8,
      maxDistance = 100,
      timeScale = 1,
      showAxis = false,
      children,
    },
    ref
  ) => {
    return (
      <EarthScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <EarthSphere
          radius={EARTH_RADIUS}
          textureUrl={dayMapUrl}
          cloudsMapUrl={cloudsMapUrl}
          enableRotation={enableRotation}
          axialTilt={EARTH_AXIAL_TILT_DEG}
          timeScale={timeScale}
          showAxis={showAxis}
        />
        {children}
      </EarthScene>
    );
  }
);

EarthComponent.displayName = "Earth";

export const Earth = memo(EarthComponent);

// Export all astronomical constants for external use
export {
  EARTH_RADIUS,
  EARTH_RADIUS_KM,
  EARTH_ROTATION_PERIOD_SECONDS,
  EARTH_ORBITAL_PERIOD_DAYS,
  EARTH_AXIAL_TILT_DEG,
  ASTRONOMICAL_UNIT_KM,
  SUN_RADIUS_KM,
  SCENE_SCALE,
  calculateEarthRotation,
  getCurrentDayOfYear,
};
