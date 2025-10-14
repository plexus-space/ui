"use client";

import * as React from "react";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Sphere } from "./primitives/three/sphere";

// ============================================================================
// Constants - Astronomically Accurate Values
// ============================================================================

export const MOON_RADIUS_KM = 1737.4;
export const SCENE_SCALE = 0.001;
export const MOON_RADIUS = MOON_RADIUS_KM * SCENE_SCALE;
export const MOON_ROTATION_PERIOD_SECONDS = 2360592.0; // 27.3 days (tidally locked)
export const MOON_ORBITAL_PERIOD_DAYS = 27.3;
export const MOON_AXIAL_TILT_DEG = 6.7;

// ============================================================================
// Context
// ============================================================================

interface MoonContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const MoonContext = React.createContext<MoonContext | null>(null);

function useMoon() {
  const ctx = React.useContext(MoonContext);
  if (!ctx) throw new Error("useMoon must be used within Moon.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Props for Moon.Root component
 * Root component that provides context for all Moon sub-components
 */
export interface MoonRootProps {
  /**
   * Texture URL for Moon surface map
   * @example "/textures/moon-surface.jpg"
   */
  textureUrl?: string;
  /**
   * Moon radius in scene units
   * @default MOON_RADIUS (1.7374 scene units, representing 1737.4 km)
   * @example 1.5, 2, 3
   */
  radius?: number;
  /**
   * Enable automatic rotation based on Moon's actual rotation period (27.3 days, tidally locked)
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
 * Props for Moon.Canvas component
 * Three.js Canvas wrapper with camera configuration
 */
export interface MoonCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Camera position in 3D space [x, y, z]
   * @default [0, 2, 8]
   * @example [0, 3, 10], [3, 2, 6]
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
 * Props for Moon.Controls component
 * Orbit controls for camera manipulation
 */
export interface MoonControlsProps extends React.ComponentPropsWithoutRef<any> {
  /**
   * Minimum zoom distance from Moon center
   * @default 3
   * @example 2, 4, 5
   */
  minDistance?: number;
  /**
   * Maximum zoom distance from Moon center
   * @default 30
   * @example 20, 50, 100
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
 * Props for Moon.Globe component
 * Main Moon sphere with texture
 */
export interface MoonGlobeProps
  extends Omit<
    React.ComponentPropsWithRef<typeof Sphere>,
    | "radius"
    | "textureUrl"
    | "color"
    | "rotationSpeed"
    | "rotation"
    | "segments"
    | "roughness"
    | "metalness"
  > {
  /**
   * Number of segments for sphere geometry (higher = smoother)
   * @default 128
   * @range 32-256
   * @example 64 (lower detail), 256 (highest detail)
   */
  segments?: number;
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const MoonRoot = React.forwardRef<HTMLDivElement, MoonRootProps>(
  (
    {
      textureUrl,
      radius = MOON_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (MOON_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(MOON_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: MoonContext = React.useMemo(
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
      <MoonContext.Provider value={contextValue}>
        <div ref={ref} className="moon-root relative h-full w-full">
          {children}
        </div>
      </MoonContext.Provider>
    );
  }
);

MoonRoot.displayName = "Moon.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const MoonCanvas = React.forwardRef<HTMLDivElement, MoonCanvasProps>(
  (
    {
      cameraPosition = [0, 2, 8],
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
    const { brightness } = useMoon();

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

MoonCanvas.displayName = "Moon.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const MoonControls = React.forwardRef<any, MoonControlsProps>(
  (
    {
      minDistance = 3,
      maxDistance = 30,
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

MoonControls.displayName = "Moon.Controls";

/**
 * Globe component - renders the main Moon sphere
 */
const MoonGlobe = React.forwardRef<any, MoonGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useMoon();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#aaaaaa"}
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

MoonGlobe.displayName = "Moon.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
export interface MoonAxisProps extends React.ComponentPropsWithoutRef<any> {
  size?: number;
}

const MoonAxis = React.forwardRef<any, MoonAxisProps>(
  ({ size, ...props }, ref) => {
    const { radius } = useMoon();
    const axisSize = size ?? radius * 3;

    return <axesHelper ref={ref} args={[axisSize]} {...props} />;
  }
);

MoonAxis.displayName = "Moon.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Moon = Object.assign(MoonRoot, {
  Root: MoonRoot,
  Canvas: MoonCanvas,
  Controls: MoonControls,
  Globe: MoonGlobe,
  Axis: MoonAxis,
});
