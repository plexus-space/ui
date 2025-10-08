"use client";

import { Suspense, memo, forwardRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Sphere, Atmosphere, Clouds } from "./primitives/sphere";

// ============================================================================
// Constants - Astronomically Accurate Values
// ============================================================================

export const EARTH_RADIUS_KM = 6371.0;
export const SCENE_SCALE = 0.001;
export const EARTH_RADIUS = EARTH_RADIUS_KM * SCENE_SCALE;
export const EARTH_ROTATION_PERIOD_SECONDS = 86164.0905;
export const EARTH_ORBITAL_PERIOD_DAYS = 365.256363004;
export const EARTH_AXIAL_TILT_DEG = 23.4392811;
export const ASTRONOMICAL_UNIT_KM = 149597870.7;
export const SUN_RADIUS_KM = 695700;

// ============================================================================
// Utilities
// ============================================================================

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

export function calculateEarthRotation(timeScale: number = 1): number {
  const { fractionOfDay } = getCurrentDayOfYear();
  return fractionOfDay * 2 * Math.PI * timeScale;
}

// ============================================================================
// Components
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
          <color attach="background" args={[0, 0, 0]} />
          <fog attach="fog" args={[0x000511, 50, 200]} />

          <Suspense fallback={null}>
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
  nightMapUrl?: string;
  cloudsMapUrl?: string;
  normalMapUrl?: string;
  specularMapUrl?: string;
  brightness?: number;
  enableRotation?: boolean;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  minDistance?: number;
  maxDistance?: number;
  timeScale?: number;
  showAxis?: boolean;
  showAtmosphere?: boolean;
  showClouds?: boolean;
  children?: React.ReactNode;
}

const EarthComponent = forwardRef<HTMLDivElement, EarthProps>(
  (
    {
      dayMapUrl,
      nightMapUrl,
      cloudsMapUrl,
      normalMapUrl,
      specularMapUrl,
      brightness = 1.0,
      enableRotation = true,
      cameraPosition = [0, 5, 20],
      cameraFov = 45,
      minDistance = 8,
      maxDistance = 100,
      timeScale = 1,
      showAxis = false,
      showAtmosphere = true,
      showClouds = true,
      children,
    },
    ref
  ) => {
    const rotationSpeed = useMemo(() => {
      if (!enableRotation) return 0;
      return (2 * Math.PI) / (EARTH_ROTATION_PERIOD_SECONDS * 60) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(EARTH_AXIAL_TILT_DEG)],
      []
    );

    return (
      <EarthScene
        ref={ref}
        cameraPosition={cameraPosition}
        cameraFov={cameraFov}
        minDistance={minDistance}
        maxDistance={maxDistance}
        brightness={brightness}
      >
        <Sphere
          radius={EARTH_RADIUS}
          textureUrl={dayMapUrl}
          normalMapUrl={normalMapUrl}
          specularMapUrl={specularMapUrl}
          emissiveMapUrl={nightMapUrl}
          rotationSpeed={rotationSpeed}
          rotation={axialTilt}
          segments={128}
        >
          {showAtmosphere && (
            <Atmosphere
              color="#4488ff"
              intensity={0.8}
              falloff={3.5}
              scale={1.02}
            />
          )}

          {showClouds && cloudsMapUrl && (
            <Clouds
              textureUrl={cloudsMapUrl}
              height={1.005}
              opacity={0.5}
              rotationSpeed={rotationSpeed * 0.8}
            />
          )}
        </Sphere>

        {showAxis && <axesHelper args={[EARTH_RADIUS * 3]} />}
        {children}
      </EarthScene>
    );
  }
);

EarthComponent.displayName = "Earth";

export const Earth = memo(EarthComponent);

export { getCurrentDayOfYear };
