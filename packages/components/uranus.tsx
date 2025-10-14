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

export const URANUS_RADIUS_KM = 25362;
export const SCENE_SCALE = 0.001;
export const URANUS_RADIUS = URANUS_RADIUS_KM * SCENE_SCALE;
export const URANUS_ROTATION_PERIOD_SECONDS = 62064.0; // 17.2 hours (retrograde)
export const URANUS_ORBITAL_PERIOD_DAYS = 30687; // 84 years
export const URANUS_AXIAL_TILT_DEG = 97.8; // On its side!

// ============================================================================
// Context
// ============================================================================

interface UranusContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const UranusContext = React.createContext<UranusContext | null>(null);

function useUranus() {
  const ctx = React.useContext(UranusContext);
  if (!ctx) throw new Error("useUranus must be used within Uranus.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Props for Uranus.Root component
 * Root component that provides context for all Uranus sub-components
 */
export interface UranusRootProps {
  /**
   * Texture URL for Uranus surface map
   * @example "/textures/uranus-surface.jpg"
   */
  textureUrl?: string;
  /**
   * Uranus radius in scene units
   * @default URANUS_RADIUS (25.362 scene units, representing 25362 km)
   * @example 20, 25, 30
   */
  radius?: number;
  /**
   * Enable automatic rotation based on Uranus's actual rotation period (17.2 hours, retrograde)
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
 * Props for Uranus.Canvas component
 * Three.js Canvas wrapper with camera configuration
 */
export interface UranusCanvasProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Camera position in 3D space [x, y, z]
   * @default [0, 5, 50]
   * @example [0, 10, 60], [10, 5, 40]
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
 * Props for Uranus.Controls component
 * Orbit controls for camera manipulation
 */
export interface UranusControlsProps extends Record<string, any> {
  /**
   * Minimum zoom distance from Uranus center
   * @default 30
   * @example 20, 35, 50
   */
  minDistance?: number;
  /**
   * Maximum zoom distance from Uranus center
   * @default 200
   * @example 150, 250, 300
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
 * Props for Uranus.Globe component
 * Main Uranus sphere with texture
 */
export interface UranusGlobeProps
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
const UranusRoot = React.forwardRef<HTMLDivElement, UranusRootProps>(
  (
    {
      textureUrl,
      radius = URANUS_RADIUS,
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
        ((2 * Math.PI) / (URANUS_ROTATION_PERIOD_SECONDS * 60)) * timeScale
      );
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(URANUS_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: UranusContext = React.useMemo(
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
      <UranusContext.Provider value={contextValue}>
        <div ref={ref} className="uranus-root relative h-full w-full">
          {children}
        </div>
      </UranusContext.Provider>
    );
  }
);

UranusRoot.displayName = "Uranus.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const UranusCanvas = React.forwardRef<HTMLDivElement, UranusCanvasProps>(
  (
    {
      cameraPosition = [0, 5, 50],
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
    const { brightness } = useUranus();

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

UranusCanvas.displayName = "Uranus.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const UranusControls = React.forwardRef<any, UranusControlsProps>(
  (
    {
      minDistance = 30,
      maxDistance = 200,
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

UranusControls.displayName = "Uranus.Controls";

/**
 * Globe component - renders the main Uranus sphere
 */
const UranusGlobe = React.forwardRef<any, UranusGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useUranus();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#4fd0e7"}
        rotationSpeed={rotationSpeed}
        rotation={axialTilt}
        segments={segments}
        roughness={0.7}
        metalness={0.1}
        {...props}
      >
        {children}
      </Sphere>
    );
  }
);

UranusGlobe.displayName = "Uranus.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const UranusAxis = React.forwardRef<
  any,
  { size?: number } & Record<string, any>
>(({ size, ...props }, ref) => {
  const { radius } = useUranus();
  const axisSize = size ?? radius * 3;

  return <axesHelper ref={ref} args={[axisSize]} {...props} />;
});

UranusAxis.displayName = "Uranus.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Uranus = Object.assign(UranusRoot, {
  Root: UranusRoot,
  Canvas: UranusCanvas,
  Controls: UranusControls,
  Globe: UranusGlobe,
  Axis: UranusAxis,
});
