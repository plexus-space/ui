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

export const VENUS_RADIUS_KM = 6051.8;
export const SCENE_SCALE = 0.001;
export const VENUS_RADIUS = VENUS_RADIUS_KM * SCENE_SCALE;
export const VENUS_ROTATION_PERIOD_SECONDS = 20995200.0; // 243 days (retrograde)
export const VENUS_ORBITAL_PERIOD_DAYS = 224.7;
export const VENUS_AXIAL_TILT_DEG = 177.4; // Retrograde rotation

// ============================================================================
// Context
// ============================================================================

interface VenusContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const VenusContext = React.createContext<VenusContext | null>(null);

function useVenus() {
  const ctx = React.useContext(VenusContext);
  if (!ctx) throw new Error("useVenus must be used within Venus.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Props for Venus.Root component
 * Root component that provides context for all Venus sub-components
 */
export interface VenusRootProps {
  /**
   * Texture URL for Venus surface map
   * @example "/textures/venus-surface.jpg"
   */
  textureUrl?: string;
  /**
   * Venus radius in scene units
   * @default VENUS_RADIUS (6.0518 scene units, representing 6051.8 km)
   * @example 5, 6, 8
   */
  radius?: number;
  /**
   * Enable automatic rotation based on Venus's actual rotation period (243 days, retrograde)
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
 * Props for Venus.Canvas component
 * Three.js Canvas wrapper with camera configuration
 */
export interface VenusCanvasProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Camera position in 3D space [x, y, z]
   * @default [0, 5, 20]
   * @example [0, 8, 25], [5, 5, 15]
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
 * Props for Venus.Controls component
 * Orbit controls for camera manipulation
 */
export interface VenusControlsProps {
  /**
   * Minimum zoom distance from Venus center
   * @default 8
   * @example 5, 10, 15
   */
  minDistance?: number;
  /**
   * Maximum zoom distance from Venus center
   * @default 100
   * @example 50, 150, 200
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
 * Props for Venus.Globe component
 * Main Venus sphere with texture
 */
export interface VenusGlobeProps
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
const VenusRoot = React.forwardRef<HTMLDivElement, VenusRootProps>(
  (
    {
      textureUrl,
      radius = VENUS_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.2,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return ((2 * Math.PI) / (VENUS_ROTATION_PERIOD_SECONDS * 60)) * timeScale;
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(VENUS_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: VenusContext = React.useMemo(
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
      <VenusContext.Provider value={contextValue}>
        <div ref={ref} className="venus-root relative h-full w-full">
          {children}
        </div>
      </VenusContext.Provider>
    );
  }
);

VenusRoot.displayName = "Venus.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const VenusCanvas = React.forwardRef<HTMLDivElement, VenusCanvasProps>(
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
    const { brightness } = useVenus();

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

VenusCanvas.displayName = "Venus.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const VenusControls = React.forwardRef<any, VenusControlsProps>(
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

VenusControls.displayName = "Venus.Controls";

/**
 * Globe component - renders the main Venus sphere
 */
const VenusGlobe = React.forwardRef<any, VenusGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useVenus();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#ffc649"}
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

VenusGlobe.displayName = "Venus.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const VenusAxis = React.forwardRef<any, { size?: number; [key: string]: any }>(
  ({ size, ...props }, ref) => {
    const { radius } = useVenus();
    const axisSize = size ?? radius * 3;

    return <axesHelper ref={ref} args={[axisSize]} {...props} />;
  }
);

VenusAxis.displayName = "Venus.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Venus = Object.assign(VenusRoot, {
  Root: VenusRoot,
  Canvas: VenusCanvas,
  Controls: VenusControls,
  Globe: VenusGlobe,
  Axis: VenusAxis,
});
