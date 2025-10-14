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

export const JUPITER_RADIUS_KM = 69911;
export const SCENE_SCALE = 0.001;
export const JUPITER_RADIUS = JUPITER_RADIUS_KM * SCENE_SCALE;
export const JUPITER_ROTATION_PERIOD_SECONDS = 35730.0; // 9.9 hours (fastest rotation)
export const JUPITER_ORBITAL_PERIOD_DAYS = 4333; // 11.9 years
export const JUPITER_AXIAL_TILT_DEG = 3.1; // Nearly upright

// ============================================================================
// Context
// ============================================================================

interface JupiterContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const JupiterContext = React.createContext<JupiterContext | null>(null);

function useJupiter() {
  const ctx = React.useContext(JupiterContext);
  if (!ctx) throw new Error("useJupiter must be used within Jupiter.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Props for Jupiter.Root component
 * Root component that provides context for all Jupiter sub-components
 */
export interface JupiterRootProps {
  /**
   * Texture URL for Jupiter surface map
   * @example "/textures/jupiter-surface.jpg"
   */
  textureUrl?: string;
  /**
   * Jupiter radius in scene units
   * @default JUPITER_RADIUS (69.911 scene units, representing 69911 km)
   * @example 50, 70, 100
   */
  radius?: number;
  /**
   * Enable automatic rotation based on Jupiter's actual rotation period (9.9 hours, fastest rotation)
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
   * @default 1.1
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
 * Props for Jupiter.Canvas component
 * Three.js Canvas wrapper with camera configuration
 */
export interface JupiterCanvasProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Camera position in 3D space [x, y, z]
   * @default [0, 50, 200]
   * @example [0, 80, 250], [50, 50, 180]
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
 * Props for Jupiter.Controls component
 * Orbit controls for camera manipulation
 */
export interface JupiterControlsProps
  extends Omit<
    React.ComponentPropsWithRef<typeof OrbitControls>,
    keyof React.ComponentPropsWithRef<typeof OrbitControls>
  > {
  /**
   * Minimum zoom distance from Jupiter center
   * @default 80
   * @example 60, 100, 150
   */
  minDistance?: number;
  /**
   * Maximum zoom distance from Jupiter center
   * @default 500
   * @example 300, 700, 1000
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
 * Props for Jupiter.Globe component
 * Main Jupiter sphere with texture
 */
export interface JupiterGlobeProps
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
const JupiterRoot = React.forwardRef<HTMLDivElement, JupiterRootProps>(
  (
    {
      textureUrl,
      radius = JUPITER_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.1,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return (
        ((2 * Math.PI) / (JUPITER_ROTATION_PERIOD_SECONDS * 60)) * timeScale
      );
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(JUPITER_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: JupiterContext = React.useMemo(
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
      <JupiterContext.Provider value={contextValue}>
        <div ref={ref} className="jupiter-root relative h-full w-full">
          {children}
        </div>
      </JupiterContext.Provider>
    );
  }
);

JupiterRoot.displayName = "Jupiter.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const JupiterCanvas = React.forwardRef<HTMLDivElement, JupiterCanvasProps>(
  (
    {
      cameraPosition = [0, 50, 200],
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
    const { brightness } = useJupiter();

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

JupiterCanvas.displayName = "Jupiter.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const JupiterControls = React.forwardRef<any, JupiterControlsProps>(
  (
    {
      minDistance = 80,
      maxDistance = 500,
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
        {...props}
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

JupiterControls.displayName = "Jupiter.Controls";

/**
 * Globe component - renders the main Jupiter sphere
 */
const JupiterGlobe = React.forwardRef<any, JupiterGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useJupiter();

    return (
      <Sphere
        ref={ref}
        {...props}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#c88b3a"}
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

JupiterGlobe.displayName = "Jupiter.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
export interface JupiterAxisProps {
  size?: number;
}

const JupiterAxis = React.forwardRef<any, JupiterAxisProps>(
  ({ size, ...props }, ref) => {
    const { radius } = useJupiter();
    const axisSize = size ?? radius * 3;

    return <axesHelper ref={ref} args={[axisSize]} {...props} />;
  }
);

JupiterAxis.displayName = "Jupiter.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Jupiter = Object.assign(JupiterRoot, {
  Root: JupiterRoot,
  Canvas: JupiterCanvas,
  Controls: JupiterControls,
  Globe: JupiterGlobe,
  Axis: JupiterAxis,
});
