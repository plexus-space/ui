"use client";

import * as React from "react";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Sphere, Ring } from "./primitives/sphere";

// ============================================================================
// Constants - Astronomically Accurate Values
// ============================================================================

export const SATURN_RADIUS_KM = 58232;
export const SCENE_SCALE = 0.001;
export const SATURN_RADIUS = SATURN_RADIUS_KM * SCENE_SCALE;
export const SATURN_ROTATION_PERIOD_SECONDS = 38520.0; // 10.7 hours
export const SATURN_ORBITAL_PERIOD_DAYS = 10759; // 29.5 years
export const SATURN_AXIAL_TILT_DEG = 26.7;
export const SATURN_RINGS_INNER_KM = 66900;
export const SATURN_RINGS_OUTER_KM = 136780;
export const SATURN_RINGS_INNER = SATURN_RINGS_INNER_KM * SCENE_SCALE;
export const SATURN_RINGS_OUTER = SATURN_RINGS_OUTER_KM * SCENE_SCALE;

// ============================================================================
// Context
// ============================================================================

interface SaturnContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
  ringsTextureUrl?: string;
  showRings: boolean;
}

const SaturnContext = React.createContext<SaturnContext | null>(null);

function useSaturn() {
  const ctx = React.useContext(SaturnContext);
  if (!ctx) throw new Error("useSaturn must be used within Saturn.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

export interface SaturnRootProps {
  /** Texture URL for Saturn surface map */
  textureUrl?: string;
  /** Texture URL for Saturn rings */
  ringsTextureUrl?: string;
  /** Saturn radius in scene units */
  radius?: number;
  /** Enable automatic rotation */
  enableRotation?: boolean;
  /** Time scale multiplier for rotation speed */
  timeScale?: number;
  /** Overall brightness multiplier */
  brightness?: number;
  /** Show Saturn's rings */
  showRings?: boolean;
  children?: React.ReactNode;
}

export interface SaturnCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
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

export interface SaturnControlsProps {
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

export interface SaturnGlobeProps {
  /** Number of segments for sphere geometry */
  segments?: number;
  children?: React.ReactNode;
}

export interface SaturnRingsProps {
  /** Opacity of the rings */
  opacity?: number;
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const SaturnRoot = React.forwardRef<HTMLDivElement, SaturnRootProps>(
  (
    {
      textureUrl,
      ringsTextureUrl,
      radius = SATURN_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.2,
      showRings = true,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (SATURN_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(SATURN_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: SaturnContext = React.useMemo(
      () => ({
        radius,
        rotationSpeed,
        axialTilt,
        brightness,
        timeScale,
        textureUrl,
        ringsTextureUrl,
        showRings,
      }),
      [radius, rotationSpeed, axialTilt, brightness, timeScale, textureUrl, ringsTextureUrl, showRings]
    );

    return (
      <SaturnContext.Provider value={contextValue}>
        <div ref={ref} className="saturn-root relative h-full w-full">
          {children}
        </div>
      </SaturnContext.Provider>
    );
  }
);

SaturnRoot.displayName = "Saturn.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const SaturnCanvas = React.forwardRef<HTMLDivElement, SaturnCanvasProps>(
  (
    {
      cameraPosition = [0, 30, 150],
      cameraFov = 45,
      height = "600px",
      width = "100%",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { brightness } = useSaturn();

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
            toneMappingExposure: 1.0,
          }}
        >
          <color attach="background" args={[0, 0, 0]} />

          <Suspense fallback={null}>
            <ambientLight intensity={0.4 * brightness} />
            <directionalLight
              position={[100, 50, 100]}
              intensity={2.0 * brightness}
              castShadow={false}
            />
            {children}
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

SaturnCanvas.displayName = "Saturn.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const SaturnControls = React.forwardRef<any, SaturnControlsProps>(
  (
    {
      minDistance = 70,
      maxDistance = 400,
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

SaturnControls.displayName = "Saturn.Controls";

/**
 * Globe component - renders the main Saturn sphere
 */
const SaturnGlobe = React.forwardRef<any, SaturnGlobeProps>(
  ({ segments = 128, children }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useSaturn();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#fad5a5"}
        rotationSpeed={rotationSpeed}
        rotation={axialTilt}
        segments={segments}
        roughness={0.7}
        metalness={0.1}
      >
        {children}
      </Sphere>
    );
  }
);

SaturnGlobe.displayName = "Saturn.Globe";

/**
 * Rings component - renders Saturn's iconic rings
 */
const SaturnRings = React.forwardRef<any, SaturnRingsProps>(
  ({ opacity = 0.7 }, ref) => {
    const { ringsTextureUrl, showRings } = useSaturn();

    if (!showRings) return null;

    return (
      <Ring
        innerRadius={SATURN_RINGS_INNER}
        outerRadius={SATURN_RINGS_OUTER}
        textureUrl={ringsTextureUrl}
        color="#c9b29b"
        opacity={opacity}
        rotation={[Math.PI / 2.2, 0, 0]}
      />
    );
  }
);

SaturnRings.displayName = "Saturn.Rings";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const SaturnAxis = React.forwardRef<any, { size?: number }>(({ size }, ref) => {
  const { radius } = useSaturn();
  const axisSize = size ?? radius * 3;

  return <axesHelper ref={ref} args={[axisSize]} />;
});

SaturnAxis.displayName = "Saturn.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Saturn = Object.assign(SaturnRoot, {
  Root: SaturnRoot,
  Canvas: SaturnCanvas,
  Controls: SaturnControls,
  Globe: SaturnGlobe,
  Rings: SaturnRings,
  Axis: SaturnAxis,
});
