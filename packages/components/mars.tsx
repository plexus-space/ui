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

export const MARS_RADIUS_KM = 3389.5;
export const SCENE_SCALE = 0.001;
export const MARS_RADIUS = MARS_RADIUS_KM * SCENE_SCALE;
export const MARS_ROTATION_PERIOD_SECONDS = 88642.0; // 24.6 hours
export const MARS_ORBITAL_PERIOD_DAYS = 687;
export const MARS_AXIAL_TILT_DEG = 25.2;

// ============================================================================
// Context
// ============================================================================

interface MarsContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const MarsContext = React.createContext<MarsContext | null>(null);

function useMars() {
  const ctx = React.useContext(MarsContext);
  if (!ctx) throw new Error("useMars must be used within Mars.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Props for Mars.Root component
 * Root component that provides context for all Mars sub-components
 */
export interface MarsRootProps {
  /**
   * Texture URL for Mars surface map
   * @example "/textures/mars-surface.jpg"
   */
  textureUrl?: string;
  /**
   * Mars radius in scene units
   * @default MARS_RADIUS (3.3895 scene units, representing 3389.5 km)
   * @example 3, 5, 10
   */
  radius?: number;
  /**
   * Enable automatic rotation based on Mars's actual rotation period (24.6 hours)
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
 * Props for Mars.Canvas component
 * Three.js Canvas wrapper with camera configuration
 */
export interface MarsCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Camera position in 3D space [x, y, z]
   * @default [0, 5, 20]
   * @example [0, 10, 30], [10, 5, 15]
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
 * Props for Mars.Controls component
 * Orbit controls for camera manipulation
 */
export interface MarsControlsProps {
  /**
   * Minimum zoom distance from Mars center
   * @default 8
   * @example 5, 10, 15
   */
  minDistance?: number;
  /**
   * Maximum zoom distance from Mars center
   * @default 100
   * @example 50, 200, 500
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
 * Props for Mars.Globe component
 * Main Mars sphere with texture
 */
export interface MarsGlobeProps
  extends Omit<React.ComponentPropsWithRef<typeof Sphere>, 'radius' | 'textureUrl' | 'color' | 'rotationSpeed' | 'rotation' | 'segments' | 'roughness' | 'metalness'> {
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
const MarsRoot = React.forwardRef<HTMLDivElement, MarsRootProps>(
  (
    {
      textureUrl,
      radius = MARS_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (MARS_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(MARS_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: MarsContext = React.useMemo(
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
      <MarsContext.Provider value={contextValue}>
        <div ref={ref} className="mars-root relative h-full w-full">
          {children}
        </div>
      </MarsContext.Provider>
    );
  }
);

MarsRoot.displayName = "Mars.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const MarsCanvas = React.forwardRef<HTMLDivElement, MarsCanvasProps>(
  (
    {
      cameraPosition = [0, 5, 20],
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
    const { brightness } = useMars();

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

MarsCanvas.displayName = "Mars.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const MarsControls = React.forwardRef<any, MarsControlsProps>(
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

MarsControls.displayName = "Mars.Controls";

/**
 * Globe component - renders the main Mars sphere
 */
const MarsGlobe = React.forwardRef<any, MarsGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useMars();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#cd5c5c"}
        rotationSpeed={rotationSpeed}
        rotation={axialTilt}
        segments={segments}
        roughness={0.9}
        metalness={0.1}
        {...props}
      >
        {children}
      </Sphere>
    );
  }
);

MarsGlobe.displayName = "Mars.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const MarsAxis = React.forwardRef<any, { size?: number }>(
  ({ size, ...props }, ref) => {
    const { radius } = useMars();
    const axisSize = size ?? radius * 3;

    return <axesHelper ref={ref} args={[axisSize]} {...props} />;
  }
);

MarsAxis.displayName = "Mars.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Mars = Object.assign(MarsRoot, {
  Root: MarsRoot,
  Canvas: MarsCanvas,
  Controls: MarsControls,
  Globe: MarsGlobe,
  Axis: MarsAxis,
});
