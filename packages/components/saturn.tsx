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

/**
 * Props for Saturn.Root component
 * Root component that provides context for all Saturn sub-components
 */
export interface SaturnRootProps {
  /**
   * Texture URL for Saturn surface map
   * @example "/textures/saturn-surface.jpg"
   */
  textureUrl?: string;
  /**
   * Texture URL for Saturn rings
   * @example "/textures/saturn-rings.png"
   */
  ringsTextureUrl?: string;
  /**
   * Saturn radius in scene units
   * @default SATURN_RADIUS (58.232 scene units, representing 58232 km)
   * @example 50, 60, 80
   */
  radius?: number;
  /**
   * Enable automatic rotation based on Saturn's actual rotation period (10.7 hours)
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
   * Show Saturn's rings
   * @default true
   */
  showRings?: boolean;
  /**
   * Child components (Canvas, Globe, etc.)
   */
  children?: React.ReactNode;
}

/**
 * Props for Saturn.Canvas component
 * Three.js Canvas wrapper with camera configuration
 */
export interface SaturnCanvasProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Camera position in 3D space [x, y, z]
   * @default [0, 30, 150]
   * @example [0, 50, 180], [30, 30, 120]
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
 * Props for Saturn.Controls component
 * Orbit controls for camera manipulation
 */
export interface SaturnControlsProps {
  /**
   * Minimum zoom distance from Saturn center
   * @default 70
   * @example 50, 80, 100
   */
  minDistance?: number;
  /**
   * Maximum zoom distance from Saturn center
   * @default 400
   * @example 300, 500, 600
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
 * Props for Saturn.Globe component
 * Main Saturn sphere with texture
 */
export interface SaturnGlobeProps
  extends React.ComponentPropsWithoutRef<"group"> {
  /**
   * Number of segments for sphere geometry (higher = smoother)
   * @default 128
   * @range 32-256
   * @example 64 (lower detail), 256 (highest detail)
   */
  segments?: number;
}

/**
 * Props for Saturn.Rings component
 * Saturn's iconic ring system
 */
export interface SaturnRingsProps
  extends React.ComponentPropsWithoutRef<"group"> {
  /**
   * Opacity of the rings
   * @default 0.7
   * @range 0.0-1.0
   * @example 0.5 (more transparent), 0.9 (more opaque)
   */
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
      return (
        ((2 * Math.PI) / (SATURN_ROTATION_PERIOD_SECONDS * 60)) * timeScale
      );
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
      [
        radius,
        rotationSpeed,
        axialTilt,
        brightness,
        timeScale,
        textureUrl,
        ringsTextureUrl,
        showRings,
      ]
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
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { brightness } = useSaturn();

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

SaturnControls.displayName = "Saturn.Controls";

/**
 * Globe component - renders the main Saturn sphere
 */
const SaturnGlobe = React.forwardRef<any, SaturnGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useSaturn();

    // Extract rotation from props to avoid type conflicts
    const { rotation: _rotation, ...sphereProps } = props as any;

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
        {...sphereProps}
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
  ({ opacity = 0.7, ...props }, ref) => {
    const { ringsTextureUrl, showRings } = useSaturn();

    if (!showRings) return null;

    const ringRotation: [number, number, number] = [Math.PI / 2.2, 0, 0];

    // Extract rotation from props to avoid type conflicts
    const { rotation: _rotation, ...ringProps } = props as any;

    return (
      <Ring
        ref={ref}
        innerRadius={SATURN_RINGS_INNER}
        outerRadius={SATURN_RINGS_OUTER}
        textureUrl={ringsTextureUrl}
        color="#c9b29b"
        opacity={opacity}
        rotation={ringRotation}
        {...ringProps}
      />
    );
  }
);

SaturnRings.displayName = "Saturn.Rings";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
export interface SaturnAxisProps
  extends React.ComponentPropsWithoutRef<"group"> {
  /** Size of the axis helper */
  size?: number;
}

const SaturnAxis = React.forwardRef<any, SaturnAxisProps>(
  ({ size, ...props }, ref) => {
    const { radius } = useSaturn();
    const axisSize = size ?? radius * 3;

    return <axesHelper ref={ref} args={[axisSize]} {...props} />;
  }
);

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
