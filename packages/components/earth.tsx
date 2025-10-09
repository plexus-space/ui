"use client";

import * as React from "react";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Sphere, Atmosphere, Clouds } from "./primitives/sphere";
import {
  EARTH_RADIUS_KM,
  EARTH_ROTATION_PERIOD_SECONDS,
  EARTH_ORBITAL_PERIOD_DAYS,
  EARTH_AXIAL_TILT_DEG,
  ASTRONOMICAL_UNIT_KM,
  SUN_RADIUS_KM,
  SCENE_SCALE,
  kmToSceneUnits,
  calculateRotationSpeed,
  getCurrentDayOfYear,
  degToRad,
} from "./lib";

// ============================================================================
// Derived Constants
// ============================================================================

export const EARTH_RADIUS = kmToSceneUnits(EARTH_RADIUS_KM);

// ============================================================================
// Utilities
// ============================================================================

export function calculateEarthRotation(timeScale: number = 1): number {
  const { fractionOfDay } = getCurrentDayOfYear();
  return fractionOfDay * 2 * Math.PI * timeScale;
}

// ============================================================================
// Context
// ============================================================================

interface EarthContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  dayMapUrl?: string;
  nightMapUrl?: string;
  cloudsMapUrl?: string;
  normalMapUrl?: string;
  specularMapUrl?: string;
}

const EarthContext = React.createContext<EarthContext | null>(null);

function useEarth() {
  const ctx = React.useContext(EarthContext);
  if (!ctx) throw new Error("useEarth must be used within Earth.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

export interface EarthRootProps {
  /** Texture URL for day map */
  dayMapUrl?: string;
  /** Texture URL for night lights map */
  nightMapUrl?: string;
  /** Texture URL for clouds map */
  cloudsMapUrl?: string;
  /** Texture URL for normal map */
  normalMapUrl?: string;
  /** Texture URL for specular map */
  specularMapUrl?: string;
  /** Earth radius in scene units */
  radius?: number;
  /** Enable automatic rotation */
  enableRotation?: boolean;
  /** Time scale multiplier for rotation speed */
  timeScale?: number;
  /** Overall brightness multiplier */
  brightness?: number;
  children?: React.ReactNode;
}

export interface EarthCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Camera position [x, y, z] */
  cameraPosition?: [number, number, number];
  /** Camera field of view */
  cameraFov?: number;
  /** Canvas height */
  height?: string;
  /** Canvas width */
  width?: string;
  children?: React.ReactNode;
}

export interface EarthControlsProps {
  /** Minimum zoom distance */
  minDistance?: number;
  /** Maximum zoom distance */
  maxDistance?: number;
  /** Zoom speed */
  zoomSpeed?: number;
  /** Pan speed */
  panSpeed?: number;
  /** Rotate speed */
  rotateSpeed?: number;
  /** Enable pan */
  enablePan?: boolean;
  /** Enable zoom */
  enableZoom?: boolean;
  /** Enable rotate */
  enableRotate?: boolean;
  /** Enable damping */
  enableDamping?: boolean;
  /** Damping factor */
  dampingFactor?: number;
}

export interface EarthGlobeProps {
  /** Number of segments for sphere geometry */
  segments?: number;
  children?: React.ReactNode;
}

export interface EarthAtmosphereProps {
  /** Atmosphere color */
  color?: string;
  /** Atmosphere intensity */
  intensity?: number;
  /** Atmosphere falloff */
  falloff?: number;
  /** Atmosphere scale multiplier */
  scale?: number;
}

export interface EarthCloudsProps {
  /** Cloud layer height multiplier */
  height?: number;
  /** Cloud opacity */
  opacity?: number;
  /** Cloud rotation speed multiplier */
  rotationSpeedMultiplier?: number;
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const EarthRoot = React.forwardRef<HTMLDivElement, EarthRootProps>(
  (
    {
      dayMapUrl,
      nightMapUrl,
      cloudsMapUrl,
      normalMapUrl,
      specularMapUrl,
      radius = EARTH_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.0,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return calculateRotationSpeed(EARTH_ROTATION_PERIOD_SECONDS, timeScale);
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, degToRad(EARTH_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: EarthContext = React.useMemo(
      () => ({
        radius,
        rotationSpeed,
        axialTilt,
        brightness,
        timeScale,
        dayMapUrl,
        nightMapUrl,
        cloudsMapUrl,
        normalMapUrl,
        specularMapUrl,
      }),
      [
        radius,
        rotationSpeed,
        axialTilt,
        brightness,
        timeScale,
        dayMapUrl,
        nightMapUrl,
        cloudsMapUrl,
        normalMapUrl,
        specularMapUrl,
      ]
    );

    return (
      <EarthContext.Provider value={contextValue}>
        <div ref={ref} className="earth-root relative h-full w-full">
          {children}
        </div>
      </EarthContext.Provider>
    );
  }
);

EarthRoot.displayName = "Earth.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const EarthCanvas = React.forwardRef<HTMLDivElement, EarthCanvasProps>(
  (
    {
      cameraPosition = [0, 5, 20],
      cameraFov = 45,
      height = "600px",
      width = "100%",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { brightness } = useEarth();

    return (
      <div ref={ref} className={className} {...props}>
        <Canvas
          style={{
            height: `${height}`,
            width: `${width}`,
          }}
          camera={{ position: cameraPosition, fov: cameraFov }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 2.0,
          }}
        >
          <color attach="background" args={[0, 0, 0]} />
          <fog attach="fog" args={[0x000511, 50, 200]} />

          <Suspense fallback={null}>
            <ambientLight intensity={1.0 * brightness} color={0xffffff} />
            {children}
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

EarthCanvas.displayName = "Earth.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const EarthControls = React.forwardRef<any, EarthControlsProps>(
  (
    {
      minDistance = 8,
      maxDistance = 100,
      zoomSpeed = 0.6,
      panSpeed = 0.5,
      rotateSpeed = 0.4,
      enablePan = true,
      enableZoom = true,
      enableRotate = true,
      enableDamping = true,
      dampingFactor = 0.05,
    },
    ref
  ) => {
    return (
      <OrbitControls
        ref={ref}
        makeDefault
        enablePan={enablePan}
        enableZoom={enableZoom}
        enableRotate={enableRotate}
        zoomSpeed={zoomSpeed}
        panSpeed={panSpeed}
        rotateSpeed={rotateSpeed}
        minDistance={minDistance}
        maxDistance={maxDistance}
        enableDamping={enableDamping}
        dampingFactor={dampingFactor}
      />
    );
  }
);

EarthControls.displayName = "Earth.Controls";

/**
 * Globe component - renders the main Earth sphere
 */
const EarthGlobe = React.forwardRef<any, EarthGlobeProps>(
  ({ segments = 128, children }, ref) => {
    const {
      radius,
      rotationSpeed,
      axialTilt,
      dayMapUrl,
      nightMapUrl,
      normalMapUrl,
      specularMapUrl,
    } = useEarth();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={dayMapUrl}
        normalMapUrl={normalMapUrl}
        specularMapUrl={specularMapUrl}
        emissiveMapUrl={nightMapUrl}
        rotationSpeed={rotationSpeed}
        rotation={axialTilt}
        segments={segments}
      >
        {children}
      </Sphere>
    );
  }
);

EarthGlobe.displayName = "Earth.Globe";

/**
 * Atmosphere component - renders the atmospheric glow
 */
const EarthAtmosphere = React.forwardRef<any, EarthAtmosphereProps>(
  (
    { color = "#4488ff", intensity = 0.8, falloff = 3.5, scale = 1.02 },
    ref
  ) => {
    return (
      <Atmosphere
        color={color}
        intensity={intensity}
        falloff={falloff}
        scale={scale}
      />
    );
  }
);

EarthAtmosphere.displayName = "Earth.Atmosphere";

/**
 * Clouds component - renders the cloud layer
 */
const EarthClouds = React.forwardRef<any, EarthCloudsProps>(
  ({ height = 1.005, opacity = 0.5, rotationSpeedMultiplier = 0.8 }, ref) => {
    const { cloudsMapUrl, rotationSpeed } = useEarth();

    if (!cloudsMapUrl) return null;

    return (
      <Clouds
        textureUrl={cloudsMapUrl}
        height={height}
        opacity={opacity}
        rotationSpeed={rotationSpeed * rotationSpeedMultiplier}
      />
    );
  }
);

EarthClouds.displayName = "Earth.Clouds";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const EarthAxis = React.forwardRef<any, { size?: number }>(({ size }, ref) => {
  const { radius } = useEarth();
  const axisSize = size ?? radius * 3;

  return <axesHelper ref={ref} args={[axisSize]} />;
});

EarthAxis.displayName = "Earth.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Earth = Object.assign(EarthRoot, {
  Root: EarthRoot,
  Canvas: EarthCanvas,
  Controls: EarthControls,
  Globe: EarthGlobe,
  Atmosphere: EarthAtmosphere,
  Clouds: EarthClouds,
  Axis: EarthAxis,
});

export { getCurrentDayOfYear };
