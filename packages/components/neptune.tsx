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

export const NEPTUNE_RADIUS_KM = 24622;
export const SCENE_SCALE = 0.001;
export const NEPTUNE_RADIUS = NEPTUNE_RADIUS_KM * SCENE_SCALE;
export const NEPTUNE_ROTATION_PERIOD_SECONDS = 57600.0; // 16 hours
export const NEPTUNE_ORBITAL_PERIOD_DAYS = 60190; // 164.8 years
export const NEPTUNE_AXIAL_TILT_DEG = 28.3;

// ============================================================================
// Context
// ============================================================================

interface NeptuneContext {
  radius: number;
  rotationSpeed: number;
  axialTilt: [number, number, number];
  brightness: number;
  timeScale: number;
  textureUrl?: string;
}

const NeptuneContext = React.createContext<NeptuneContext | null>(null);

function useNeptune() {
  const ctx = React.useContext(NeptuneContext);
  if (!ctx) throw new Error("useNeptune must be used within Neptune.Root");
  return ctx;
}

// ============================================================================
// Types
// ============================================================================

/**
 * Props for Neptune.Root component
 * Root component that provides context for all Neptune sub-components
 */
export interface NeptuneRootProps {
  /**
   * Texture URL for Neptune surface map
   * @example "/textures/neptune-surface.jpg"
   */
  textureUrl?: string;
  /**
   * Neptune radius in scene units
   * @default NEPTUNE_RADIUS (24.622 scene units, representing 24622 km)
   * @example 20, 25, 30
   */
  radius?: number;
  /**
   * Enable automatic rotation based on Neptune's actual rotation period (16 hours)
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
   * @default 1.3
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
 * Props for Neptune.Canvas component
 * Three.js Canvas wrapper with camera configuration
 */
export interface NeptuneCanvasProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Camera position in 3D space [x, y, z]
   * @default [0, 30, 100]
   * @example [0, 40, 120], [30, 30, 80]
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
 * Props for Neptune.Controls component
 * Orbit controls for camera manipulation
 */
export interface NeptuneControlsProps
  extends Omit<
    React.ComponentProps<typeof OrbitControls>,
    keyof {
      minDistance?: number;
      maxDistance?: number;
      zoomSpeed?: number;
      panSpeed?: number;
      rotateSpeed?: number;
      enablePan?: boolean;
      enableZoom?: boolean;
      enableRotate?: boolean;
      enableDamping?: boolean;
      dampingFactor?: number;
    }
  > {
  /**
   * Minimum zoom distance from Neptune center
   * @default 30
   * @example 20, 35, 50
   */
  minDistance?: number;
  /**
   * Maximum zoom distance from Neptune center
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
 * Props for Neptune.Globe component
 * Main Neptune sphere with texture
 */
export interface NeptuneGlobeProps
  extends Omit<React.ComponentPropsWithRef<typeof Sphere>, 'radius' | 'textureUrl' | 'color' | 'rotationSpeed' | 'rotation' | 'segments' | 'roughness' | 'metalness'> {
  /**
   * Number of segments for sphere geometry (higher = smoother)
   * @default 128
   * @range 32-256
   * @example 64 (lower detail), 256 (highest detail)
   */
  segments?: number;
}

/**
 * Props for Neptune.Axis component
 * Axis helper for debugging (shows coordinate axes)
 */
export interface NeptuneAxisProps {
  /**
   * Size of the axis helper
   * @default radius * 3
   * @example 50, 100, 150
   */
  size?: number;
}

// ============================================================================
// Primitives
// ============================================================================

/**
 * Root component - provides context for all child components
 */
const NeptuneRoot = React.forwardRef<HTMLDivElement, NeptuneRootProps>(
  (
    {
      textureUrl,
      radius = NEPTUNE_RADIUS,
      enableRotation = true,
      timeScale = 1,
      brightness = 1.3,
      children,
    },
    ref
  ) => {
    const rotationSpeed = React.useMemo(() => {
      if (!enableRotation) return 0;
      return (
        ((2 * Math.PI) / (NEPTUNE_ROTATION_PERIOD_SECONDS * 60)) * timeScale
      );
    }, [enableRotation, timeScale]);

    const axialTilt: [number, number, number] = React.useMemo(
      () => [0, 0, THREE.MathUtils.degToRad(NEPTUNE_AXIAL_TILT_DEG)],
      []
    );

    const contextValue: NeptuneContext = React.useMemo(
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
      <NeptuneContext.Provider value={contextValue}>
        <div ref={ref} className="neptune-root relative h-full w-full">
          {children}
        </div>
      </NeptuneContext.Provider>
    );
  }
);

NeptuneRoot.displayName = "Neptune.Root";

/**
 * Canvas component - wraps the Three.js canvas
 */
const NeptuneCanvas = React.forwardRef<HTMLDivElement, NeptuneCanvasProps>(
  (
    {
      cameraPosition = [0, 30, 100],
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
    const { brightness } = useNeptune();

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

NeptuneCanvas.displayName = "Neptune.Canvas";

/**
 * Controls component - adds orbit controls to the scene
 */
const NeptuneControls = React.forwardRef<any, NeptuneControlsProps>(
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

NeptuneControls.displayName = "Neptune.Controls";

/**
 * Globe component - renders the main Neptune sphere
 */
const NeptuneGlobe = React.forwardRef<any, NeptuneGlobeProps>(
  ({ segments = 128, children, ...props }, ref) => {
    const { radius, rotationSpeed, axialTilt, textureUrl } = useNeptune();

    return (
      <Sphere
        ref={ref}
        radius={radius}
        textureUrl={textureUrl}
        color={textureUrl ? "#ffffff" : "#4166f5"}
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

NeptuneGlobe.displayName = "Neptune.Globe";

/**
 * Axis helper component - shows coordinate axes (for debugging)
 */
const NeptuneAxis = React.forwardRef<any, NeptuneAxisProps>(
  ({ size, ...props }, ref) => {
    const { radius } = useNeptune();
    const axisSize = size ?? radius * 3;

    return <axesHelper ref={ref} args={[axisSize]} {...props} />;
  }
);

NeptuneAxis.displayName = "Neptune.Axis";

// ============================================================================
// Exports
// ============================================================================

export const Neptune = Object.assign(NeptuneRoot, {
  Root: NeptuneRoot,
  Canvas: NeptuneCanvas,
  Controls: NeptuneControls,
  Globe: NeptuneGlobe,
  Axis: NeptuneAxis,
});
