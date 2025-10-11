"use client";

import * as React from "react";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Sphere } from "./primitives/sphere";

// ============================================================================
// Constants - Astronomically Accurate Values
// ============================================================================

export const MERCURY_RADIUS_KM = 2439.7;
export const SCENE_SCALE = 0.001;
export const MERCURY_RADIUS = MERCURY_RADIUS_KM * SCENE_SCALE;
export const MERCURY_ROTATION_PERIOD_SECONDS = 5067360.0; // 58.6 days
export const MERCURY_ORBITAL_PERIOD_DAYS = 88;
export const MERCURY_AXIAL_TILT_DEG = 0.034; // Almost upright

// ============================================================================
// Context
// ============================================================================

interface MercuryContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const MercuryContext = React.createContext<MercuryContext | null>(null);

function useMercury() {
  const ctx = React.useContext(MercuryContext);
  if (!ctx) throw new Error("useMercury must be used within Mercury.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Props for Mercury.Root component
 * Root component that provides context for all Mercury sub-components
 */
export interface MercuryRootProps {
  /**
   * Texture URL for Mercury surface map
   * @example "/textures/mercury-surface.jpg"
   */
  textureUrl?: string;
  /**
   * Mercury radius in scene units
   * @default MERCURY_RADIUS (2.4397 scene units, representing 2439.7 km)
   * @example 2, 3, 5
   */
  radius?: number;
  /**
   * Enable automatic rotation based on Mercury's actual rotation period (58.6 days)
   * @default true
   */
  enableRotation?: boolean;
  /**
   * Time scale multiplier for rotation speed
   * 1 = real-time, 10 = 10x faster, 0.1 = 10x slower
   * @default 1
   * @range 0.1-1000
   * @example 1 (real-time), 10 (10x faster), 0.1 (10x slower)
   */
  timeScale?: number;
  /**
   * Overall brightness multiplier for lighting
   * @default 1.2
   * @range 0.0-2.0
   * @example 0.8 (dimmer), 1.5 (brighter)
   */
  brightness?: number;
  /**
   * Child components (Canvas, Globe, etc.)
   */
  children?: React.ReactNode;
}

/**
 * Props for Mercury.Canvas component
 * Three.js Canvas wrapper with camera configuration
 */
export interface MercuryCanvasProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Camera position in 3D space [x, y, z]
   * @default [0, 3, 10]
   * @example [0, 5, 15], [5, 3, 8]
   */
  cameraPosition?: [number, number, number];
  /**
   * Camera field of view in degrees
   * @default 45
   * @range 20-120
   * @example 35 (narrow), 60 (wide)
   */
  cameraFov?: number;
  /**
   * Canvas height (CSS value)
   * @default "600px"
   * @example "400px", "100vh", "50%"
   */
  height?: string;
  /**
   * Canvas width (CSS value)
   * @default "100%"
   * @example "800px", "100vw", "50%"
   */
  width?: string;
}

/**
 * Props for Mercury.Controls component
 * Orbit controls for camera manipulation
 */
export interface MercuryControlsProps extends Record<string, any> {
  /**
   * Minimum zoom distance from Mercury center
   * @default 5
   * @example 3, 7, 10
   */
  minDistance?: number;
  /**
   * Maximum zoom distance from Mercury center
   * @default 50
   * @example 30, 100, 200
   */
  maxDistance?: number;
  /**
   * Zoom speed multiplier
   * @default 0.6
   * @range 0.1-2.0
   */
  zoomSpeed?: number;
  /**
   * Pan speed multiplier
   * @default 0.5
   * @range 0.1-2.0
   */
  panSpeed?: number;
  /**
   * Rotation speed multiplier
   * @default 0.4
   * @range 0.1-2.0
   */
  rotateSpeed?: number;
  /**
   * Enable panning with right mouse button
   * @default true
   */
  enablePan?: boolean;
  /**
   * Enable zooming with mouse wheel
   * @default true
   */
  enableZoom?: boolean;
  /**
   * Enable rotation with left mouse button
   * @default true
   */
  enableRotate?: boolean;
  /**
   * Enable smooth camera damping
   * @default true
   */
  enableDamping?: boolean;
  /**
   * Damping inertia factor (lower = more damping)
   * @default 0.05
   * @range 0.01-0.3
   */
  dampingFactor?: number;
}

/**
 * Props for Mercury.Globe component
 * Main Mercury sphere with texture
 */
export interface MercuryGlobeProps extends Record<string, any> {
  /**
   * Number of segments for sphere geometry (higher = smoother)
   * @default 128
   * @range 32-256
   * @example 64 (lower detail), 256 (highest detail)
   */
  segments?: number;
  /**
   * Child components
   */
  children?: React.ReactNode;
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const MercuryRoot = React.forwardRef<HTMLDivElement, MercuryRootProps>(
  (
    {
      textureUrl,
      radius = MERCURY_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return (
        ((2 * Math.PI) / (MERCURY_ROTATION_PERIOD_SECONDS * 60)) * timeScale
      );
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(MERCURY_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: MercuryContext = React.useMemo(
      () => ({
        radius,
        rotationSpeed,
        axialTilt,
        brightness,
        timeScale,
        textureUrl,
      }),
      [radius, rotationSpeed, axialTilt, brightness, timeScale, textureUrl]
    );

    return (
      <MercuryContext.Provider value={contextValue}>
        <div ref={ref} className="mercury-root relative h-full w-full">
          {children}
        </div>
      </MercuryContext.Provider>
    );
  }
);

MercuryRoot.displayName = "Mercury.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const MercuryCanvas = React.forwardRef<HTMLDivElement, MercuryCanvasProps>(
  (
    {
      cameraPosition = [0, 3, 10],
      cameraFov = 45,
      height = "600px",
      width = "100%",
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { brightness } = useMercury();

    return (
      <div ref={ref} className={className} style={style} {...props}>
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
          <fog attach="fog" args={[0x000511, 50, 200]} />

          <Suspense fallback={null}>
            <ambientLight intensity={0.4 * brightness} />
            <directionalLight
              position={[10, 5, 10]}
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

MercuryCanvas.displayName = "Mercury.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const MercuryControls = React.forwardRef<any, MercuryControlsProps>(
  (
    {
      minDistance = 5,
      maxDistance = 50,
      zoomSpeed = 0.6,
      panSpeed = 0.5,
      rotateSpeed = 0.4,
      enablePan = true,
      enableZoom = true,
      enableRotate = true,
      enableDamping = true,
      dampingFactor = 0.05,
      ...props
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
        {...props}
      />
    );
  }
);

MercuryControls.displayName = "Mercury.Controls";

/**
 * Globe component - renders the main Mercury sphere
 */
const MercuryGlobe = React.forwardRef<any, MercuryGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useMercury();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#8c7853"}
        rotationSpeed={rotationSpeed}
        rotation={axialTilt}
        segments={segments}
        roughness={0.95}
        metalness={0.05}
        {...props}
      >
        {children}
      </Sphere>
    );
  }
);

MercuryGlobe.displayName = "Mercury.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const MercuryAxis = React.forwardRef<
  any,
  { size?: number } & Record<string, any>
>(({ size, ...props }, ref) => {
  const { radius } = useMercury();
  const axisSize = size ?? radius * 3;

  return <axesHelper ref={ref} args={[axisSize]} {...props} />;
});

MercuryAxis.displayName = "Mercury.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Mercury = Object.assign(MercuryRoot, {
  Root: MercuryRoot,
  Canvas: MercuryCanvas,
  Controls: MercuryControls,
  Globe: MercuryGlobe,
  Axis: MercuryAxis,
});
